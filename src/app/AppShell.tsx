import { useEffect, useState, type ReactNode } from 'react';
import {
  Bell,
  BookMarked,
  BookOpen,
  CalendarDays,
  CreditCard,
  Globe2,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { iniciais } from '../lib/format';
import { solicitarCardPerfil } from '../lib/perfil';
import { Link, navegar } from './router';

/* ============================================================
   Shell responsivo unificado (mobile / tablet / desktop).
   Substitui os três shells do app estático por um único layout
   que reage ao breakpoint real da janela.
   ============================================================ */

export interface Destino {
  id: string;
  rotulo: string;
  icone: typeof Home;
  grupo: 'app' | 'estudo' | 'conta' | 'gestao';
}

export const DESTINOS: Destino[] = [
  { id: 'inicio', rotulo: 'Início', icone: Home, grupo: 'app' },
  { id: 'agenda', rotulo: 'Agenda', icone: CalendarDays, grupo: 'app' },
  { id: 'atendimentos', rotulo: 'Atendimentos', icone: Users, grupo: 'app' },
  { id: 'sermoes', rotulo: 'Sermões', icone: BookOpen, grupo: 'app' },
  { id: 'chat', rotulo: 'Chat', icone: MessageCircle, grupo: 'estudo' },
  { id: 'versiculos', rotulo: 'Versículos', icone: BookMarked, grupo: 'estudo' },
  { id: 'notificacoes', rotulo: 'Notificações', icone: Bell, grupo: 'estudo' },
  { id: 'perfil', rotulo: 'Perfil', icone: User, grupo: 'conta' },
  { id: 'planos', rotulo: 'Planos', icone: CreditCard, grupo: 'conta' },
  { id: 'admin', rotulo: 'Painel admin', icone: LayoutDashboard, grupo: 'gestao' },
  { id: 'biblioteca', rotulo: 'Biblioteca Digital', icone: Library, grupo: 'gestao' },
  { id: 'site', rotulo: 'Site', icone: Globe2, grupo: 'gestao' },
];

const GRUPOS: Array<{ id: Destino['grupo']; rotulo: string }> = [
  { id: 'app', rotulo: 'Ministério' },
  { id: 'estudo', rotulo: 'Estudo' },
  { id: 'conta', rotulo: 'Conta' },
  { id: 'gestao', rotulo: 'Gestão' },
];

const NAV_INFERIOR = ['inicio', 'agenda', 'biblioteca', 'chat', 'perfil'];

export function rotaAtiva(rota: string, id: string): boolean {
  return rota === id || rota.startsWith(`${id}/`);
}

function tituloDaRota(rota: string): string {
  const destino = DESTINOS.find((item) => rotaAtiva(rota, item.id));
  return destino?.rotulo ?? 'PastorHub';
}

interface AppShellProps {
  rota: string;
  children: ReactNode;
  nome: string;
  email: string;
  naoLidas?: number;
  onBuscar: () => void;
  onSair?: () => void;
}

export function AppShell({
  rota,
  children,
  nome,
  email,
  naoLidas = 0,
  onBuscar,
  onSair,
}: AppShellProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o drawer ao navegar e ao entrar em telas largas.
  useEffect(() => {
    setMenuAberto(false);
  }, [rota]);

  useEffect(() => {
    if (!menuAberto) return;
    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAberto(false);
    };
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', fecharComEsc);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', fecharComEsc);
    };
  }, [menuAberto]);

  const iniciaisUsuario = iniciais(nome);

  const itemNav = (destino: Destino, compacto: boolean) => {
    const ativo = rotaAtiva(rota, destino.id);
    const Icone = destino.icone;
    if (compacto) {
      return (
        <button
          key={destino.id}
          type="button"
          onClick={() => navegar(destino.id)}
          aria-current={ativo ? 'page' : undefined}
          aria-label={destino.rotulo}
          className={cn(
            'relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            ativo
              ? 'bg-accent text-primary'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icone className="h-5 w-5" />
          {destino.id === 'notificacoes' && naoLidas > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          )}
        </button>
      );
    }
    return (
      <Link
        key={destino.id}
        to={destino.id}
        aria-current={ativo ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
          ativo
            ? 'bg-accent font-semibold text-primary'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        )}
      >
        <Icone className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{destino.rotulo}</span>
        {destino.id === 'notificacoes' && naoLidas > 0 && (
          <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-primary">
            {naoLidas}
          </span>
        )}
      </Link>
    );
  };

  const cartaoPerfil = (
    <Link
      to="perfil"
      className="flex items-center gap-3 rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/15"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
        {iniciaisUsuario}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">
          {nome}
        </span>
        <span className="block truncate text-xs text-white/70">{email}</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-soft text-foreground">
      {/* Sidebar fixa em tablet/desktop */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-primary md:flex"
        aria-label="Menu principal"
      >
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-white">PastorHub</p>
            <p className="text-[11px] text-white/60">Caderno Pastoral</p>
          </div>
        </div>

        <div className="px-3">{cartaoPerfil}</div>

        <nav className="mt-4 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {GRUPOS.map((grupo) => {
            const itens = DESTINOS.filter((item) => item.grupo === grupo.id);
            if (!itens.length) return null;
            return (
              <div key={grupo.id}>
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {grupo.rotulo}
                </p>
                <div className="space-y-0.5">{itens.map((item) => itemNav(item, false))}</div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => navegar('configuracoes')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </button>
          {onSair && (
            <button
              type="button"
              onClick={onSair}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          )}
        </div>
      </aside>

      {/* Drawer mobile */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          menuAberto ? 'visible' : 'invisible delay-300',
        )}
        aria-hidden={!menuAberto}
      >
        <div
          className={cn(
            'absolute inset-0 bg-[#001a2f]/60 transition-opacity duration-300',
            menuAberto ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMenuAberto(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            'absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-primary shadow-2xl transition-transform duration-300 ease-out',
            menuAberto ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-accent" />
              <span className="font-bold">Menu</span>
            </span>
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-3">{cartaoPerfil}</div>
          <nav className="mt-4 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
            {GRUPOS.map((grupo) => {
              const itens = DESTINOS.filter((item) => item.grupo === grupo.id);
              if (!itens.length) return null;
              return (
                <div key={grupo.id}>
                  <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {grupo.rotulo}
                  </p>
                  <div className="space-y-0.5">
                    {itens.map((item) => itemNav(item, false))}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={() => navegar('configuracoes')}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </button>
            {onSair && (
              <button
                type="button"
                onClick={onSair}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            )}
          </div>
        </aside>
      </div>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-gradient-to-r from-primary to-[#3261AB] px-3 text-white shadow-md sm:px-4">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="rounded-lg p-2 hover:bg-accent hover:text-primary md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-base font-bold">PastorHub</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-primary">
              App
            </span>
          </div>
          <h1 className="hidden flex-1 text-sm font-semibold md:block">
            {tituloDaRota(rota)}
          </h1>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onBuscar}
              aria-label="Buscar"
              className="rounded-lg p-2 hover:bg-white/15"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navegar('notificacoes')}
              aria-label={`Notificações${naoLidas ? ` (${naoLidas} não lidas)` : ''}`}
              className="relative rounded-lg p-2 hover:bg-white/15"
            >
              <Bell className="h-5 w-5" />
              {naoLidas > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary">
                  {naoLidas > 9 ? '9+' : naoLidas}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                solicitarCardPerfil();
                navegar('perfil');
              }}
              aria-label="Abrir meu perfil"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary"
            >
              {iniciaisUsuario}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl pb-24 md:pb-10">{children}</main>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/20 bg-primary pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Navegação principal"
      >
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_INFERIOR.map((id) => {
            const destino = DESTINOS.find((item) => item.id === id);
            if (!destino) return null;
            const ativo = rotaAtiva(rota, destino.id);
            const Icone = destino.icone;
            return (
              <button
                key={id}
                type="button"
                onClick={() => navegar(id)}
                aria-label={destino.rotulo}
                aria-pressed={ativo}
                className={cn(
                  'flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors',
                  ativo ? 'text-accent' : 'text-white/60 hover:text-white',
                )}
              >
                <Icone
                  className={cn('h-5 w-5', ativo && 'scale-110')}
                  strokeWidth={ativo ? 2.5 : 2}
                />
                <span className="text-[11px]">{destino.rotulo}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
