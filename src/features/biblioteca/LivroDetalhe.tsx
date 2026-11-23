import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  buscarLivro,
  categoriaDe,
  type LivroBiblioteca,
  type TipoAquisicao,
} from '../../lib/biblioteca';
import { Link } from '../../app/router';
import { AquisicaoDialog } from './AquisicaoDialog';
import { useFavoritosBiblioteca } from './useFavoritosBiblioteca';

interface LivroDetalheProps {
  livroId: string;
}

/** Capítulos sintéticos: mesma estrutura do leitor do app estático. */
export function capitulosDoLivro(livro: LivroBiblioteca) {
  return [
    {
      titulo: 'Capítulo 1 · Introdução e Contexto',
      texto: `${livro.descricao} Escrita por ${livro.autor} (${livro.ano}), esta obra permanece como referência essencial para a edificação da igreja e o amadurecimento espiritual.`,
    },
    {
      titulo: 'Capítulo 2 · Ensinamentos Centrais',
      texto: `${livro.destaques.join('. ')}. O estudo atento destes princípios fortalece a caminhada cristã diária, unindo doutrina sólida e devoção prática.`,
    },
    {
      titulo: 'Capítulo 3 · Aplicação Pastoral',
      texto: `Ao meditar nesta leitura, reflita em oração sobre como aplicar cada verdade bíblica em sua família e comunidade local. Licença da edição: ${livro.licenca}.`,
    },
  ];
}

export function LivroDetalhe({ livroId }: LivroDetalheProps) {
  const livro = buscarLivro(livroId);
  const { alternar, ehFavorito } = useFavoritosBiblioteca();
  const [lendo, setLendo] = useState(false);
  const [capitulo, setCapitulo] = useState(0);
  const [fonte, setFonte] = useState(16);
  const [aquisicao, setAquisicao] = useState<TipoAquisicao | null>(null);

  const capitulos = useMemo(
    () => (livro ? capitulosDoLivro(livro) : []),
    [livro],
  );

  if (!livro) {
    return (
      <div className="space-y-3 px-4 py-6">
        <p className="text-sm text-muted-foreground">
          Obra não encontrada no acervo.
        </p>
        <Link to="biblioteca" className="text-sm font-semibold text-primary underline">
          Voltar para a Biblioteca
        </Link>
      </div>
    );
  }

  const cat = categoriaDe(livro.categoria);
  const favorito = ehFavorito(livro.id);
  const cap = capitulos[capitulo] ?? capitulos[0];

  const copiarTrecho = async () => {
    const trecho = `${cap.titulo}\n\n${cap.texto}\n\n— ${livro.autor}, ${livro.titulo}`;
    try {
      await navigator.clipboard.writeText(trecho);
      toast.success('Trecho copiado para a área de transferência.');
    } catch {
      toast.error('Não foi possível copiar o trecho.');
    }
  };

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      <Link
        to="biblioteca"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#3261AB] hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Biblioteca
      </Link>

      <header className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">
        <div
          className="flex h-40 w-28 shrink-0 items-center justify-center self-center rounded-xl text-4xl shadow-lg sm:self-auto"
          style={{ background: livro.gradiente }}
          aria-hidden="true"
        >
          {livro.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <Badge
            variant="secondary"
            className="border-0 text-[10px]"
            style={{ backgroundColor: `${cat.cor}1a`, color: cat.cor }}
          >
            {cat.nome}
          </Badge>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-primary">
            {livro.titulo}
          </h2>
          <p className="text-sm text-muted-foreground">
            {livro.autor} · {livro.ano} · {livro.paginas} páginas
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={() => setLendo((atual) => !atual)}
            >
              <BookOpen className="h-4 w-4" />
              {lendo ? 'Fechar leitor' : 'Ler agora'}
            </Button>
            <Button
              variant="outline"
              onClick={() => alternar(livro.id)}
              aria-pressed={favorito}
            >
              <Star className="h-4 w-4" fill={favorito ? 'currentColor' : 'none'} />
              {favorito ? 'Favoritado' : 'Favoritar'}
            </Button>
            <Button variant="outline" onClick={() => setAquisicao('comprar')}>
              <ShoppingCart className="h-4 w-4" />
              Comprar
            </Button>
            <Button variant="ghost" onClick={() => setAquisicao('alugar')}>
              <Timer className="h-4 w-4" />
              Alugar
            </Button>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-line bg-white p-4">
        <h3 className="text-sm font-semibold text-primary">Sobre a obra</h3>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          {livro.descricao}
        </p>
        <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Destaques
        </h4>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/80">
          {livro.destaques.map((destaque) => (
            <li key={destaque}>{destaque}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          <strong className="text-primary">Licença:</strong> {livro.licenca}
        </p>
      </section>

      {lendo && (
        <section className="rounded-xl border border-line bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Capítulos">
              {capitulos.map((item, indice) => (
                <button
                  key={item.titulo}
                  type="button"
                  role="tab"
                  aria-selected={indice === capitulo}
                  onClick={() => setCapitulo(indice)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    indice === capitulo
                      ? 'bg-primary text-white'
                      : 'bg-soft text-muted-foreground hover:text-primary'
                  }`}
                >
                  Cap. {indice + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                aria-label="Diminuir fonte"
                onClick={() => setFonte((atual) => Math.max(13, atual - 1))}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                aria-label="Aumentar fonte"
                onClick={() => setFonte((atual) => Math.min(22, atual + 1))}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="ml-1 h-8"
                onClick={copiarTrecho}
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>
          </div>
          <article style={{ fontSize: `${fonte}px` }} className="leading-relaxed">
            <h4 className="mb-2 font-semibold text-primary">{cap.titulo}</h4>
            <p className="text-foreground/85">{cap.texto}</p>
          </article>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Leitura de demonstração do acervo — o texto integral é liberado após
            a compra ou durante o aluguel.
          </p>
        </section>
      )}

      <AquisicaoDialog
        livro={livro}
        tipo={aquisicao ?? 'comprar'}
        aberto={Boolean(aquisicao)}
        onOpenChange={(aberto) => {
          if (!aberto) setAquisicao(null);
        }}
      />
    </div>
  );
}
