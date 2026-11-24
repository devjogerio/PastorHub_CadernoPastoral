import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  MIN_CARACTERES_PARCIAL,
  TODOS,
  buscarItens,
  paginarItens,
  termoEhPesquisavel,
  type ItemBusca,
} from './busca';

const DEBOUNCE_MS = 250;
const TAMANHO_PAGINA = 5;

interface AdminBuscaProps {
  itens: ItemBusca[];
}

function valoresUnicos(lista: string[]): string[] {
  return Array.from(new Set(lista.filter(Boolean))).sort();
}

function mensagemSemResultado(termo: string, pesquisavel: boolean): string {
  if (!pesquisavel) {
    return `Digite pelo menos ${MIN_CARACTERES_PARCIAL} caracteres. Use aspas para busca exata, ex.: "Marcos Vieira".`;
  }
  return `Nenhum resultado para "${termo.trim()}". Tente um trecho do nome ou remova os filtros.`;
}

export function AdminBusca({ itens }: AdminBuscaProps) {
  const [texto, setTexto] = useState('');
  const [grupo, setGrupo] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [pagina, setPagina] = useState(1);
  const termo = useDebouncedValue(texto, DEBOUNCE_MS);
  const carregando = texto !== termo;

  const grupos = useMemo(() => valoresUnicos(itens.map((i) => i.grupo)), [itens]);
  const statuses = useMemo(() => valoresUnicos(itens.map((i) => i.status)), [itens]);

  const resultado = useMemo(() => {
    try {
      return { lista: buscarItens(itens, { termo, grupo, status }), erro: false };
    } catch {
      return { lista: [] as ItemBusca[], erro: true };
    }
  }, [itens, termo, grupo, status]);

  const pag = paginarItens(resultado.lista, pagina, TAMANHO_PAGINA);
  const pesquisavel = termoEhPesquisavel(termo);
  const selectClasse = 'rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-foreground';

  return (
    <section aria-label="Pesquisar no painel" className="space-y-3 rounded-xl border border-line bg-white p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          role="searchbox"
          aria-label="Buscar no painel"
          placeholder='Buscar usuários, contas, registros ou planos… (use "aspas" para exata)'
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setPagina(1);
          }}
          className="w-full rounded-lg border border-line py-2 pl-9 pr-9 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {carregando && (
          <Loader2 aria-label="Pesquisando" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Módulo
          <select className={selectClasse} value={grupo} onChange={(e) => { setGrupo(e.target.value); setPagina(1); }}>
            <option value={TODOS}>Todos</option>
            {grupos.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Status
          <select className={selectClasse} value={status} onChange={(e) => { setStatus(e.target.value); setPagina(1); }}>
            <option value={TODOS}>Todos</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="text-sm">
        {carregando && <p className="text-muted-foreground">Pesquisando…</p>}
        {!carregando && resultado.erro && (
          <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
            Não foi possível pesquisar agora. Tente novamente.
          </p>
        )}
        {!carregando && !resultado.erro && pag.total === 0 && (
          <p className="text-muted-foreground">{mensagemSemResultado(termo, pesquisavel)}</p>
        )}
        {!carregando && !resultado.erro && pag.total > 0 && (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              {pag.total} {pag.total === 1 ? 'resultado' : 'resultados'}
            </p>
            <ul className="divide-y divide-line">
              {pag.itens.map((item, i) => (
                <li key={`${item.grupo}-${item.titulo}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-primary">{item.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.grupo} · {item.sub}</p>
                  </div>
                  {item.status && (
                    <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-primary">{item.status}</span>
                  )}
                </li>
              ))}
            </ul>
            {pag.totalPaginas > 1 && (
              <nav aria-label="Paginação da busca" className="mt-3 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  disabled={pag.pagina <= 1}
                  onClick={() => setPagina(pag.pagina - 1)}
                  className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
                >
                  ‹ Anterior
                </button>
                <span className="text-muted-foreground">Página {pag.pagina} de {pag.totalPaginas}</span>
                <button
                  type="button"
                  disabled={pag.pagina >= pag.totalPaginas}
                  onClick={() => setPagina(pag.pagina + 1)}
                  className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
                >
                  Próxima ›
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
