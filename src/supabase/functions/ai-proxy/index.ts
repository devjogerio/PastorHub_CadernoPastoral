// =============================================================================
// SUPABASE EDGE FUNCTION — ai-proxy
// -----------------------------------------------------------------------------
// Proxy servidor para APIs de IA (LLMs) e teste do WhatsApp Business.
// TODAS as chaves ficam só aqui (Deno.env / `supabase secrets`), nunca no
// navegador: o cliente chama esta função via supabase.functions.invoke.
//
// Deploy:  supabase functions deploy ai-proxy
// Secrets: supabase secrets set GROQ_API_KEY=... OPENAI_API_KEY=... etc.
//   (lista completa documentada no .env.example da raiz do projeto)
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* CORS restrito: apenas origens autorizadas pela variável de ambiente
   ALLOWED_ORIGIN (ex.: "https://devjogerio.github.io,https://pastorhub.app").
   Nenhum wildcard: o painel e o app público rodam em origens distintas. */
const origensPermitidas = (): string[] =>
  (Deno.env.get("ALLOWED_ORIGIN") || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

function ePermitida(origem: string | null): boolean {
  const permitidas = origensPermitidas();
  if (!origem) return false;
  if (permitidas.includes("*")) return true;
  const [origemAtual] = origem.split(",");
  try {
    const url = new URL(origemAtual.trim());
    if (url.username || url.password) return false;
    const permitidasUrls = permitidas.map((o) => {
      try { return new URL(o).origin; } catch { return null; }
    }).filter((o): o is string => !!o);
    return permitidasUrls.includes(url.origin);
  } catch {
    return false;
  }
}

/* Provedores OpenAI-compatíveis: endpoint base + secret com a chave + modelo padrão */
const OPENAI_COMPAT: Record<string, { base: string; env: string; modeloPadrao: string }> = {
  groq: { base: "https://api.groq.com/openai/v1", env: "GROQ_API_KEY", modeloPadrao: "llama-3.1-8b-instant" },
  openrouter: { base: "https://openrouter.ai/api/v1", env: "OPENROUTER_API_KEY", modeloPadrao: "meta-llama/llama-3.3-70b-instruct:free" },
  mistral: { base: "https://api.mistral.ai/v1", env: "MISTRAL_API_KEY", modeloPadrao: "mistral-small-latest" },
  together: { base: "https://api.together.xyz/v1", env: "TOGETHER_API_KEY", modeloPadrao: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  huggingface: { base: "https://router.huggingface.co/v1", env: "HUGGINGFACE_API_KEY", modeloPadrao: "meta-llama/Llama-3.1-8B-Instruct" },
  openai: { base: "https://api.openai.com/v1", env: "OPENAI_API_KEY", modeloPadrao: "gpt-4o-mini" },
};

const GEMINI = { modeloPadrao: "gemini-2.0-flash", env: "GOOGLE_API_KEY" };
const ANTHROPIC = { modeloPadrao: "claude-3-5-haiku-latest", env: "ANTHROPIC_API_KEY" };

/* Allowlist de modelos: o proxy só aceita modelos conhecidos do provedor,
   evitando que a requisição sobrescreva o destino da chave por um modelo pago
   ou arbitrário. */
const MODELOS: Record<string, string[]> = {
  groq: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "openai/gpt-oss-20b"],
  openrouter: ["meta-llama/llama-3.3-70b-instruct:free", "meta-llama/Llama-3.1-8B-Instruct:free", "openai/gpt-oss-20b:free"],
  mistral: ["mistral-small-latest", "mistralai/Mistral-7B-Instruct-v0.3"],
  together: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"],
  huggingface: ["meta-llama/Llama-3.1-8B-Instruct"],
  openai: ["gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"],
  gemini: ["gemini-2.0-flash"],
  anthropic: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"],
};

function modeloDo(provedor: string, pedido?: string): string {
  const lista = MODELOS[provedor];
  if (!lista) return MODELOS.openai[0];
  const escolhido = pedido && lista.includes(pedido) ? pedido : lista[0];
  return escolhido;
}

interface Mensagem { role: string; content: string }
interface ProxyRequest {
  acao?: string; // "chat" | "testar" | "whatsapp-test"
  provedor?: string;
  modelo?: string;
  sistema?: string;
  mensagens?: Mensagem[];
  temperatura?: number;
  phoneId?: string;
}

const MAX_MENSAGENS = 50;
const MAX_CARACTERES_TOTAL = 40000;

function cabecalhos(req: Request): Record<string, string> {
  const permitida = ePermitida(req.headers.get("origin"));
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Vary: "Origin",
  };
  if (permitida) {
    headers["Access-Control-Allow-Origin"] = req.headers.get("origin")!.split(",")[0].trim();
    headers["Access-Control-Allow-Headers"] = "authorization, x-client-info, apikey, content-type";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return headers;
}

function json(req: Request, corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: cabecalhos(req),
  });
}

