import { supabase, isSupabaseConfigured } from "../supabase";
import type { Sermon } from "../../types";

/**
 * Invoca a Edge Function `generate-sermon` para gerar um sermão via IA
 */
export async function generateSermonWithAI(params: {
  titulo?: string;
  texto_biblico: string;
  tema: string;
  publico_alvo: string;
  tipo_sermao: string;
  tom?: string;
  observacoes?: string;
}): Promise<Sermon> {
  if (!isSupabaseConfigured()) throw new Error("Supabase não configurado");

  const { data, error } = await supabase.functions.invoke("generate-sermon", {
    body: params,
  });

  if (error) throw error;
  return data.sermon as Sermon;
}

