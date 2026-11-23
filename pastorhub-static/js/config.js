/* ============================================================
   Configuração PÚBLICA do cliente Supabase no app estático.
   O app estático não tem build, então não lê .env: preencha aqui
   a URL do projeto e a chave PÚBLICA (anon) — a mesma informação
   que o app React recebe via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
   A anon key é pública por design (o acesso é controlado por RLS);
   NUNCA coloque aqui a service_role key ou qualquer segredo.
   Deixe vazio para operar em modo demonstração/offline.
   ============================================================ */
window.SUPABASE_CONFIG = {
  url: '',      // ex.: https://seu-projeto.supabase.co
  anonKey: '',  // ex.: eyJhbGciOi... (chave anon/public do dashboard)
};
