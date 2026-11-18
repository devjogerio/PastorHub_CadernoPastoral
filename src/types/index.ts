// Definição da interface Sermon que é central para a aplicação
// Representa a estrutura de dados de um sermão
export interface Sermon {
  id: string; // Identificador único do sermão
  titulo: string; // Título do sermão
  texto_biblico: string; // Referência bíblica principal
  tema: string; // Tema central da mensagem
  publico_alvo: string; // Público a quem se destina (ex: Jovens, Geral)
  tipo_sermao: string; // Tipo de sermão (ex: Expositivo, Temático)
  conteudo_html: string; // Conteúdo rico em HTML para exibição
  conteudo_plain: string; // Conteúdo em texto puro para IA e busca
  tags: string[]; // Lista de tags para categorização
  data_criacao: string; // Data ISO da criação do registro
  data_pregado: string | null; // Data ISO de quando foi pregado, ou null
  status_pregado: boolean; // Flag indicando se já foi ministrado
  local_pregado: string; // Local onde foi ministrado (opcional)
}
