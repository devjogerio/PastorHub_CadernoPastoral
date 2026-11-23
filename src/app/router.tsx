import {
  useSyncExternalStore,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';

/* ============================================================
   Roteador por hash, sem dependências externas.
   Funciona no GitHub Pages (sem rewrite de servidor) e no APK
   (WebView), onde history API não é confiável.
   ============================================================ */

const EVENTO_HASH = 'hashchange';
const ouvintes = new Set<() => void>();

let rotaAtual = lerHash();

function lerHash(): string {
  if (typeof window === 'undefined') return 'inicio';
  const bruto = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return bruto || 'inicio';
}

function notificar(): void {
  rotaAtual = lerHash();
  ouvintes.forEach((ouvinte) => ouvinte());
}

function inscrever(ouvinte: () => void): () => void {
  if (!ouvintes.size) window.addEventListener(EVENTO_HASH, notificar);
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
    if (!ouvintes.size) window.removeEventListener(EVENTO_HASH, notificar);
  };
}

function instantaneo(): string {
  return rotaAtual;
}

/** Navega para uma rota do app (ex.: "biblioteca/confissoes"). */
export function navegar(rota: string): void {
  const limpa = String(rota || '').replace(/^#?\/?/, '');
  const destino = `#/${limpa}`;
  if (window.location.hash === destino) return;
  window.location.hash = destino;
  window.scrollTo({ top: 0, behavior: 'auto' });
}

export interface RotaAtual {
  /** Caminho completo, sem "#/": "biblioteca/confissoes". */
  rota: string;
  /** Primeiro segmento: "biblioteca". */
  secao: string;
  /** Segundo segmento (id opcional): "confissoes". */
  id: string;
  segmentos: string[];
}

/** Lê a rota atual e re-renderiza quando o hash muda. */
export function useRota(): RotaAtual {
  const rota = useSyncExternalStore(inscrever, instantaneo, () => 'inicio');
  const segmentos = rota.split('/').filter(Boolean);
  return {
    rota,
    secao: segmentos[0] || 'inicio',
    id: segmentos[1] || '',
    segmentos,
  };
}

interface LinkProps extends Omit<ComponentProps<'a'>, 'href'> {
  to: string;
  children: ReactNode;
}

/**
 * Link interno acessível. Mantém o comportamento nativo (ctrl/cmd/meio-clique
 * abrem em nova aba) e intercepta apenas o clique simples.
 */
export function Link({ to, children, onClick, ...rest }: LinkProps) {
  const href = `#/${String(to).replace(/^#?\/?/, '')}`;
  const tratarClique = (evento: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(evento);
    if (evento.defaultPrevented) return;
    if (
      evento.metaKey ||
      evento.ctrlKey ||
      evento.shiftKey ||
      evento.altKey ||
      evento.button !== 0
    ) {
      return;
    }
    evento.preventDefault();
    navegar(to);
  };
  return (
    <a href={href} onClick={tratarClique} {...rest}>
      {children}
    </a>
  );
}
