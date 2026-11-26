import DOMPurify from "dompurify";

/**
 * Utilitários de segurança para HTML vindo do usuário, da IA ou do banco.
 *
 * Sermões importados, gerados por IA ou editados por terceiros podem conter
 * `<script>`, handlers inline e URLs `javascript:`. Todo ponto que injeta HTML
 * no DOM (dangerouslySetInnerHTML, janela de impressão) deve passar por aqui.
 */

/** Tags aceitas no conteúdo de sermão — o editor só produz este subconjunto. */
const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];

const ALLOWED_ATTR = ["class", "href", "rel", "target", "title"];

const FORBIDDEN_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "link",
  "meta",
  "base",
  "svg",
  "math",
];

/** Escapa texto puro para interpolação segura em HTML (títulos, metadados). */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

/**
 * Sanitiza HTML antes de qualquer injeção no DOM.
 *
 * Sem um DOM disponível (ex.: testes em Node) o DOMPurify não consegue analisar
 * o conteúdo e devolve a entrada intacta; nesse caso degradamos para texto
 * escapado, nunca para HTML cru.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  const input = html == null ? "" : String(html);
  if (!DOMPurify || typeof DOMPurify.sanitize !== "function" || !DOMPurify.isSupported) {
    return escapeHtml(input);
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: ["style", "src", "srcset", "formaction", "xlink:href"],
    KEEP_CONTENT: true,
  });
}
