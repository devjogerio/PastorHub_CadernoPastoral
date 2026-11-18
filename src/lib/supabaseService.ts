import { isSupabaseConfigured } from './supabase';
import type { Sermon } from '../types';
import {
  getSermoes,
  getSermao,
  createSermao,
  updateSermao,
  deleteSermao,
  togglePregado,
  searchSermoes,
} from './supabase/sermoes';
import { generateSermonWithAI } from './supabase/edgeFunctions';
import { getCategorias, createCategoria } from './supabase/categorias';
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  isAuthenticated,
} from './supabase/auth';

/**
 * Classe Facade (Fachada) para Serviços do Supabase
 *
 * Padrão de Projeto: Facade
 * Objetivo: Fornecer uma interface unificada e simplificada para um conjunto de interfaces
 * em um subsistema (neste caso, os vários módulos do Supabase: auth, sermões, categorias).
 *
 * Benefícios:
 * 1. Desacoplamento: O restante da aplicação não precisa saber como o Supabase é estruturado internamente.
 * 2. Manutenibilidade: Se mudarmos a implementação de 'getSermoes', só precisamos atualizar aqui (ou no módulo importado),
 *    sem quebrar os componentes que usam 'SupabaseService.getSermoes'.
 * 3. Centralização: Facilita encontrar todas as operações de backend em um só lugar.
 */
export class SupabaseService {
  /**
   * Verifica se o backend está configurado e pronto para uso.
   * Útil para exibir UI de "Modo Offline" ou desabilitar botões.
   *
   * @returns boolean - true se configurado, false caso contrário.
   */
  static isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  // ==================== MÓDULO DE SERMÕES ====================
  // Gerencia o CRUD (Create, Read, Update, Delete) de sermões

  /**
   * Recupera a lista de sermões do usuário logado.
   *
   * @param options - Opções de paginação (limite e página atual)
   * @returns Promise<Sermon[]> - Lista de sermões
   */
  static async getSermoes(options?: {
    limit?: number;
    page?: number;
  }): Promise<Sermon[]> {
    return getSermoes(options);
  }

  /**
   * Busca os detalhes de um único sermão pelo ID.
   *
   * @param id - UUID do sermão
   * @returns Promise<Sermon | null> - O objeto sermão ou null se não encontrado
   */
  static async getSermao(id: string): Promise<Sermon | null> {
    return getSermao(id);
  }

  /**
   * Cria um novo registro de sermão no banco de dados.
   * O ID é gerado automaticamente pelo banco.
   *
   * @param sermon - Objeto sermão sem o ID (Omit<Sermon, 'id'>)
   * @returns Promise<Sermon> - O sermão criado com o ID preenchido
   */
  static async createSermao(sermon: Omit<Sermon, 'id'>): Promise<Sermon> {
    return createSermao(sermon);
  }

  /**
   * Atualiza campos específicos de um sermão existente.
   *
   * @param id - UUID do sermão a ser atualizado
   * @param updates - Objeto parcial contendo apenas os campos a mudar (Partial<Sermon>)
   * @returns Promise<Sermon> - O sermão atualizado
   */
  static async updateSermao(
    id: string,
    updates: Partial<Sermon>
  ): Promise<Sermon> {
    return updateSermao(id, updates);
  }

  /**
   * Remove permanentemente um sermão do banco de dados.
   *
   * @param id - UUID do sermão a excluir
   */
  static async deleteSermao(id: string): Promise<void> {
    return deleteSermao(id);
  }

  /**
   * Alterna o status 'pregado' (booleano) de um sermão.
   * Atalho conveniente para updateSermao({ status_pregado: ... }).
   *
   * @param id - UUID do sermão
   * @param status - Novo estado (true = já pregado, false = não pregado)
   * @returns Promise<Sermon> - O sermão atualizado
   */
  static async togglePregado(id: string, status: boolean): Promise<Sermon> {
    return togglePregado(id, status);
  }

  /**
   * Realiza uma busca textual nos sermões (título, conteúdo, tags).
   *
   * @param query - Termo de busca
   * @returns Promise<Sermon[]> - Lista de sermões que correspondem à busca
   */
  static async searchSermoes(query: string): Promise<Sermon[]> {
    return searchSermoes(query);
  }

  // ==================== EDGE FUNCTIONS (Serverless) ====================
  // Executa lógicas complexas no servidor (IA, processamento pesado)

  /**
   * Invoca uma Edge Function para gerar um esboço de sermão usando IA.
   *
   * @param params - Parâmetros para a geração (título, texto bíblico, tom, etc.)
   * @returns Promise<Sermon> - O sermão gerado (não salvo no banco ainda, geralmente)
   */
  static async generateSermonWithAI(params: {
    titulo?: string;
    texto_biblico: string;
    tema: string;
    publico_alvo: string;
    tipo_sermao: string;
    tom?: string;
    observacoes?: string;
  }): Promise<Sermon> {
    return generateSermonWithAI(params);
  }

  // ==================== CATEGORIAS ====================
  // Gerencia taxonomias para organizar o conteúdo

  /**
   * Lista todas as categorias disponíveis para o usuário.
   */
  static async getCategorias(): Promise<any[]> {
    return getCategorias();
  }

  /**
   * Cria uma nova categoria personalizada.
   *
   * @param nome - Nome da categoria
   * @param cor - Código de cor (hex) para UI
   */
  static async createCategoria(nome: string, cor: string): Promise<any> {
    return createCategoria(nome, cor);
  }

  // ==================== AUTENTICAÇÃO ====================

  /** Login com email e senha */
  static async signIn(email: string, password: string) {
    return signIn(email, password);
  }

  /** Cadastro com email e senha */
  static async signUp(email: string, password: string, metadata?: any) {
    return signUp(email, password, metadata);
  }

  /** Login com Google */
  static async signInWithGoogle() {
    return signInWithGoogle();
  }

  /** Logout da sessão atual */
  static async signOut() {
    return signOut();
  }

  /** Usuário atual (ou null) */
  static async getCurrentUser() {
    return getCurrentUser();
  }

  /** Indica se há sessão ativa */
  static async isAuthenticated(): Promise<boolean> {
    return isAuthenticated();
  }
}