function erro(req: Request, msg: string, status = 400): Response {
  return json(req, { ok: false, error: msg }, status);
}

/* Sanitiza as mensagens vindas do cliente: nunca confiar no formato nem no tamanho */
function validarMensagens(valor: unknown): Mensagem[] | null {
  if (!Array.isArray(valor) || !valor.length || valor.length > MAX_MENSAGENS) return null;
  const limpas = valor.map((m) => ({
    role: m && typeof m.role === "string" ? m.role : "user",
    content: m && typeof m.content === "string" ? m.content : "",
  }));
  const total = limpas.reduce((s, m) => s + m.content.length, 0);
  return total <= MAX_CARACTERES_TOTAL ? limpas : null;
}

/* Exige JWT válido do Supabase Auth em todas as chamadas (exceto OPTIONS) */
async function autenticar(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  return error || !user ? null : user;
}

/* Lê um secret do ambiente; falha clara se não estiver configurado */
function chaveDe(env: string): string {
  const v = Deno.env.get(env);
  if (!v) throw new Error(`Secret ${env} não configurado no servidor (use: supabase secrets set ${env}=...)`);
  return v;
}

function textoDeErroProvedor(body: any, status: number): string {
  const e = body && body.error;
  return (e && (e.message || e)) || (body && body.message) || `HTTP ${status} no provedor`;
}

/* Chat completion no formato OpenAI (Groq, OpenRouter, Mistral, Together, HF, OpenAI) */
async function chatOpenAICompat(provedor: string, modelo: string, sistema: string, mensagens: Mensagem[], temperatura: number) {
  const cfg = OPENAI_COMPAT[provedor];
  const lista = MODELOS[provedor] || MODELOS.openai;
  const modeloFinal = lista.includes(modelo) ? modelo : lista[0];
  const resp = await fetch(`${cfg.base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${chaveDe(cfg.env)}` },
    body: JSON.stringify({
      model: modeloFinal,
      temperature: Math.min(Math.max(temperatura, 0), 1),
      max_tokens: 1024,
      messages: [{ role: "system", content: sistema }].concat(mensagens),
    }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error("A IA recusou a requisição no momento (erro capturado pelo proxy).");
  const texto = body.choices?.[0]?.message?.content ?? "";
  return { texto: String(texto).trim(), usage: body.usage ?? null };
}

/* Google Gemini (generateContent) — chave via header x-goog-api-key, nunca na URL */
async function chatGemini(modelo: string, sistema: string, mensagens: Mensagem[], temperatura: number) {
  const lista = MODELOS.gemini;
  const modeloFinal = lista.includes(modelo) ? modelo : lista[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modeloFinal)}:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": chaveDe(GEMINI.env) },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      contents: mensagens.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature, maxOutputTokens: 1024 },
    }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error("A IA recusou a requisição no momento (erro capturado pelo proxy).");
  const parts = body.candidates?.[0]?.content?.parts ?? [];
  return { texto: parts.map((p: any) => p.text || "").join("").trim(), usage: body.usageMetadata ?? null };
}

/* Anthropic Messages API — chave via header x-api-key */
async function chatAnthropic(modelo: string, sistema: string, mensagens: Mensagem[], temperatura: number) {
  const lista = MODELOS.anthropic;
  const modeloFinal = lista.includes(modelo) ? modelo : lista[0];
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": chaveDe(ANTHROPIC.env),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modeloFinal,
      max_tokens: 1024,
      temperature,
      system: sistema,
      messages: mensagens.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error("A IA recusou a requisição no momento (erro capturado pelo proxy).");
  const texto = (body.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  return { texto: texto.trim(), usage: body.usage ?? null };
}

/* Teste de conexão dos provedores de IA, sempre do lado do servidor */
async function testarProvedor(provedor: string): Promise<{ ok: boolean; msg: string }> {
  if (OPENAI_COMPAT[provedor]) {
    const cfg = OPENAI_COMPAT[provedor];
    const resp = await fetch(`${cfg.base}/models`, { headers: { Authorization: `Bearer ${chaveDe(cfg.env)}` } });
    return resp.ok
      ? { ok: true, msg: `${provedor}: chave aceita pelo servidor (HTTP ${resp.status}).` }
      : { ok: false, msg: `${provedor}: servidor recusou a chave (HTTP ${resp.status}).` };
  }
  if (provedor === "gemini") {
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models", { headers: { "x-goog-api-key": chaveDe(GEMINI.env) } });
    return resp.ok ? { ok: true, msg: `gemini: chave aceita (HTTP ${resp.status}).` } : { ok: false, msg: `gemini: HTTP ${resp.status}.` };
  }
  if (provedor === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": chaveDe(ANTHROPIC.env), "anthropic-version": "2023-06-01" },
    });
    return resp.ok ? { ok: true, msg: `anthropic: chave aceita (HTTP ${resp.status}).` } : { ok: false, msg: `anthropic: HTTP ${resp.status}.` };
  }
  return { ok: false, msg: `Provedor não suportado para teste: ${provedor}` };
}

