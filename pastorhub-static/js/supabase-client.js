/* ============================================================
   Cliente Supabase do app estático — autenticação REAL e Edge Functions.
   - Lê a configuração pública de js/config.js (window.SUPABASE_CONFIG)
   - Carrega o supabase-js (UMD) do jsDelivr só quando configurado
   - Sem configuração válida → modo demonstração/offline:
     PastorAuth.configurado() === false
   API pública (window.PastorAuth):
     configurado() -> boolean
     carregarCliente() -> Promise<cliente|null>
     sessaoAtual() -> Promise<session|null>
     entrar(email, senha) -> Promise<{ok, erro, session}>
     cadastrar(email, senha, metadados) -> Promise<{ok, erro, session}>
     entrarGoogle() -> Promise<{ok, erro}>   (OAuth real, redireciona)
     sair() -> Promise<void>
     onAuthStateChange(cb) -> void
     invocarFuncao(nome, corpo) -> Promise<{data, error}>  (Edge Functions)
   ============================================================ */
(function () {
  var CDN_UMD = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  var cfg = window.SUPABASE_CONFIG || {};
  var url = String(cfg.url || '').replace(/\/+$/, '');
  var anonKey = String(cfg.anonKey || '').trim();
  var clientePromise = null;

  /* true quando há URL de projeto + anon key públicas válidas (anon é pública por design; RLS protege os dados) */
  function configurado() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && anonKey.length > 20;
  }

  function criarCliente() {
    return window.supabase.createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }

  /* Carrega o UMD uma única vez e devolve o cliente (null se não configurado) */
  function carregarCliente() {
    if (!configurado()) return Promise.resolve(null);
    if (clientePromise) return clientePromise;
    clientePromise = new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) { resolve(criarCliente()); return; }
      var s = document.createElement('script');
      s.src = CDN_UMD;
      s.onload = function () {
        if (window.supabase && window.supabase.createClient) resolve(criarCliente());
        else reject(new Error('supabase-js não carregou do CDN'));
      };
      s.onerror = function () { clientePromise = null; reject(new Error('Sem acesso ao CDN do supabase-js (CSP ou offline)')); };
      document.head.appendChild(s);
    });
    return clientePromise;
  }

  /* Devolve a sessão atual (ou null) */
  async function sessaoAtual() {
    var c = await carregarCliente();
    if (!c) return null;
    var r = await c.auth.getSession();
    return r && r.data && r.data.session ? r.data.session : null;
  }

  /* Traduz erros comuns do Supabase Auth para pt-BR */
  function traduzirErroAuth(e) {
    var m = (e && e.message) || '';
    if (/invalid login credentials/i.test(m)) return 'E-mail ou senha inválidos.';
    if (/email not confirmed/i.test(m)) return 'Confirme seu e-mail antes de entrar.';
    if (/user already registered/i.test(m)) return 'Este e-mail já está cadastrado.';
    if (/password/i.test(m) && /6/i.test(m)) return 'A senha precisa ter no mínimo 6 caracteres.';
    return m || 'Falha de autenticação.';
  }

  /* Login com e-mail+senha. Devolve { ok, erro, session } */
  async function entrar(email, senha) {
    var c = await carregarCliente();
    if (!c) return { ok: false, erro: 'Supabase não configurado (modo demonstração).' };
    var r = await c.auth.signInWithPassword({ email: email, password: senha });
    if (r.error) return { ok: false, erro: traduzirErroAuth(r.error) };
    return { ok: true, erro: '', session: r.data.session };
  }

  /* Cadastro com e-mail+senha e metadados (nome, igreja) */
  async function cadastrar(email, senha, metadados) {
    var c = await carregarCliente();
    if (!c) return { ok: false, erro: 'Supabase não configurado (modo demonstração).' };
    var r = await c.auth.signUp({ email: email, password: senha, options: { data: metadados || {} } });
    if (r.error) return { ok: false, erro: traduzirErroAuth(r.error) };
    return { ok: true, erro: '', session: r.data.session || null };
  }

  /* Login social real com Google (redireciona para o OAuth) */
  async function entrarGoogle() {
    var c = await carregarCliente();
    if (!c) return { ok: false, erro: 'Supabase não configurado (modo demonstração).' };
    var r = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
    if (r.error) return { ok: false, erro: traduzirErroAuth(r.error) };
    return { ok: true, erro: '' };
  }

  /* Encerra a sessão no servidor e limpa o token local */
  async function sair() {
    var c = await carregarCliente();
    if (c) await c.auth.signOut();
  }

  /* Observa mudanças de sessão (login/logout/OAuth) */
  function onAuthStateChange(cb) {
    carregarCliente().then(function (c) { if (c) c.auth.onAuthStateChange(cb); });
  }

  /* Chama uma Edge Function (ex.: ai-proxy) com o JWT do usuário logado */
  async function invocarFuncao(nome, corpo) {
    var c = await carregarCliente();
    if (!c) return { data: null, error: new Error('Supabase não configurado neste app (modo demonstração).') };
    return c.functions.invoke(nome, { body: corpo });
  }

  window.PastorAuth = {
    configurado: configurado,
    carregarCliente: carregarCliente,
    sessaoAtual: sessaoAtual,
    entrar: entrar,
    cadastrar: cadastrar,
    entrarGoogle: entrarGoogle,
    sair: sair,
    onAuthStateChange: onAuthStateChange,
    invocarFuncao: invocarFuncao,
  };
})();
