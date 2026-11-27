import { FileDown, FileText, Layers, MoonStar, RotateCcw } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useRota } from '../../app/router';

/* ============================================================
   Documentos A4 — referências estáticas produzidas pelo app estático.
   Arquivos são mantidos como fonte: public/docs/*.html.
   ============================================================ */

interface Doc {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: typeof FileText;
  // Estrutura PDF: @page A4 + @media print do CSS de cada documento.
}

const DOCS: Doc[] = [
  {
    id: 'apresentacao.html',
    titulo: 'Apresentação',
    subtitulo: 'O PastorHub em 10 minutos — para visitas e parcerias',
    icone: FileText,
  },
  {
    id: 'proposta-investimento.html',
    titulo: 'Proposta de Investimento',
    subtitulo: 'Arrecadação e ecossistema financeiro do projeto',
    icone: MoonStar,
  },
  {
    id: 'ecossistema-ia.html',
    titulo: 'Ecossistema de IA',
    subtitulo: 'Geradores de sermões e palestras, agentes e Meet AI',
    icone: RotateCcw,
  },
  {
    id: 'biblioteca.html',
    titulo: 'Doc: Biblioteca Digital',
    subtitulo: 'Acervo, leitor e solicitação de compra/aluguel',
    icone: FileText,
  },
  {
    id: 'biblioteca-comprar-alugar.html',
    titulo: 'Doc: Comprar & Alugar',
    subtitulo: 'Fluxo de cobrança e protocolos pagos',
    icone: FileText,
  },
  {
    id: 'manual-usuario.html',
    titulo: 'Manual do Usuário',
    subtitulo: 'Primeiros passos do app do membro',
    icone: FileText,
  },
  {
    id: 'registro-tecnico.html',
    titulo: 'Registro Técnico',
    subtitulo: 'Diagnóstico interno do projeto — para acesso da empresa',
    icone: FileText,
  },
  {
    id: 'roadmap.html',
    titulo: 'Roadmap',
    subtitulo: 'Caminho até a v2.0 — supply chain e agentes por ministério',
    icone: Layers,
  },
  {
    id: 'ficha-tecnica.html',
    titulo: 'Ficha Técnica',
    subtitulo: 'Dados vitais do produto (pastor/códigos/Próximo)',
    icone: FileDown,
  },
];

export function DocsPage() {
  const { id } = useRota();

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      <header className="rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          Documentos · pt-BR
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Documentos PastorHub</h2>
        <p className="mt-1 max-w-xl text-sm text-white/80">
          Impressos em formato A4 (anotação de @page), profundos para impressão.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
          <Badge className="bg-white/10 px-3 py-1 text-accent">A4</Badge>
          <Badge className="bg-white/10 px-3 py-1 text-accent">@media print</Badge>
          <Badge className="bg-white/10 px-3 py-1 text-accent">≈10 documentos</Badge>
        </div>
      </header>

      {id && (
        <div className="rounded-xl border border-line bg-white shadow-md">
          <iframe
            src={`/docs/${id}`}
            title={`Documento ${id}`}
            className="block w-full border-none"
            style={{ height: 'calc(100vh - 120px)' }}
            data-testid="doc-iframe"
          />
        </div>
      )}
      {!id && (
        <p className="text-xs text-muted-foreground">
          Abra qualquer documento acima ou navegue pelas abas na barra lateral.
        </p>
      )}

      <section aria-label="Índice de documentos" className="grid gap-3 sm:grid-cols-2">
        {DOCS.map((doc) => {
          const Icone = doc.icone;
          return (
            <article key={doc.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft text-[#3261AB]">
                <Icone className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">{doc.titulo}</p>
                <p className="text-xs text-muted-foreground">{doc.subtitulo}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => (window.location.hash = `docs/${doc.id}`)}>
                  Abrir
                </Button>
                <Button size="sm" variant="ghost" asChild className="text-[#3261AB]">
                  <a href={`/docs/${doc.id}`} download={doc.id} target="_blank" rel="noopener noreferrer">
                    Baixar
                  </a>
                </Button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
