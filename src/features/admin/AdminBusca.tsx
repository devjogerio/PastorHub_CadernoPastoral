import { useMemo, useState, type KeyboardEvent } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  MIN_CARACTERES,
  TIPOS,
  TODOS,
  agruparPorTipo,
  buscarItens,
  termoEhPesquisavel,
  type ItemBusca,
} from './busca';

const DEBOUNCE_MS = 250;

interface AdminBuscaProps {
  itens: ItemBusca[];
}

function valoresUnicos(lista: string[]): string[] {
  return Array.from(new Set(lista.filter(Boolean))).sort();
}

function achatar(grupos: ReturnType<typeof agruparPorTipo>): ItemBusca[] {
  return grupos.reduce<ItemBusca[]>((todos, g) => todos.concat(g.itens), []);
}

export function AdminBusca({ itens }: AdminBuscaProps) {
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState(TODOS);
  const [grupo, setGrupo] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [ativo, setAtivo] = useState(0);
  const termo = useDebouncedValue(texto, DEBOUNCE_MS);
  const digitouMinimo = termoEhPesquisavel(texto);
  const carregando = digitouMinimo && texto !== termo;

  const grupos = useMemo(() => valoresUnicos(itens.map((i) => i.grupo)), [itens]);
  const statuses = useMemo(() => valoresUnicos(itens.map((i) => i.status)), [itens]);

  const resultado = useMemo(() => {
    if (!termoEhPesquisavel(termo)) return { grupos: [], plano: [] as ItemBusca[] };
    const lista = buscarItens(itens, { termo, tipo, grupo, status });
    const agrupados = agruparPorTipo(lista);
    return { grupos: agrupados, plano: achatar(agrupados) };
  }, [itens, termo, tipo, grupo, status]);

  const indiceAtivo = Math.min(ativo, Math.max(resultado.plano.length - 1, 0));

  function limpar() {
    setTexto('');
    setAtivo(0);
  }

  function executar(item: ItemBusca | undefined) {
    if (!item?.executar) return;
    item.executar();
    limpar();
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') return limpar();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      return setAtivo(Math.min(indiceAtivo + 1, resultado.plano.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      return setAtivo(Math.max(indiceAtivo - 1, 0));
    }
    if (e.key === 'Enter' && digitouMinimo) {
      e.preventDefault();
      executar(resultado.plano[indiceAtivo]);
    }
  }

  const selectClasse = 'rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-foreground';
  const chipClasse = (ok: boolean) =>
    `rounded-full border px-3 py-1 text-xs ${ok ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted-foreground'}`;

  return (
    <section aria-label="Pesquisar no painel" className="space-y-3 rounded-xl border border-line bg-white p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          role="combobox"
          aria-expanded={digitouMinimo && resultado.plano.length > 0}
          aria-controls="admin-busca-resultados"
          aria-label="Buscar no painel"
          placeholder={`Buscar conteúdos, funcionalidades ou ações (mín. ${MIN_CARACTERES} letras)`}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAtivo(0);
          }}
          onKeyDown={aoTeclar}
          className="w-full rounded-lg border border-line py-2 pl-9 pr-9 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {carregando && (
          <Loader2 aria-label="Pesquisando" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      {!digitouMinimo && (
        <p className="text-xs text-muted-foreground">
          Digite pelo menos {MIN_CARACTERES} caracteres para pesquisar. Use aspas para busca exata, ex.: "Marcos Vieira".
        </p>
      )}

      {digitouMinimo && !carregando && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
            {[{ id: TODOS, rotulo: 'Tudo' }, ...TIPOS].map((t) => (
              <button key={t.id} type="button" className={chipClasse(tipo === t.id)} onClick={() => setTipo(t.id)}>
                {t.rotulo}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Módulo
              <select className={selectClasse} value={grupo} onChange={(e) => { setGrupo(e.target.value); setAtivo(0); }}>
                <option value={TODOS}>Todos</option>
                {grupos.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Status
              <select className={selectClasse} value={status} onChange={(e) => { setStatus(e.target.value); setAtivo(0); }}>
                <option value={TODOS}>Todos</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
        </div>
      )}

      <div aria-live="polite" className="text-sm">
        {carregando && <p className="text-muted-foreground">Pesquisando…</p>}
        {!carregando && digitouMinimo && resultado.plano.length === 0 && (
          <p className="text-muted-foreground">Nenhum resultado para "{texto.trim()}". Tente outro termo ou remova os filtros.</p>
        )}
        {!carregando && digitouMinimo && resultado.plano.length > 0 && (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              {resultado.plano.length} {resultado.plano.length === 1 ? 'resultado' : 'resultados'}
            </p>
            <div id="admin-busca-resultados" role="listbox" aria-label="Resultados da busca" className="max-h-[420px] overflow-y-auto">
              {resultado.grupos.map((g) => (
                <div key={g.id} className="mb-2">
                  <p className="px-1 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {g.rotulo} · {g.itens.length}
                  </p>
                  <ul className="divide-y divide-line">
                    {g.itens.map((item) => {
                      const posicao = resultado.plano.indexOf(item);
                      const marcado = posicao === indiceAtivo;
                      return (
                        <li key={`${item.tipo}-${item.grupo}-${item.titulo}-${posicao}`}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={marcado}
                            onClick={() => executar(item)}
                            className={`flex w-full flex-wrap items-center justify-between gap-2 px-2 py-2 text-left hover:bg-soft ${marcado ? 'bg-accent/15' : ''}`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-primary">{item.titulo}</span>
                              <span className="block truncate text-xs text-muted-foreground">{item.grupo} · {item.sub}</span>
                            </span>
                            {item.status && (
                              <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-primary">{item.status}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
