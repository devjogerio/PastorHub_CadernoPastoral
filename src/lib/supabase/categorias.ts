import { supabase, isSupabaseConfigured } from "../supabase";

/**
 * Busca categorias do usuário atual (se a tabela existir)
 */
export async function getCategorias(): Promise<any[]> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado");

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nome", { ascending: true });

  if (error && error.code !== "PGRST116") throw error;
  return data || [];
}

/**
 * Cria uma nova categoria vinculada ao usuário
 */
export async function createCategoria(nome: string, cor: string): Promise<any> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("categorias")
    .insert({ nome, cor, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

