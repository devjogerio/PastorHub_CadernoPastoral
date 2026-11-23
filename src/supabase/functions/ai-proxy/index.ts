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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function erro(msg: string, status = 400): Response {
  return json({ ok: false, error: msg }, status);
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
  const resp = await fetch(`${cfg.base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${chaveDe(cfg.env)}` },
    body: JSON.stringify({
      model: modelo || cfg.modeloPadrao,
      temperature: temperatura,
      max_tokens: 1024,
      messages: [{ role: "system", content: sistema }].concat(mensagens),
    }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(textoDeErroProvedor(body, resp.status));
  const texto = body.choices?.[0]?.message?.content ?? "";
  return { texto: String(texto).trim(), usage: body.usage ?? null };
}

/* Google Gemini (generateContent) — chave via header x-goog-api-key, nunca na URL */
async function chatGemini(modelo: string, sistema: string, mensagens: Mensagem[], temperatura: number) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo || GEMINI.modeloPadrao)}:generateContent`;
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
  if (!resp.ok) throw new Error(textoDeErroProvedor(body, resp.status));
  const parts = body.candidates?.[0]?.content?.parts ?? [];
  return { texto: parts.map((p: any) => p.text || "").join("").trim(), usage: body.usageMetadata ?? null };
}

/* Anthropic Messages API — chave via header x-api-key */
async function chatAnthropic(modelo: string, sistema: string, mensagens: Mensagem[], temperatura: number) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": chaveDe(ANTHROPIC.env),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelo || ANTHROPIC.modeloPadrao,
      max_tokens: 1024,
      temperature,
      system: sistema,
      messages: mensagens.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    }),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(textoDeErroProvedor(body, resp.status));
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

async function processar(body: ProxyRequest): Promise<Response> {
  const acao = body.acao || "chat";
  if (acao === "whatsapp-test") return json(await testarWhatsApp(String(body.phoneId || "")));
  if (acao === "testar") return json(await testarProvedor(String(body.provedor || "")));

  const provedor = String(body.provedor || "");
  const mensagens = validarMensagens(body.mensagens);
  if (!provedor) return erro("Campo obrigatório: provedor");
  if (!mensagens) return erro("Campo 'mensagens' inválido (lista vazia, mais de 50 itens ou texto acima de 40 mil caracteres).");
  const temperatura = typeof body.temperatura === "number" ? body.temperatura : 0.3;
  const sistema = typeof body.sistema === "string" ? body.sistema : "";

  let resultado: { texto: string; usage: unknown };
  if (OPENAI_COMPAT[provedor]) resultado = await chatOpenAICompat(provedor, body.modelo || "", sistema, mensagens, temperatura);
  else if (provedor === "gemini") resultado = await chatGemini(body.modelo || "", sistema, mensagens, temperatura);
  else if (provedor === "anthropic") resultado = await chatAnthropic(body.modelo || "", sistema, mensagens, temperatura);
  else return erro(`Provedor não suportado: ${provedor}`);

  return json({ ok: true, provedor, modelo: body.modelo || "", texto: resultado.texto, usage: resultado.usage });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const user = await autenticar(req);
    if (!user) return erro("Não autorizado: faça login antes de usar o proxy de IA.", 401);
    const body = (await req.json().catch(() => ({}))) as ProxyRequest;
    return await processar(body);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno no proxy";
    return json({ ok: false, error: msg }, 500);
  }
});
