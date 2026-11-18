// Importa o tipo Sermon centralizado
import type { Sermon } from '../../types';

/**
 * Gera versão em texto puro do sermão para exportação .txt ou cópia
 * @param sermon O objeto sermão a ser convertido
 * @returns String formatada em texto plano
 */
export function generatePlainText(sermon: Sermon): string {
  // Função auxiliar interna para remover tags HTML do conteúdo rico
  const stripHtml = (html: string) => {
    // Cria um elemento DOM temporário
    const temp = document.createElement('div');
    // Injeta o HTML
    temp.innerHTML = html;
    // Extrai apenas o texto
    return temp.textContent || temp.innerText || '';
  };

  // Retorna a string formatada usando template literals
  return `
═══════════════════════════════════════════════════════
                    ${sermon.titulo.toUpperCase()} 
═══════════════════════════════════════════════════════

Texto Bíblico: ${sermon.texto_biblico}
Tipo: ${sermon.tipo_sermao}
Público: ${sermon.publico_alvo}
Tema: ${sermon.tema}
${
  sermon.tags.length > 0
    ? `Tags: ${sermon.tags.map((t: string) => `#${t}`).join(', ')}`
    : ''
}

${
  // Bloco condicional para exibir informações de quando foi pregado
  sermon.status_pregado
    ? `
✓ PREGADO
Data: ${new Date(sermon.data_pregado!).toLocaleDateString('pt-BR')}
${sermon.local_pregado ? `Local: ${sermon.local_pregado}` : ''}

`
    : ''
}
───────────────────────────────────────────────────────

${stripHtml(sermon.conteudo_html)}

───────────────────────────────────────────────────────
Gerado por PastorHub • Caderno do Pastor
Data de criação: ${new Date(sermon.data_criacao).toLocaleDateString('pt-BR')}
═══════════════════════════════════════════════════════
    `.trim(); // Remove espaços em branco extras do início/fim
}
