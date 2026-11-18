import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * Módulo de Configuração do Supabase
 *
 * Este arquivo é responsável por inicializar o cliente Supabase, que é a interface
 * principal de comunicação com o backend (banco de dados, autenticação, storage).
 *
 * Conceitos:
 * - Singleton: O cliente é criado uma única vez e exportado para uso em toda a app.
 * - Environment Variables: As credenciais são carregadas de variáveis de ambiente para segurança.
 * - Fail-safe: Se as chaves não existirem, o app não quebra, mas avisa e pode usar um mock (opcional).
 */

// IMPORTANTE: Configure estas variáveis no seu arquivo .env para conectar ao projeto real
// VITE_SUPABASE_URL=https://seu-projeto.supabase.co
// VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui

/**
 * Função utilitária para buscar variáveis de ambiente de forma segura.
 * Evita erros em ambientes onde import.meta.env pode não estar definido (ex: alguns testes unitários).
 *
 * @param key - O nome da variável de ambiente (ex: 'VITE_SUPABASE_URL')
 * @returns O valor da variável ou uma string vazia se não encontrada
 */
const getEnvVar = (key: string): string => {
  try {
    // Tenta acessar a variável no objeto import.meta.env (padrão Vite)
    return import.meta?.env?.[key] || '';
  } catch {
    // Retorna vazio em caso de erro (ex: ambiente de teste sem mock do import.meta)
    return '';
  }
};

// Carrega as credenciais das variáveis de ambiente
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

/**
 * Verifica se o Supabase foi configurado corretamente com URL e Chave.
 * Útil para desabilitar funcionalidades que dependem do backend se ele não estiver conectado.
 *
 * @returns boolean - true se ambas URL e Key estiverem presentes
 */
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Validação inicial ao carregar o módulo
if (!isSupabaseConfigured()) {
  // Loga um aviso se não estiver configurado, orientando o desenvolvedor
  logger.warn(
    'Supabase não configurado. O app funcionará com limitações. Para habilitar sincronização na nuvem, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
}

/**
 * Instância do Cliente Supabase.
 *
 * Se as credenciais existirem, cria um cliente real conectado ao projeto.
 * Se não, cria um cliente "placeholder" (mock) para evitar crashes imediatos,
 * embora chamadas reais falharão ou precisarão ser tratadas.
 *
 * Opções de Auth:
 * - persistSession: Mantém o usuário logado mesmo após fechar o navegador (usa localStorage).
 * - autoRefreshToken: Renova o token de acesso automaticamente quando expira.
 * - detectSessionInUrl: Permite login via links mágicos ou OAuth redirecionados na URL.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
