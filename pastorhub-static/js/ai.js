/* ============================================================
   Ecossistema de IA do PastorHub
   · Integrações com chaves de API (catálogo, teste real de conexão)
   · Provedores de LLM gratuitos e pagos (Llama, Gemini, GPT, Claude…)
   · Base de conhecimento RAG (upload de .md e .pdf, chunks, BM25)
   · Agentes que consultam a base e respondem com fontes
   Usado pelo painel admin e pelo app em todas as versões.
   ============================================================ */
(function () {
  const KEY_INTEGRACOES = 'pastorhub_integracoes';
  const KEY_DOCS = 'pastorhub_rag_documentos';
  const KEY_AGENTES = 'pastorhub_rag_agentes';
  const KEY_WEBHOOKS = 'pastorhub_webhooks';

  function lerJSON(chave, padrao) {
    try {
      const v = JSON.parse(localStorage.getItem(chave));
      return v == null ? padrao : v;
    } catch (e) { return padrao; }
  }

  function gravarJSON(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }
  }

  /* =========================================================
     CATÁLOGO DE INTEGRAÇÕES E PROVEDORES
     ========================================================= */
  const CATALOGO = [
    /* ---- Backend e app ---- */
    { id: 'supabase', nome: 'Supabase', grupo: 'Backend', icone: 'database', cor: '#3ecf8e',
      desc: 'Autenticação, banco PostgreSQL com RLS e Edge Functions',
      console: 'https://supabase.com/dashboard', teste: 'supabase',
      campos: [
        { k: 'url', rotulo: 'Project URL', ph: 'https://xxxx.supabase.co' },
        { k: 'chave', rotulo: 'anon public key', ph: 'eyJhbGciOi…', secreto: true },
      ] },
    { id: 'capacitor', nome: 'Capacitor · APK Android', grupo: 'Mobile', icone: 'box', cor: '#95C121',
      desc: 'Empacotamento Android do app (npm run build:mobile)',
      console: 'https://capacitorjs.com/docs/android', teste: 'nenhum',
      campos: [{ k: 'appId', rotulo: 'App ID', ph: 'com.pastorhub.app' }] },
    { id: 'sentry', nome: 'Sentry', grupo: 'Observabilidade', icone: 'activity', cor: '#362d59',
      desc: 'Monitoramento de erros e performance do app',
      console: 'https://sentry.io/settings/', teste: 'formato:dsn',
      campos: [{ k: 'dsn', rotulo: 'DSN', ph: 'https://chave@o0.ingest.sentry.io/0', secreto: true }] },

    /* ---- Agenda e comunicação ---- */
    { id: 'google-calendar', nome: 'Google Calendar', grupo: 'Agenda', icone: 'calendar', cor: '#4285f4',
      desc: 'Sincronização de eventos e compromissos',
      console: 'https://console.cloud.google.com/apis/credentials', teste: 'formato:google',
      campos: [
        { k: 'clientId', rotulo: 'OAuth Client ID', ph: '123-abc.apps.googleusercontent.com' },
        { k: 'chave', rotulo: 'Client secret', ph: 'GOCSPX-…', secreto: true, opcional: true },
      ] },
    { id: 'outlook', nome: 'Microsoft Outlook (Graph)', grupo: 'Agenda', icone: 'mail', cor: '#0078d4',
      desc: 'Calendário corporativo via Microsoft Graph',
      console: 'https://entra.microsoft.com/', teste: 'formato:guid',
      campos: [
        { k: 'clientId', rotulo: 'Application (client) ID', ph: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
        { k: 'tenant', rotulo: 'Tenant ID', ph: 'common', opcional: true },
      ] },
    { id: 'apple', nome: 'Apple Calendar (CalDAV)', grupo: 'Agenda', icone: 'calendar', cor: '#111827',
      desc: 'Agenda iOS/macOS via CalDAV com senha específica de app',
      console: 'https://account.apple.com/account/manage', teste: 'formato:apple',
      campos: [
        { k: 'usuario', rotulo: 'Apple ID', ph: 'pastor@icloud.com' },
        { k: 'chave', rotulo: 'Senha específica de app', ph: 'xxxx-xxxx-xxxx-xxxx', secreto: true },
      ] },
    { id: 'whatsapp', nome: 'WhatsApp Business API (Meta)', grupo: 'Comunicação', icone: 'message', cor: '#25d366',
      desc: 'Lembretes e confirmações de presença por WhatsApp',
      console: 'https://developers.facebook.com/apps/', teste: 'whatsapp',
      campos: [
        { k: 'chave', rotulo: 'Token de acesso permanente', ph: 'EAAG…', secreto: true },
        { k: 'phoneId', rotulo: 'Phone Number ID', ph: '1234567890' },
      ] },
    { id: 'meet', nome: 'Google Meet (API)', grupo: 'Comunicação', icone: 'video', cor: '#00897b',
      desc: 'Salas de tele-aconselhamento com transcrição',
      console: 'https://console.cloud.google.com/apis/library/meet.googleapis.com', teste: 'formato:google',
      campos: [
        { k: 'clientId', rotulo: 'OAuth Client ID', ph: '123-abc.apps.googleusercontent.com' },
        { k: 'chave', rotulo: 'Client secret', ph: 'GOCSPX-…', secreto: true, opcional: true },
      ] },

    /* ---- IA gratuitas (Llama e outros) ---- */
    { id: 'groq', nome: 'Groq · Llama 3', grupo: 'IA · gratuita', icone: 'zap', cor: '#f55036', ia: true, tipo: 'openai',
      gratuito: true, desc: 'Llama 3 em inferência rápida, com plano gratuito',
      base: 'https://api.groq.com/openai/v1', modeloPadrao: 'llama-3.1-8b-instant',
      modelos: ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'gemma2-9b-it'],
      console: 'https://console.groq.com/keys', teste: 'openai' },
    { id: 'openrouter', nome: 'OpenRouter · Llama (:free)', grupo: 'IA · gratuita', icone: 'zap', cor: '#6366f1', ia: true, tipo: 'openai',
      gratuito: true, desc: 'Agregador com modelos Llama e outros marcados como :free',
      base: 'https://openrouter.ai/api/v1', modeloPadrao: 'meta-llama/llama-3.3-70b-instruct:free',
      modelos: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-2-9b-it:free', 'mistralai/mistral-7b-instruct:free'],
      console: 'https://openrouter.ai/keys', teste: 'openai' },
    { id: 'gemini', nome: 'Google Gemini', grupo: 'IA · gratuita', icone: 'sparkles', cor: '#4285f4', ia: true, tipo: 'gemini',
      gratuito: true, desc: 'Gemini com cota gratuita no AI Studio',
      modeloPadrao: 'gemini-2.0-flash', modelos: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
      console: 'https://aistudio.google.com/app/apikey', teste: 'gemini' },
    { id: 'mistral', nome: 'Mistral AI', grupo: 'IA · gratuita', icone: 'sparkles', cor: '#fa520f', ia: true, tipo: 'openai',
      gratuito: true, desc: 'Modelos Mistral com plano gratuito (Experiment)',
      base: 'https://api.mistral.ai/v1', modeloPadrao: 'mistral-small-latest',
      modelos: ['mistral-small-latest', 'open-mistral-nemo', 'mistral-large-latest'],
      console: 'https://console.mistral.ai/api-keys', teste: 'openai' },
    { id: 'huggingface', nome: 'Hugging Face · Inference', grupo: 'IA · gratuita', icone: 'sparkles', cor: '#ffbd45', ia: true, tipo: 'openai',
      gratuito: true, desc: 'Llama e outros modelos abertos via router da Hugging Face',
      base: 'https://router.huggingface.co/v1', modeloPadrao: 'meta-llama/Llama-3.1-8B-Instruct',
      modelos: ['meta-llama/Llama-3.1-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3'],
      console: 'https://huggingface.co/settings/tokens', teste: 'huggingface' },
    { id: 'ollama', nome: 'Ollama · Llama local', grupo: 'IA · gratuita', icone: 'server', cor: '#111827', ia: true, tipo: 'openai',
      gratuito: true, local: true, desc: 'Llama rodando no seu computador ou servidor, sem custo por uso',
      baseFn: (c) => (c.url || 'http://localhost:11434').replace(/\/$/, '') + '/v1', modeloPadrao: 'llama3.1',
      modelos: ['llama3.1', 'llama3.2', 'mistral', 'qwen2.5'],
      console: 'https://ollama.com/download', teste: 'ollama',
      campos: [
        { k: 'url', rotulo: 'URL do servidor', ph: 'http://localhost:11434', padrao: 'http://localhost:11434' },
        { k: 'chave', rotulo: 'Chave (opcional)', ph: 'deixe em branco se não houver', secreto: true, opcional: true },
      ] },

    /* ---- IA pagas ---- */
    { id: 'openai', nome: 'OpenAI · GPT', grupo: 'IA · paga', icone: 'sparkles', cor: '#10a37f', ia: true, tipo: 'openai',
      gratuito: false, desc: 'GPT-4o e família, com cobrança por token',
      base: 'https://api.openai.com/v1', modeloPadrao: 'gpt-4o-mini', modelos: ['gpt-4o-mini', 'gpt-4o'],
      console: 'https://platform.openai.com/api-keys', teste: 'openai' },
    { id: 'anthropic', nome: 'Anthropic · Claude', grupo: 'IA · paga', icone: 'sparkles', cor: '#d97757', ia: true, tipo: 'anthropic',
      gratuito: false, desc: 'Claude para análise de textos longos e raciocínio',
      modeloPadrao: 'claude-3-5-haiku-latest', modelos: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest'],
      console: 'https://console.anthropic.com/settings/keys', teste: 'anthropic' },
    { id: 'together', nome: 'Together AI · Llama', grupo: 'IA · paga', icone: 'zap', cor: '#0f6fff', ia: true, tipo: 'openai',
      gratuito: false, desc: 'Llama 3 70B e outros modelos abertos hospedados',
      base: 'https://api.together.xyz/v1', modeloPadrao: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      modelos: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'meta-llama/Llama-3.1-8B-Instruct-Turbo'],
      console: 'https://api.together.ai/settings/api-keys', teste: 'openai' },
  ];

  // campos padrão dos provedores de IA em nuvem
  CATALOGO.forEach((p) => {
    if (!p.ia) return;
    if (!p.campos) {
      p.campos = [{ k: 'chave', rotulo: 'Chave de API', ph: 'cole a chave do provedor', secreto: true }];
    }
    p.campos.push({ k: 'modelo', rotulo: 'Modelo', ph: p.modeloPadrao, lista: p.modelos || [], opcional: true });
  });

  function provedor(id) { return CATALOGO.find((p) => p.id === id) || null; }

  /* ---------- Armazenamento das integrações ---------- */
  function obterIntegracao(id) { return lerJSON(KEY_INTEGRACOES, {})[id] || null; }

  function salvarIntegracao(id, dados) {
    const todas = lerJSON(KEY_INTEGRACOES, {});
    todas[id] = Object.assign({}, todas[id] || {}, dados);
    return gravarJSON(KEY_INTEGRACOES, todas);
  }

  function removerIntegracao(id) {
    const todas = lerJSON(KEY_INTEGRACOES, {});
    delete todas[id];
    return gravarJSON(KEY_INTEGRACOES, todas);
  }

  function temValor(c, k) { return !!(c && c[k] && String(c[k]).trim()); }

  function integracaoPronta(p) {
    const r = obterIntegracao(p.id);
    if (!r || !r.ativo || !r.campos) return false;
    if (p.ia && p.local) return true; // Ollama funciona com a URL padrão
    return p.campos.filter((c) => !c.opcional).every((c) => temValor(r.campos, c.k));
  }

  function statusIntegracao(p) {
    const r = obterIntegracao(p.id);
    const campos = (r && r.campos) || {};
    if (!Object.keys(campos).some((k) => temValor(campos, k))) return 'nao-configurada';
    if (!r.ativo) return 'pausada';
    return integracaoPronta(p) ? 'conectada' : 'incompleta';
  }

  function provedoresConfigurados() {
    return CATALOGO.filter((p) => p.ia && integracaoPronta(p));
  }

  /* ---------- Rede com tempo limite ---------- */
  async function comTimeout(url, opts, ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms || 15000);
    try { return await fetch(url, Object.assign({}, opts || {}, { signal: ctl.signal })); }
    finally { clearTimeout(t); }
  }

  async function requisicao(url, headers) {
    let resp;
    try {
      resp = await comTimeout(url, { method: 'GET', headers: headers || {} }, 15000);
    } catch (e) {
      return { ok: false, msg: 'Sem resposta do serviço (rede, CORS ou tempo esgotado). Verifique a URL e a conexão.' };
    }
    if (resp.status === 401 || resp.status === 403) {
      return { ok: false, msg: 'Chave recusada (HTTP ' + resp.status + '). Gere uma nova chave no console do provedor.' };
    }
    if (!resp.ok) return { ok: false, msg: 'Serviço respondeu com erro HTTP ' + resp.status + '.' };
    return { ok: true, msg: 'Conexão confirmada com o serviço (HTTP ' + resp.status + ').' };
  }

  function formato(valido, erro, ok) {
    return valido ? { ok: true, msg: ok } : { ok: false, msg: erro };
  }

  /* ---------- Teste de conexão (real quando o navegador permite) ---------- */
  async function testarIntegracao(p, campos) {
    const c = Object.assign({}, (obterIntegracao(p.id) || {}).campos || {}, campos || {});
    try {
      const t = p.teste;
      if (t === 'nenhum') return { ok: true, msg: 'Configuração salva. Este serviço não tem endpoint para teste no navegador.' };
      if (t === 'formato:dsn') return formato(/^https:\/\/[^@\s]+@[^/\s]+\/\d+$/.test(c.dsn || ''), 'DSN fora do formato https://chave@o0.ingest.sentry.io/projeto', 'DSN válido (formato conferido).');
      if (t === 'formato:google') return formato(/\.apps\.googleusercontent\.com$/.test(c.clientId || ''), 'Client ID deve terminar em .apps.googleusercontent.com', 'Client ID válido (formato conferido).');
      if (t === 'formato:guid') return formato(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.clientId || ''), 'Application ID deve estar no formato GUID', 'Application ID válido (formato conferido).');
      if (t === 'formato:apple') return formato(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.usuario || '') && (c.chave || '').length >= 8, 'Informe o Apple ID (e-mail) e a senha específica de app', 'Credenciais CalDAV preenchidas (formato conferido).');
      if (t === 'supabase') {
        if (!/^https:\/\/.+\.supabase\.co\/?$/.test(c.url || '')) return { ok: false, msg: 'Project URL deve ser https://<projeto>.supabase.co' };
        return requisicao(c.url.replace(/\/$/, '') + '/rest/v1/', { apikey: c.chave, Authorization: 'Bearer ' + c.chave });
      }
      if (t === 'whatsapp') {
        if (!c.phoneId || !c.chave) return { ok: false, msg: 'Informe o token e o Phone Number ID' };
        return requisicao('https://graph.facebook.com/v19.0/' + encodeURIComponent(c.phoneId) + '?fields=display_phone_number&access_token=' + encodeURIComponent(c.chave));
      }
      if (t === 'huggingface') return requisicao('https://huggingface.co/api/whoami-v2', { Authorization: 'Bearer ' + c.chave });
      if (t === 'gemini') return requisicao('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(c.chave || ''));
      if (t === 'anthropic') {
        return requisicao('https://api.anthropic.com/v1/models', {
          'x-api-key': c.chave || '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true',
        });
      }
      if (t === 'ollama') return requisicao((c.url || 'http://localhost:11434').replace(/\/$/, '') + '/api/tags');
      if (t === 'openai') {
        const base = p.baseFn ? p.baseFn(c) : p.base;
        const headers = c.chave ? { Authorization: 'Bearer ' + c.chave } : {};
        return requisicao(base + '/models', headers);
      }
      return { ok: false, msg: 'Teste não disponível para esta integração.' };
    } catch (e) {
      return { ok: false, msg: e.message || 'Falha inesperada no teste.' };
    }
  }

  /* =========================================================
     LLMs: chamada única para os três formatos de API
     ========================================================= */
  async function chamarLLM(id, opcoes) {
    const p = provedor(id);
    if (!p || !p.ia) throw new Error('Provedor de IA desconhecido: ' + id);
    const c = (obterIntegracao(id) || {}).campos || {};
    const modelo = opcoes.modelo || c.modelo || p.modeloPadrao;
    const sistema = opcoes.sistema || '';
    const mensagens = opcoes.mensagens || [];
    const temperature = opcoes.temperatura != null ? opcoes.temperatura : 0.3;

    if (p.tipo === 'gemini') {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(modelo) + ':generateContent?key=' + encodeURIComponent(c.chave || '');
      const resp = await comTimeout(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sistema }] },
          contents: mensagens.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          generationConfig: { temperature, maxOutputTokens: 1024 },
        }),
      }, 60000);
      const json = await lerRespostaLLM(resp);
      const parts = (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts) || [];
      return parts.map((x) => x.text || '').join('').trim();
    }

    if (p.tipo === 'anthropic') {
      const resp = await comTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'x-api-key': c.chave || '', 'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: modelo, max_tokens: 1024, temperature, system: sistema,
          messages: mensagens.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })) }),
      }, 60000);
      const json = await lerRespostaLLM(resp);
      return (json.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    }

    // OpenAI-compatível (Groq, OpenRouter, Mistral, Hugging Face, Together, OpenAI, Ollama)
    const base = p.baseFn ? p.baseFn(c) : p.base;
    const headers = { 'Content-Type': 'application/json' };
    if (c.chave) headers.Authorization = 'Bearer ' + c.chave;
    const resp = await comTimeout(base + '/chat/completions', {
      method: 'POST', headers,
      body: JSON.stringify({
        model: modelo, temperature, max_tokens: 1024,
        messages: [{ role: 'system', content: sistema }].concat(mensagens),
      }),
    }, 60000);
    const json = await lerRespostaLLM(resp);
    return String((json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || '').trim();
  }

  async function lerRespostaLLM(resp) {
    let json = {};
    try { json = await resp.json(); } catch (e) {}
    if (!resp.ok) {
      const msg = (json.error && (json.error.message || json.error)) || json.message || ('HTTP ' + resp.status);
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    return json;
  }

  /* =========================================================
     BASE DE CONHECIMENTO: documentos, chunks e extração
     ========================================================= */
  const COLECOES = [
    { id: 'geral', nome: 'Geral' },
    { id: 'sermoes', nome: 'Sermões' },
    { id: 'aconselhamento', nome: 'Aconselhamento' },
    { id: 'agenda', nome: 'Agenda e atendimentos' },
    { id: 'recursos', nome: 'Recursos pastorais' },
  ];

  function listarDocumentos() { return lerJSON(KEY_DOCS, []); }

  function salvarDocumentos(lista) {
    return gravarJSON(KEY_DOCS, lista);
  }

  function removerDocumento(id) {
    const restantes = listarDocumentos().filter((d) => d.id !== id);
    return salvarDocumentos(restantes);
  }

  function limparBaseRAG() { return salvarDocumentos([]); }

  // divide em trechos de ~alvo caracteres, respeitando parágrafos e títulos Markdown
  function dividirEmChunks(texto, alvo) {
    const tamanho = alvo || 900;
    const limpo = String(texto).replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const blocos = limpo.split(/\n\s*\n/);
    const chunks = [];
    let secao = 'Início';
    let atual = '';
    const fechar = () => {
      if (atual.trim().length > 40) chunks.push({ texto: atual.trim(), secao });
      atual = '';
    };
    blocos.forEach((bloco) => {
      const b = bloco.trim();
      if (!b) return;
      if (/^#{1,6}\s/.test(b)) {
        fechar();
        secao = b.split('\n')[0].replace(/^#{1,6}\s*/, '').replace(/[*_`]/g, '').trim().slice(0, 90) || secao;
      }
      const partes = b.length > tamanho * 1.5 ? b.split(/(?<=[.!?])\s+/) : [b];
      partes.forEach((parte) => {
        if (atual && (atual + '\n\n' + parte).length > tamanho) {
          const resto = atual.slice(-160);
          fechar();
          atual = resto;
        }
        atual += (atual ? '\n\n' : '') + parte;
      });
    });
    fechar();
    return chunks;
  }

  // ---------- PDF: pdf.js (quando há internet) com extração básica como alternativa ----------
  let pdfjsPromise = null;
  const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

  function carregarPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!pdfjsPromise) {
      pdfjsPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = PDFJS_BASE + 'pdf.min.js';
        s.onload = () => {
          if (!window.pdfjsLib) { reject(new Error('pdf.js indisponível')); return; }
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.js';
          resolve(window.pdfjsLib);
        };
        s.onerror = () => reject(new Error('Sem acesso ao pdf.js (CDN)'));
        document.head.appendChild(s);
      }).catch((e) => { pdfjsPromise = null; throw e; });
    }
    return pdfjsPromise;
  }

  function desescapar(s) {
    const mapa = { n: '\n', r: '\n', t: '\t', b: '', f: '', '(': '(', ')': ')', '\\': '\\' };
    return s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, c) => (mapa[c] !== undefined ? mapa[c] : String.fromCharCode(parseInt(c, 8))));
  }

  function textoDeOperadores(conteudo) {
    let out = '';
    const re = /\(((?:\\.|[^\\)])*)\)|(T\*|TD|Td|ET)(?=[\s\[(<]|$)/g;
    let m;
    while ((m = re.exec(conteudo))) {
      if (m[1] !== undefined) out += desescapar(m[1]);
      else out += '\n';
    }
    return out;
  }

  async function inflar(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function extrairPdfBasico(buffer) {
    const u8 = new Uint8Array(buffer);
    let bin = '';
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    const partes = [];
    let pos = 0;
    for (;;) {
      const ini = bin.indexOf('stream', pos);
      if (ini < 0) break;
      const dicionario = bin.slice(Math.max(0, ini - 600), ini);
      let inicio = ini + 6;
      if (bin[inicio] === '\r') inicio++;
      if (bin[inicio] === '\n') inicio++;
      const fim = bin.indexOf('endstream', inicio);
      if (fim < 0) break;
      pos = fim + 9;
      if (/\/Type\s*\/(XRef|ObjStm)/.test(dicionario)) continue;
      // usa o /Length do dicionário; sem ele, remove as quebras de linha antes de endstream
      const tamanhoInformado = (dicionario.match(/\/Length\s+(\d+)/) || [])[1];
      let fimDados = tamanhoInformado && inicio + Number(tamanhoInformado) <= fim ? inicio + Number(tamanhoInformado) : fim;
      if (fimDados === fim) while (fimDados > inicio && (u8[fimDados - 1] === 10 || u8[fimDados - 1] === 13)) fimDados--;
      let dados = u8.subarray(inicio, fimDados);
      if (/FlateDecode/.test(dicionario)) {
        try { dados = await inflar(dados); } catch (e) { continue; }
      }
      const texto = textoDeOperadores(new TextDecoder('latin1').decode(dados));
      // descarta fluxos binários (imagens, perfis de cor): texto de PDF é quase todo ASCII básico
      const imprimiveis = (texto.match(/[\x20-\x7e\n\r\t]/g) || []).length;
      if (texto.trim() && imprimiveis / texto.length > 0.85) partes.push(texto);
    }
    return partes.join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  // ---------- OCR: Tesseract.js (via CDN, precisa de internet) ----------
  let tessPromise = null;

  function carregarTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (!tessPromise) {
      tessPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = () => {
          if (window.Tesseract) resolve(window.Tesseract);
          else reject(new Error('Tesseract.js indisponível'));
        };
        s.onerror = () => reject(new Error('Sem internet para carregar o OCR (Tesseract.js via CDN)'));
        document.head.appendChild(s);
      }).catch((e) => { tessPromise = null; throw e; });
    }
    return tessPromise;
  }

  // reconhece texto em um canvas, com progresso (0..1) opcional
  async function ocrCanvas(canvas, onProgress) {
    const T = await carregarTesseract();
    const r = await T.recognize(canvas, 'por', {
      logger: (m) => {
        if (m && m.status === 'recognizing text' && typeof m.progress === 'number' && onProgress) onProgress(m.progress);
      },
    });
    return String((r.data && r.data.text) || '').trim();
  }

  function imagemParaCanvas(fonte, largura) {
    const canvas = document.createElement('canvas');
    const escala = largura ? Math.min(1, largura / fonte.width) : 1;
    canvas.width = Math.round(fonte.width * escala);
    canvas.height = Math.round(fonte.height * escala);
    canvas.getContext('2d').drawImage(fonte, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  // OCR nas páginas de um PDF digitalizado (renderiza com pdf.js e reconhece)
  async function extrairPdfOcr(file, opcoes) {
    const opts = opcoes || {};
    const lib = await carregarPdfJs();
    const pdf = await lib.getDocument({ data: (await file.arrayBuffer()).slice(0) }).promise;
    const limite = Math.min(pdf.numPages, opts.maxPaginas || 20);
    const partes = [];
    for (let p = 1; p <= limite; p++) {
      const pagina = await pdf.getPage(p);
      const viewport = pagina.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await pagina.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      if (opts.onProgress) opts.onProgress({ fase: 'ocr', pagina: p, total: limite, pct: 0 });
      const texto = await ocrCanvas(canvas, (pct) => {
        if (opts.onProgress) opts.onProgress({ fase: 'ocr', pagina: p, total: limite, pct });
      });
      if (texto) partes.push(texto);
      if (opts.onProgress) opts.onProgress({ fase: 'ocr', pagina: p + 1, total: limite, pct: 0 });
    }
    return {
      texto: partes.join('\n\n'),
      paginasOcr: limite,
      paginasTotal: pdf.numPages,
      truncado: limite < pdf.numPages,
    };
  }

  async function extrairTextoPDF(file, opcoes) {
    const opts = opcoes || {};
    const buffer = await file.arrayBuffer();
    let erroOcr = null;
    try {
      const lib = await carregarPdfJs();
      const pdf = await lib.getDocument({ data: buffer.slice(0) }).promise;
      let texto = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const pagina = await pdf.getPage(p);
        const conteudo = await pagina.getTextContent();
        texto += conteudo.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join('') + '\n\n';
      }
      if (texto.trim().length >= 20) return { texto, metodo: 'pdf.js', paginas: pdf.numPages };
      // PDF digitalizado (sem texto embutido): OCR página a página
      const ocr = await extrairPdfOcr(file, opts);
      if (ocr.texto.trim().length >= 20) {
        return {
          texto: ocr.texto, metodo: 'pdf.js + OCR (Tesseract.js, pt-BR)',
          paginas: ocr.paginasTotal, ocr: true, paginasOcr: ocr.paginasOcr, truncado: ocr.truncado,
        };
      }
    } catch (e) {
      erroOcr = e;
    }
    const basico = await extrairPdfBasico(buffer);
    if (basico.trim().length >= 20) return { texto: basico, metodo: 'extração básica (sem pdf.js)', paginas: null };
    if (erroOcr) throw new Error('OCR do PDF falhou: ' + (erroOcr.message || erroOcr));
    throw new Error('Não foi possível extrair texto deste PDF');
  }

  // OCR direto em imagens (.png, .jpg, .webp)
  async function extrairTextoImagem(file, opcoes) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error('Não foi possível abrir a imagem'));
        im.src = url;
      });
      const canvas = imagemParaCanvas(img);
      if (opcoes && opcoes.onProgress) opcoes.onProgress({ fase: 'ocr-imagem', pagina: 1, total: 1, pct: 0 });
      const texto = await ocrCanvas(canvas, (pct) => {
        if (opcoes && opcoes.onProgress) opcoes.onProgress({ fase: 'ocr-imagem', pagina: 1, total: 1, pct });
      });
      return { texto, metodo: 'OCR (Tesseract.js, pt-BR)', ocr: true };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // ---------- Ingestão de arquivo (.md, .txt, .pdf e imagens com OCR) ----------
  async function ingerirArquivo(file, colecao, opcoes) {
    const nome = file.name;
    const ext = (nome.split('.').pop() || '').toLowerCase();
    let texto;
    let metodo;
    let paginas = null;
    const extras = {};
    if (ext === 'pdf') {
      const r = await extrairTextoPDF(file, opcoes);
      texto = r.texto; metodo = r.metodo; paginas = r.paginas;
      if (r.ocr) { extras.ocr = true; extras.paginasOcr = r.paginasOcr; extras.truncado = r.truncado; }
    } else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
      const r = await extrairTextoImagem(file, opcoes);
      texto = r.texto; metodo = r.metodo; extras.ocr = true;
    } else if (ext === 'md' || ext === 'markdown' || ext === 'txt') {
      texto = await file.text();
      metodo = ext === 'txt' ? 'texto puro' : 'markdown';
    } else {
      throw new Error('Formato não suportado: .' + ext + ' (use .md, .pdf ou imagem para OCR)');
    }
    if (!texto || texto.trim().length < 20) {
      throw new Error('Não foi possível extrair texto de "' + nome + '"' +
        (ext === 'pdf' && !extras.ocr ? ' — o PDF pode ser digitalizado (use a versão com internet para ativar o OCR)' :
         extras.ocr ? ' — o OCR não encontrou texto legível (imagem com pouca resolução ou idioma diferente)' : ''));
    }
    const chunks = dividirEmChunks(texto);
    const doc = {
      id: 'doc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome, tipo: ext, metodo, paginas,
      colecao: colecao || 'geral',
      criadoEm: new Date().toISOString(),
      tamanho: file.size,
      caracteres: texto.length,
      palavras: texto.split(/\s+/).filter(Boolean).length,
      texto,
      chunks: chunks.map((c, i) => ({ id: i, texto: c.texto, secao: c.secao })),
      ...extras,
    };
    const lista = listarDocumentos();
    lista.unshift(doc);
    if (!salvarDocumentos(lista)) throw new Error('Armazenamento local cheio. Remova documentos antigos e tente de novo.');
    return doc;
  }

  /* ---------- Recuperação: BM25 sobre os trechos das coleções escolhidas ---------- */
  const STOP = new Set(['a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
    'por', 'para', 'com', 'sem', 'que', 'e', 'ou', 'se', 'ao', 'aos', 'como', 'mais', 'mas', 'foi', 'ser', 'sao', 'eh',
    'ele', 'ela', 'eles', 'elas', 'isso', 'isto', 'este', 'esta', 'esse', 'essa', 'seu', 'sua', 'seus', 'suas', 'nao',
    'the', 'and', 'of', 'to', 'in', 'is', 'it', 'que', 'qual', 'quais', 'quem', 'onde', 'quando', 'sobre']);

  function tokens(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w));
  }

  function buscar(pergunta, colecoes, k) {
    const docs = listarDocumentos().filter((d) => !colecoes || !colecoes.length || colecoes.includes(d.colecao));
    const itens = [];
    docs.forEach((d) => d.chunks.forEach((c) => itens.push({ doc: d, chunk: c, tk: tokens(c.texto), sk: tokens(c.secao) })));
    const q = [...new Set(tokens(pergunta))];
    if (!itens.length || !q.length) return [];
    const N = itens.length;
    const media = itens.reduce((s, it) => s + it.tk.length, 0) / N || 1;
    const df = {};
    itens.forEach((it) => { const v = new Set(it.tk); q.forEach((t) => { if (v.has(t)) df[t] = (df[t] || 0) + 1; }); });
    const k1 = 1.5;
    const b = 0.75;
    return itens.map((it) => {
      const tf = {};
      it.tk.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
      let score = 0;
      q.forEach((t) => {
        const f = tf[t] || 0;
        if (!f) return;
        const n = df[t] || 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * it.tk.length / media));
      });
      score += q.filter((t) => it.sk.includes(t)).length * 0.15;
      return { doc: it.doc, chunk: it.chunk, score };
    }).filter((x) => x.score > 0).sort((a, c) => c.score - a.score).slice(0, k || 4);
  }

  /* ---------- Agentes ---------- */
  const SISTEMA_BASE = 'Responda em português do Brasil usando somente os trechos fornecidos. ' +
    'Cite as fontes no formato [1], [2]. Se a resposta não estiver nos trechos, diga isso com clareza. ' +
    'Não invente versículos, citações ou dados.';

  const AGENTES_PADRAO = [
    { id: 'homiletica', nome: 'Assistente de Homilética', funcao: 'Apoia a preparação de sermões: exegese, estrutura e aplicação.',
      colecoes: ['sermoes', 'geral'], provedor: '', modelo: '', topK: 4, temperatura: 0.4,
      sistema: 'Você ajuda pastores a estruturar sermões com fidelidade bíblica e linguagem clara.' },
    { id: 'aconselhamento', nome: 'Assistente de Aconselhamento', funcao: 'Apoia o acompanhamento pastoral e o histórico de cuidado (Meet AI).',
      colecoes: ['aconselhamento', 'geral'], provedor: '', modelo: '', topK: 4, temperatura: 0.3,
      sistema: 'Você orienta o pastor com sensibilidade e confidencialidade. Não substitui atendimento clínico.' },
    { id: 'pastoral', nome: 'Assistente Pastoral Geral', funcao: 'Responde sobre agenda, atendimentos, recursos e rotina ministerial.',
      colecoes: ['agenda', 'recursos', 'geral'], provedor: '', modelo: '', topK: 4, temperatura: 0.3,
      sistema: 'Você organiza a rotina ministerial do pastor de forma objetiva.' },
  ];

  function listarAgentes() {
    const salvos = lerJSON(KEY_AGENTES, null);
    return salvos && salvos.length ? salvos : AGENTES_PADRAO.map((a) => Object.assign({}, a));
  }

  function salvarAgentes(lista) { return gravarJSON(KEY_AGENTES, lista); }

  function obterAgente(id) {
    const lista = listarAgentes();
    return lista.find((a) => a.id === id) || lista[0];
  }

  /* ---------- Resposta RAG ---------- */
  function extrativo(fontes) {
    return 'Modo extrativo (nenhum LLM configurado para este agente). Os trechos mais relevantes da base são:\n\n' +
      fontes.map((f) => '[' + f.n + '] ' + f.texto.slice(0, 380) + (f.texto.length > 380 ? '…' : '')).join('\n\n');
  }

  async function responder(agenteId, pergunta, opcoes) {
    const agente = obterAgente(agenteId);
    const trechos = buscar(pergunta, agente.colecoes, agente.topK || 4);
    const fontes = trechos.map((t, i) => ({
      n: i + 1, doc: t.doc.nome, colecao: t.doc.colecao, secao: t.chunk.secao, texto: t.chunk.texto, score: t.score,
    }));
    if (!fontes.length) {
      return {
        texto: 'Não encontrei trechos relevantes na base desse agente. Envie documentos (.md ou .pdf) no painel admin, ou reformule a pergunta.',
        fontes, modo: 'sem-contexto', agente: agente.nome,
      };
    }
    const id = agente.provedor;
    const p = id ? provedor(id) : null;
    if (!p || !integracaoPronta(p)) {
      return { texto: extrativo(fontes), fontes, modo: 'extrativo', agente: agente.nome };
    }
    const contexto = fontes.map((f) => '[' + f.n + '] (' + f.doc + (f.secao ? ' · ' + f.secao : '') + ')\n' + f.texto).join('\n\n');
    const historico = (opcoes && opcoes.historico) || [];
    try {
      const texto = await chamarLLM(id, {
        modelo: agente.modelo || undefined,
        sistema: SISTEMA_BASE + '\n\n' + (agente.sistema || ''),
        temperatura: agente.temperatura,
        mensagens: historico.concat([{ role: 'user', content: 'Trechos da base:\n\n' + contexto + '\n\nPergunta: ' + pergunta }]),
      });
      const cfg = (obterIntegracao(id) || {}).campos || {};
      return { texto, fontes, modo: 'llm', provedor: p.nome, modelo: agente.modelo || cfg.modelo || p.modeloPadrao, agente: agente.nome };
    } catch (e) {
      return { texto: 'Não foi possível consultar o LLM (' + (e.message || 'erro') + '). Resultado extrativo:\n\n' + extrativo(fontes), fontes, modo: 'erro-llm', agente: agente.nome };
    }
  }

  /* ---------- Webhooks ---------- */
  function listarWebhooks() { return lerJSON(KEY_WEBHOOKS, []); }
  function salvarWebhooks(l) { return gravarJSON(KEY_WEBHOOKS, l); }

  async function testarWebhook(w) {
    if (!/^https:\/\//.test(w.url || '')) return { ok: false, msg: 'Use uma URL https://' };
    const corpo = JSON.stringify({ evento: w.evento, teste: true, origem: 'PastorHub', enviadoEm: new Date().toISOString() });
    try {
      const resp = await comTimeout(w.url, {
        method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, w.segredo ? { 'X-PastorHub-Secret': w.segredo } : {}),
        body: corpo, mode: 'cors',
      }, 12000);
      return { ok: resp.ok, msg: 'Destino respondeu HTTP ' + resp.status + '.' };
    } catch (e) {
      return { ok: false, msg: 'Entrega não confirmada (CORS ou rede). O destino precisa aceitar requisições do navegador.' };
    }
  }

  window.PastorAI = {
    CATALOGO, provedor, obterIntegracao, salvarIntegracao, removerIntegracao, statusIntegracao,
    integracaoPronta, provedoresConfigurados, testarIntegracao, chamarLLM,
    COLECOES, listarDocumentos, salvarDocumentos, ingerirArquivo, removerDocumento, limparBaseRAG, dividirEmChunks,
    extrairTextoPDF, extrairPdfBasico, extrairPdfOcr, extrairTextoImagem, ocrCanvas, buscar, tokens,
    listarAgentes, salvarAgentes, obterAgente, AGENTES_PADRAO, SISTEMA_BASE, responder,
    listarWebhooks, salvarWebhooks, testarWebhook,
  };
})();
