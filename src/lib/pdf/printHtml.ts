// Importa o tipo Sermon centralizado
import type { Sermon } from '../../types';

/**
 * Gera uma string contendo HTML completo e estilizado para impressão do sermão
 * @param sermon O objeto sermão com dados e conteúdo HTML
 * @returns String HTML completa (com doctype, head, body e styles)
 */
export function generatePrintHTML(sermon: Sermon): string {
  // Retorna o template HTML com interpolação de dados
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sermon.titulo} - PastorHub</title>
  <style>
    /* Configuração de página para impressão A4 */
    @page {
      size: A4;
      margin: 2cm;
    }

    /* Reset básico */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Estilos globais de tipografia para leitura impressa */
    body {
      font-family: 'Georgia', 'Times New Roman', serif; /* Serifas facilitam leitura em papel */
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Cabeçalho do documento */
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #002645;
    }

    /* Logo ou Título do App */
    .logo {
      font-size: 18pt;
      color: #002645;
      font-weight: bold;
      margin-bottom: 10px;
    }

    /* Título do Sermão */
    h1 {
      font-size: 24pt;
      color: #002645;
      margin: 20px 0 10px 0;
    }

    /* Referência Bíblica */
    .verse {
      font-size: 14pt;
      color: #3261AB;
      font-style: italic;
      margin-bottom: 10px;
    }

    /* Container de metadados (tema, tipo, público) */
    .metadata {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 15px;
      font-size: 10pt;
      color: #666;
    }

    .metadata-item {
      padding: 5px 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    /* Área de conteúdo principal */
    .content {
      margin-top: 30px;
    }

    /* Títulos dentro do conteúdo */
    h2 {
      font-size: 18pt;
      color: #002645;
      margin: 25px 0 15px 0;
      page-break-after: avoid; /* Evita que título fique sozinho no final da página */
    }

    h3 {
      font-size: 14pt;
      color: #3261AB;
      margin: 20px 0 10px 0;
      page-break-after: avoid;
    }

    /* Parágrafos justificados para melhor aparência impressa */
    p {
      margin: 10px 0;
      text-align: justify;
    }

    /* Listas */
    ul, ol {
      margin: 10px 0 10px 20px;
    }

    li {
      margin-bottom: 5px;
    }

    /* Citações em bloco */
    blockquote {
      margin: 20px 0;
      padding: 10px 20px;
      border-left: 4px solid #3261AB;
      background: #f8f9fa;
      font-style: italic;
    }

    /* Rodapé */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }

    /* Estilos específicos para Tags */
    .tags {
      margin-top: 10px;
      font-size: 9pt;
      color: #888;
    }
  </style>
</head>
<body>
  <!-- Cabeçalho visível -->
  <div class="header">
    <div class="logo">PastorHub</div>
    <h1>${sermon.titulo}</h1>
    <div class="verse">${sermon.texto_biblico}</div>
    
    <!-- Metadados em linha -->
    <div class="metadata">
      <span class="metadata-item"><strong>Tema:</strong> ${sermon.tema}</span>
      <span class="metadata-item"><strong>Tipo:</strong> ${
        sermon.tipo_sermao
      }</span>
      <span class="metadata-item"><strong>Público:</strong> ${
        sermon.publico_alvo
      }</span>
    </div>

    ${
      sermon.tags.length > 0
        ? `
      <div class="tags">
        Tags: ${sermon.tags.map((tag: string) => `#${tag}`).join(', ')}
      </div>
    `
        : ''
    }
  </div>

  <!-- Injeção do conteúdo HTML rico do editor -->
  <div class="content">
    ${sermon.conteudo_html}
  </div>

  <!-- Rodapé com informações de geração -->
  <div class="footer">
    <p>Gerado por PastorHub - Caderno do Pastor</p>
    <p>Criado em: ${new Date(sermon.data_criacao).toLocaleDateString(
      'pt-BR'
    )}</p>
    ${
      sermon.status_pregado
        ? `
      <p style="color: #95C121; font-weight: bold; margin-top: 5px;">
        ✓ Pregado em ${new Date(sermon.data_pregado!).toLocaleDateString(
          'pt-BR'
        )}
        ${sermon.local_pregado ? ` - ${sermon.local_pregado}` : ''}
      </p>
    `
        : ''
    }
  </div>
</body>
</html>
  `;
}
