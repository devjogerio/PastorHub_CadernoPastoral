import { BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  categoriaDe,
  type LivroBiblioteca,
  type TipoAquisicao,
} from '../../lib/biblioteca';

/* ============================================================
   Amostra da obra: somente leitura, sem formulário de pagamento.
   Comprar e Alugar são delegados ao catálogo, que abre o fluxo de
   aquisição (mesmo comportamento do modal de amostra do estático).
   O Dialog permanece montado; só o conteúdo depende do livro.
   ============================================================ */

interface AmostraDialogProps {
  livro: LivroBiblioteca | null;
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onEscolherTipo: (tipo: TipoAquisicao) => void;
}

export function AmostraDialog({
  livro,
  aberto,
  onOpenChange,
  onEscolherTipo,
}: AmostraDialogProps) {
  return (
    <Dialog open={aberto && livro !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {livro && (
          <ConteudoAmostra
            livro={livro}
            onFechar={() => onOpenChange(false)}
            onEscolherTipo={onEscolherTipo}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ConteudoAmostraProps {
  livro: LivroBiblioteca;
  onFechar: () => void;
  onEscolherTipo: (tipo: TipoAquisicao) => void;
}

function ConteudoAmostra({ livro, onFechar, onEscolherTipo }: ConteudoAmostraProps) {
  const categoria = categoriaDe(livro.categoria);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg text-2xl shadow-inner"
            style={{ background: livro.gradiente }}
          >
            {livro.emoji}
          </span>
          <div className="min-w-0">
            <DialogTitle className="leading-snug text-primary">
              {livro.titulo}
            </DialogTitle>
            <DialogDescription>
              {livro.autor} · {livro.ano} · {categoria.nome}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <section
        aria-labelledby="amostra-conteudo-titulo"
        className="space-y-2 rounded-xl border border-line bg-soft p-4 text-sm"
      >
        <h3 id="amostra-conteudo-titulo" className="flex items-center gap-2 font-semibold text-primary">
          <BookOpen className="h-4 w-4 text-[#3261AB]" aria-hidden="true" />
          Amostra do conteúdo
        </h3>
        <p className="text-foreground/80">{livro.descricao}</p>
        {livro.destaques.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-foreground/80">
            {livro.destaques.map((destaque) => (
              <li key={destaque}>{destaque}</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Pré-visualização do conteúdo. A leitura completa é liberada após a
          compra ou durante o aluguel.
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <dt className="font-semibold text-primary">Páginas</dt>
          <dd>{livro.paginas}</dd>
        </div>
        <div>
          <dt className="font-semibold text-primary">Licença</dt>
          <dd>{livro.licenca}</dd>
        </div>
      </dl>

      <DialogFooter className="flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onFechar}>
          Fechar
        </Button>
        <Button
          variant="outline"
          className="text-[#3261AB]"
          aria-label={`Alugar ${livro.titulo}`}
          onClick={() => onEscolherTipo('alugar')}
        >
          Alugar
        </Button>
        <Button
          aria-label={`Comprar ${livro.titulo}`}
          onClick={() => onEscolherTipo('comprar')}
        >
          Comprar
        </Button>
      </DialogFooter>
    </>
  );
}
