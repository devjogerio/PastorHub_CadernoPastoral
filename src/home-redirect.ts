// Redireciona a raiz pública (GitHub Pages) para a vitrine institucional.
// Implementação em módulo externo para respeitar a CSP (sem script inline).

export function iniciarRedirecionamento(): void {
  if (!window.location.hostname.endsWith(".github.io")) return;
  const caminho = window.location.pathname || "/";
  if (caminho.charAt(caminho.length - 1) !== "/") return;
  const base = caminho.replace(/\/index\.html$/, "").replace(/\/$/, "");
  window.location.replace(`${base}/pastorhub-static/`);
}

iniciarRedirecionamento();