/* Teste do WhatsApp Business: o token vai SOMENTE no header Authorization, nunca na URL */
async function testarWhatsApp(phoneId: string): Promise<{ ok: boolean; msg: string }> {
  if (!phoneId) return { ok: false, msg: "Informe o Phone Number ID." };
  const resp = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(phoneId)}?fields=display_phone_number`, {
    headers: { Authorization: `Bearer ${chaveDe("WHATSAPP_TOKEN")}` },
  });
  if (!resp.ok) return { ok: false, msg: `Meta Graph respondeu HTTP ${resp.status}.` };
  const body = await resp.json();
  return { ok: true, msg: `WhatsApp OK: número ${body.display_phone_number || phoneId} confirmado via servidor.` };
}

async function processar(req: Request, body: ProxyRequest): Promise<Response> {
  const acao = body.acao || "chat";
  if (acao === "whatsapp-test") {
    const r = await testarWhatsApp(String(body.phoneId || ""));
    return json(req, { ok: r.ok, msg: r.msg }, r.ok ? 200 : 502);
  }
  if (acao === "testar") {
    const r = await testarProvedor(String(body.provedor || ""));
    return json(req, { ok: r.ok, msg: r.msg }, r.ok ? 200 : 502);
  }

  const provedor = String(body.provedor || "");
  const mensagens = validarMensagens(body.mensagens);
  if (!provedor) return erro(req, "Campo obrigatório: provedor");
  if (!mensagens) return erro(req, "Campo 'mensagens' inválido (lista vazia, mais de 50 itens ou texto acima de 40 mil caracteres).");
  const temperatura = typeof body.temperatura === "number" ? body.temperatura : 0.3;
  const sistema = typeof body.sistema === "string" ? body.sistema : "";

  let resultado: { texto: string; usage: unknown };
  if (OPENAI_COMPAT[provedor]) resultado = await chatOpenAICompat(provedor, body.modelo || "", sistema, mensagens, temperatura);
  else if (provedor === "gemini") resultado = await chatGemini(body.modelo || "", sistema, mensagens, temperatura);
  else if (provedor === "anthropic") resultado = await chatAnthropic(body.modelo || "", sistema, mensagens, temperatura);
  else return erro(req, "Provedor não suportado.");

  return json(req, { ok: true, provedor, modelo: body.modelo || "", texto: resultado.texto, usage: resultado.usage });
}

/* Rate limit simples por usuário autenticado: máx. 30 chamadas por minuto. */
const LIMITES = 30;
const janelas = new Map<string, number[]>();

function excessoRateLimit(chave: string): boolean {
  const agora = Date.now();
  const janela = (janelas.get(chave) || []).filter((t) => agora - t < 60_000);
  if (janela.length >= LIMITES) {
    janelas.set(chave, janela);
    return true;
  }
  janela.push(agora);
  janelas.set(chave, janela);
  return false;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    const h = cabecalhos(req);
    if (!h["Access-Control-Allow-Origin"]) return new Response("ok", { status: 204, headers: { "Content-Type": "text/plain" } });
    return new Response("ok", { headers: h });
  }
  try {
    const user = await autenticar(req);
    if (!user) return erro(req, "Não autorizado: faça login antes de usar o proxy de IA.", 401);
    if (excessoRateLimit(user.id)) return erro(req, "Muitas requisições. Aguarde alguns minutos.", 429);
    const body = (await req.json().catch(() => ({}))) as ProxyRequest;
    return await processar(req, body);
  } catch (e) {
    console.error("ai-proxy erro:", e);
    // Mensagem genérica: não vaza detalhes internos nem erros do provedor.
    return json(req, { ok: false, error: "Erro interno no proxy. Tente novamente em instantes." }, 500);
  }
});
