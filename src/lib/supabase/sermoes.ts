import { supabase, isSupabaseConfigured } from '../supabase';
import type { Sermon } from '../../types';

/**
 * Módulo de Acesso a Dados (DAL) para Sermões
 *
 * Responsabilidade: Encapsular todas as chamadas diretas ao banco de dados Supabase
 * relacionadas à tabela 'sermoes'.
 *
 * Segurança: Todas as operações dependem do RLS (Row Level Security) configurado no banco.
 * Isso significa que a query `select('*')` só retorna os dados que o usuário logado TEM permissão de ver.
 */

/**
 * Busca todos os sermões do usuário atual, com paginação opcional.
 *
 * Lógica:
 * 1. Verifica configuração do Supabase.
 * 2. Constrói a query base (seleciona tudo, ordena por data de criação decrescente).
 * 3. Aplica paginação (range) se os parâmetros limit/page forem fornecidos.
 * 4. Executa a query e retorna os dados.
 *
 * @param options.limit - Número máximo de itens a retornar (ex: 10)
 * @param options.page - Página atual (inicia em 1)
 * @returns Lista de sermões
 */
export async function getSermoes(options?: {
  limit?: number;
  page?: number;
}): Promise<Sermon[]> {
  // Fail-fast: Se não estiver configurado, lança erro para ser tratado pela UI
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');

  const { limit, page } = options || {};

  // Inicia construção da query (Builder Pattern)
  let query = supabase
    .from('sermoes')
    .select('*')
    .order('data_criacao', { ascending: false });

  // Aplica lógica de paginação se solicitado
  if (limit && limit > 0) {
    const currentPage = Math.max(page || 1, 1); // Garante página mínima 1
    const from = (currentPage - 1) * limit; // Índice inicial (base 0)
    const to = from + limit - 1; // Índice final (inclusivo)

    // PostgREST usa range inclusivo [from, to]
    // @ts-ignore – O tipo do supabase pode não inferir range corretamente em todas as versões
    query = query.range(from, to);
  }

  // Executa a query assíncrona
  const { data, error } = await query;

  // Tratamento de erro padrão
  if (error) throw error;

  // Retorna array vazio se data for null, garantindo segurança de tipos
  return (data || []) as Sermon[];
}

/**
 * Busca um sermão específico pelo seu ID único (UUID).
 *
 * @param id - Identificador único do sermão
 * @returns O objeto sermão encontrado ou null
 */
export async function getSermao(id: string): Promise<Sermon | null> {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');

  // .single() força o retorno de um único objeto em vez de um array.
  // Retorna erro se encontrar 0 ou >1 registros.
  const { data, error } = await supabase
    .from('sermoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Sermon;
}

/**
 * Cria um novo sermão associado ao usuário logado.
 *
 * Importante: O 'user_id' é inserido manualmente aqui para garantir a associação,
 * embora o RLS no banco também possa impor/verificar isso.
 *
 * @param sermon - Dados do sermão (exceto ID, que é gerado pelo banco)
 */
export async function createSermao(
  sermon: Omit<Sermon, 'id'>
): Promise<Sermon> {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');

  // Obtém o usuário atual da sessão para vincular o registro
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuário não autenticado');

  // Insere e retorna o registro criado (.select().single())
  const { data, error } = await supabase
    .from('sermoes')
    .insert({ ...sermon, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Sermon;
}

/**
 * Atualiza um sermão existente.
 *
 * @param id - ID do sermão a atualizar
 * @param updates - Campos a serem modificados
 */
export async function updateSermao(
  id: string,
  updates: Partial<Sermon>
): Promise<Sermon> {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');

  // Atualiza também a data de modificação automaticamente
  const { data, error } = await supabase
    .from('sermoes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Sermon;
}

/**
 * Exclui um sermão permanentemente.
 *
 * @param id - ID do sermão a ser removido
 */
export async function deleteSermao(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');

  // Executa delete onde id corresponde
  const { error } = await supabase.from('sermoes').delete().eq('id', id);

  if (error) throw error;
}

/**
 * Atalho para alternar apenas o status 'pregado'.
 * Útil para interações rápidas na UI (ex: checkbox na lista).
 */
export async function togglePregado(
  id: string,
  status: boolean
): Promise<Sermon> {
  return updateSermao(id, { status_pregado: status });
}

/**
 * Realiza busca textual usando o operador 'ilike' (case-insensitive) do PostgreSQL.
 * Busca no título, texto bíblico ou tags.
 *
 * @param query - Texto a buscar
 */
export async function searchSermoes(query: string): Promise<Sermon[]> {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');

  // O texto do usuário entra na sintaxe do PostgREST (.or), onde vírgula,
  // parênteses e chaves têm significado estrutural. Removemos esses
  // metacaracteres, os curingas do ilike e limitamos o tamanho da consulta.
  const termo = String(query || '')
    .replace(/[%,(){}[\]\\*"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  if (!termo) return [];

  // Em `tags.cs.{...}` o valor é um elemento literal de array; espaços quebram
  // a sintaxe, então a cláusula de tags só entra quando há um termo único.
  const filtros = [
    `titulo.ilike.%${termo}%`,
    `texto_biblico.ilike.%${termo}%`,
  ];
  if (!/\s/.test(termo)) filtros.push(`tags.cs.{${termo}}`);

  const { data, error } = await supabase
    .from('sermoes')
    .select('*')
    .or(filtros.join(','))
    .order('data_criacao', { ascending: false });

  if (error) throw error;
  return (data || []) as Sermon[];
}
