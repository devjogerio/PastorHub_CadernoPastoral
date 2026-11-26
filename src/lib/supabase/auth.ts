import { supabase } from "../supabase";

/**
 * Mensagem genérica de falha de autenticação.
 *
 * Nunca diferenciamos "e-mail não cadastrado" de "senha incorreta": essa
 * distinção permite enumerar contas válidas (A7/M3).
 */
const ERRO_CREDENCIAIS = "E-mail ou senha inválidos.";
const ERRO_GENERICO = "Não foi possível concluir a operação. Tente novamente.";

/** Requisitos mínimos de senha: 8 caracteres, com letras e números. */
export const SENHA_MINIMA = 8;

/** Retorna `null` quando a senha é aceitável ou a mensagem de correção. */
export function validarSenha(senha: string): string | null {
  if (typeof senha !== "string" || senha.length < SENHA_MINIMA) {
    return `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`;
  }
  if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
    return "A senha deve conter letras e números.";
  }
  return null;
}

/** Traduz erros do Supabase Auth sem revelar se a conta existe. */
export function mensagemErroAuth(error: unknown): string {
  const mensagem = String((error as { message?: string })?.message ?? "");
  if (/rate|too many/i.test(mensagem)) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (/network|fetch|failed to fetch/i.test(mensagem)) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }
  if (/invalid login credentials|email not confirmed|user not found/i.test(mensagem)) {
    return ERRO_CREDENCIAIS;
  }
  if (/already registered|already been registered/i.test(mensagem)) {
    return "Não foi possível concluir o cadastro. Se já possui conta, use a opção Entrar.";
  }
  if (/password/i.test(mensagem)) {
    return "A senha não atende aos requisitos mínimos (8 caracteres, com letras e números).";
  }
  return ERRO_GENERICO;
}

/**
 * Origens autorizadas a receber o retorno do OAuth.
 * A origem atual sempre entra; domínios extras vêm de VITE_REDIRECT_ORIGINS.
 */
function origensDeRedirectPermitidas(): string[] {
  const atual =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "";
  const extras = String(import.meta.env.VITE_REDIRECT_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set([atual, ...extras].filter(Boolean)));
}

/**
 * Valida o destino do OAuth contra a allowlist de origens.
 * Retorna `undefined` quando nada é confiável — nesse caso o Supabase usa a
 * Site URL configurada no projeto, nunca um destino arbitrário.
 */
export function redirectToSeguro(): string | undefined {
  const bruto =
    import.meta.env.VITE_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  try {
    const url = new URL(bruto);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.username || url.password) return undefined;
    if (!origensDeRedirectPermitidas().includes(url.origin)) return undefined;
    return `${url.origin}/`;
  } catch {
    return undefined;
  }
}

/**
 * Realiza login com email e senha
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Cadastra usuário com email e senha
 */
export async function signUp(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  if (error) throw error;
  return data;
}

/**
 * Login via OAuth (Google)
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectToSeguro() },
  });
  if (error) throw error;
  return data;
}

/**
 * Finaliza sessão atual e remove o cache offline do dispositivo.
 * Os dados voltam a ser baixados do Supabase no próximo login.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  try {
    const { OfflineStorage } = await import("../offlineStorage");
    OfflineStorage.clearAll();
  } catch {
    /* cache já indisponível */
  }
}

/**
 * Retorna o usuário atual (ou null)
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Indica se existe sessão ativa
 */
export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

