import { useEffect, lazy, Suspense, useState } from 'react';
import { Auth } from './components/Auth';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { CloudOff } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { SupabaseService } from './lib/supabaseService';
import { OfflineStorage } from './lib/offlineStorage';
import { toast } from 'sonner@2.0.3';
import { AppShell } from './app/AppShell';
import { Link, useRota } from './app/router';

/* Telas do caderno pastoral (já existentes no projeto React). */
const MobileDashboard = lazy(() =>
  import('./components/MobileDashboard').then((m) => ({
    default: m.MobileDashboard,
  })),
);
const MobileAgenda = lazy(() =>
  import('./components/MobileAgenda').then((m) => ({ default: m.MobileAgenda })),
);
const MobileAtendimentos = lazy(() =>
  import('./components/MobileAtendimentos').then((m) => ({
    default: m.MobileAtendimentos,
  })),
);
const MobileNotificacoes = lazy(() =>
  import('./components/MobileNotificacoes').then((m) => ({
    default: m.MobileNotificacoes,
  })),
);
const MobileSermoes = lazy(() =>
  import('./components/MobileSermoes').then((m) => ({
    default: m.MobileSermoes,
  })),
);
const MobileSearch = lazy(() =>
  import('./components/MobileSearch').then((m) => ({ default: m.MobileSearch })),
);

/* Telas migradas do app estático (versão do membro). */
const BibliotecaCatalogo = lazy(() =>
  import('./features/biblioteca/BibliotecaCatalogo').then((m) => ({
    default: m.BibliotecaCatalogo,
  })),
);
const LivroDetalhe = lazy(() =>
  import('./features/biblioteca/LivroDetalhe').then((m) => ({
    default: m.LivroDetalhe,
  })),
);
const ChatPage = lazy(() =>
  import('./features/chat/ChatPage').then((m) => ({ default: m.ChatPage })),
);
const VersiculosPage = lazy(() =>
  import('./features/versiculos/VersiculosPage').then((m) => ({
    default: m.VersiculosPage,
  })),
);
const PerfilPage = lazy(() =>
  import('./features/perfil/PerfilPage').then((m) => ({
    default: m.PerfilPage,
  })),
);
const PlanosPage = lazy(() =>
  import('./features/planos/PlanosPage').then((m) => ({
    default: m.PlanosPage,
  })),
);
const ConfiguracoesPage = lazy(() =>
  import('./features/configuracoes/ConfiguracoesPage').then((m) => ({
    default: m.ConfiguracoesPage,
  })),
);
const AdminPage = lazy(() =>
  import('./features/admin/AdminPage').then((m) => ({ default: m.AdminPage })),
);
const DocsPage = lazy(() =>
  import('./features/docs/DocsPage').then((m) => ({ default: m.DocsPage })),
);
const SitePage = lazy(() =>
  import('./features/site/SitePage').then((m) => ({ default: m.SitePage })),
);

const NOTIFICACOES_NAO_LIDAS = 2;

/** Aviso temporário para áreas que ainda serão portadas nas próximas fases. */
function EmBreve({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-primary">{titulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="inicio">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * App: ponto único de integração. Mantém autenticação/offline do projeto
 * React e roteia entre as telas do caderno pastoral e as telas migradas
 * do app estático, dentro de um shell responsivo.
 */
export default function App() {
  const { rota, secao, id } = useRota();
  const [showSearch, setShowSearch] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isConfigured,
  } = useAuth();

  // Monitor status online/offline
  useEffect(() => {
    return OfflineStorage.addOnlineListener((online) => {
      if (online) toast.success('Conexão restaurada!');
      else toast.error('Você está offline');
    });
  }, []);

  const handleLogout = async () => {
    if (!isAuthenticated) {
      setShowOfflineMode(false);
      toast.info('Sessão local encerrada.');
      return;
    }
    try {
      await SupabaseService.signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleOfflineMode = () => {
    setShowOfflineMode(true);
    toast.info('Modo offline ativado. Seus dados serão salvos localmente.');
  };

  const renderView = () => {
    switch (secao) {
      case 'inicio':
        return <MobileDashboard />;
      case 'agenda':
        return <MobileAgenda />;
      case 'atendimentos':
        return <MobileAtendimentos />;
      case 'sermoes':
        return <MobileSermoes />;
      case 'biblioteca':
        return id ? <LivroDetalhe livroId={id} /> : <BibliotecaCatalogo />;
      case 'chat':
        return <ChatPage />;
      case 'versiculos':
        return <VersiculosPage />;
      case 'notificacoes':
        return <MobileNotificacoes />;
      case 'perfil':
        return <PerfilPage />;
      case 'planos':
        return <PlanosPage />;
      case 'configuracoes':
        return (
          <ConfiguracoesPage
            onSair={handleLogout}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'admin':
        return <AdminPage />;
      case 'docs':
        return <DocsPage />;
      case 'site':
        return <SitePage />;
      default:
        return (
          <EmBreve
            titulo="Área em migração"
            descricao="Esta seção está sendo portada do app estático e será liberada em breve."
          />
        );
    }
  };

  if (authLoading && isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#002645] to-[#3261AB]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#95C121] border-t-transparent" />
          <p className="text-white">Carregando PastorHub...</p>
        </div>
      </div>
    );
  }

  if (isConfigured && !isAuthenticated && !showOfflineMode) {
    return (
      <>
        <Auth onAuthSuccess={() => {}} />
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            onClick={handleOfflineMode}
            className="bg-white shadow-lg"
          >
            <CloudOff className="mr-2 h-4 w-4" />
            Usar Modo Offline
          </Button>
        </div>
        <Toaster />
      </>
    );
  }

  const userName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pastor';
  const userEmail = user?.email || 'Modo Offline';

  return (
    <>
      <AppShell
        rota={rota}
        nome={userName}
        email={userEmail}
        naoLidas={NOTIFICACOES_NAO_LIDAS}
        onBuscar={() => setShowSearch(true)}
        onSair={handleLogout}
      >
        <Suspense
          fallback={
            <div className="p-6 text-center text-sm text-muted-foreground">
              Carregando…
            </div>
          }
        >
          {renderView()}
        </Suspense>
      </AppShell>

      {showSearch && (
        <Suspense fallback={null}>
          <MobileSearch onClose={() => setShowSearch(false)} />
        </Suspense>
      )}

      <Toaster />
    </>
  );
}
