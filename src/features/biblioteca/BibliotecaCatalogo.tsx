import { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Search,
  Star,
  X,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  CATEGORIAS,
  LIVROS,
  categoriaDe,
  filtrarLivros,
  type LivroBiblioteca,
  type TipoAquisicao,
} from '../../lib/biblioteca';
import { Link, navegar } from '../../app/router';
import { AmostraDialog } from './AmostraDialog';
import { AquisicaoDialog } from './AquisicaoDialog';
import { useFavoritosBiblioteca } from './useFavoritosBiblioteca';

interface AquisicaoAberta {
  livro: LivroBiblioteca;
  tipo: TipoAquisicao;
}

export function BibliotecaCatalogo() {
  const [termo, setTermo] = useState('');
  const [categoria, setCategoria] = useState('todos');
  const [aquisicao, setAquisicao] = useState<AquisicaoAberta | null>(null);
  const [amostra, setAmostra] = useState<LivroBiblioteca | null>(null);
  const { alternar, ehFavorito } = useFavoritosBiblioteca();

  const livros = useMemo(
    () => filtrarLivros(LIVROS, { termo, categoria }),
    [termo, categoria],
  );

  return (
    <div className="space-y-5 px-4 py-5 sm:px-6">
      <header className="rounded-2xl bg-gradient-to-br from-primary to-[#3261AB] p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
              Acervo digital
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Biblioteca Digital</h2>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              Clássicos da teologia em domínio público, com leitor por capítulos
              e solicitação de compra ou aluguel.
            </p>
          </div>
          <span className="hidden rounded-xl bg-white/10 p-3 sm:block">
            <BookOpen className="h-7 w-7 text-accent" />
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-white/10 px-3 py-1">
            {LIVROS.length} obras
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            {CATEGORIAS.length} categorias
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            100% domínio público
          </span>
        </div>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={termo}
            onChange={(evento) => setTermo(evento.target.value)}
            placeholder="Buscar por título, autor ou tema…"
            aria-label="Buscar na biblioteca"
            className="h-11 bg-white pl-9 pr-9"
          />
          {termo && (
            <button
              type="button"
              onClick={() => setTermo('')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {[{ id: 'todos', nome: 'Todos' }, ...CATEGORIAS].map((item) => {
            const ativo = categoria === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategoria(item.id)}
                aria-pressed={ativo}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  ativo
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-muted-foreground hover:border-[#3261AB] hover:text-primary'
                }`}
              >
                {item.nome}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {livros.length} de {LIVROS.length} obras
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {livros.map((livro) => {
          const cat = categoriaDe(livro.categoria);
          const favorito = ehFavorito(livro.id);
          return (
            <article
              key={livro.id}
              className="flex gap-3 rounded-xl border border-line bg-white p-3 transition-shadow hover:shadow-md"
            >
              <Link
                to={`biblioteca/${livro.id}`}
                aria-label={`Abrir ${livro.titulo}`}
                className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg text-2xl shadow-inner"
                style={{ background: livro.gradiente }}
              >
                <span aria-hidden="true">{livro.emoji}</span>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`biblioteca/${livro.id}`}
                    className="text-sm font-semibold leading-snug text-primary hover:underline"
                  >
                    {livro.titulo}
                  </Link>
                  <button
                    type="button"
                    onClick={() => alternar(livro.id)}
                    aria-label={
                      favorito
                        ? `Remover ${livro.titulo} dos favoritos`
                        : `Favoritar ${livro.titulo}`
                    }
                    aria-pressed={favorito}
                    className={`rounded p-1 transition-colors ${
                      favorito ? 'text-accent' : 'text-muted-foreground hover:text-accent'
                    }`}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={favorito ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {livro.autor} · {livro.ano}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-1.5 border-0 text-[10px]"
                  style={{ backgroundColor: `${cat.cor}1a`, color: cat.cor }}
                >
                  {cat.nome}
                </Badge>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    className="h-11 px-2 text-xs sm:h-7"
                    onClick={() => navegar(`biblioteca/${livro.id}`)}
                  >
                    Ler
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-11 px-2 text-xs sm:h-7"
                    aria-label={`Comprar ${livro.titulo}`}
                    onClick={() => setAquisicao({ livro, tipo: 'comprar' })}
                  >
                    Comprar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-11 px-2 text-xs text-[#3261AB] sm:h-7"
                    aria-label={`Alugar ${livro.titulo}`}
                    onClick={() => setAquisicao({ livro, tipo: 'alugar' })}
                  >
                    Alugar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-11 border-dashed border-[#3261AB] px-2 text-xs text-[#3261AB] sm:h-7"
                    aria-label={`Ver amostra de ${livro.titulo}`}
                    aria-haspopup="dialog"
                    onClick={() => setAmostra(livro)}
                  >
                    Amostra
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!livros.length && (
        <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-sm text-muted-foreground">
          Nenhuma obra encontrada para essa busca. Tente outro termo ou
          categoria.
        </p>
      )}

      <AmostraDialog
        livro={amostra}
        aberto={Boolean(amostra)}
        onOpenChange={(aberto) => {
          if (!aberto) setAmostra(null);
        }}
        onEscolherTipo={(tipo) => {
          if (amostra) setAquisicao({ livro: amostra, tipo });
          setAmostra(null);
        }}
      />

      <AquisicaoDialog
        livro={aquisicao?.livro ?? null}
        tipo={aquisicao?.tipo ?? 'comprar'}
        aberto={Boolean(aquisicao)}
        onOpenChange={(aberto) => {
          if (!aberto) setAquisicao(null);
        }}
      />
    </div>
  );
}
