import { useState, useEffect, lazy, Suspense } from 'react';
import { MobileBottomNav } from './components/MobileBottomNav';
const MobileDashboard = lazy(() =>
  import('./components/MobileDashboard').then((m) => ({
    default: m.MobileDashboard,
  }))
);
const MobileAgenda = lazy(() =>
  import('./components/MobileAgenda').then((m) => ({ default: m.MobileAgenda }))
);
const MobileAtendimentos = lazy(() =>
  import('./components/MobileAtendimentos').then((m) => ({
    default: m.MobileAtendimentos,
  }))
);
const MobileRecursos = lazy(() =>
  import('./components/MobileRecursos').then((m) => ({
    default: m.MobileRecursos,
  }))
);
const MobileNotificacoes = lazy(() =>
  import('./components/MobileNotificacoes').then((m) => ({
    default: m.MobileNotificacoes,
  }))
);
const MobileSermoes = lazy(() =>
  import('./components/MobileSermoes').then((m) => ({
    default: m.MobileSermoes,
  }))
);
const MobileSettings = lazy(() =>
  import('./components/MobileSettings').then((m) => ({
    default: m.MobileSettings,
  }))
);
const MobileSearch = lazy(() =>
  import('./components/MobileSearch').then((m) => ({ default: m.MobileSearch }))
);
import { Auth } from './components/Auth';
import { Toaster } from './components/ui/sonner';
import { Badge } from './components/ui/badge';
import {
  Menu,
  Search,
  Wifi,
  WifiOff,
  CloudOff,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from './components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Separator } from './components/ui/separator';
import { useAuth } from './hooks/useAuth';
import { SupabaseService } from './lib/supabaseService';
import { OfflineStorage } from './lib/offlineStorage';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './components/ui/alert';

/**
 * App: gerencia navegação, autenticação e estados globais.
 * Aplica lazy loading nas telas para reduzir o bundle inicial.
 */
export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMode, setShowOfflineMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isConfigured,
  } = useAuth();

  // Monitor status online/offline
  useEffect(() => {
    const cleanup = OfflineStorage.addOnlineListener((online) => {
      setIsOnline(online);
      if (online) {
        toast.success('Conexão restaurada!');
      } else {
        toast.error('Você está offline');
      }
    });

    return cleanup;
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await SupabaseService.signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Modo offline manual
  const handleOfflineMode = () => {
    setShowOfflineMode(true);
    toast.info('Modo offline ativado. Seus dados serão salvos localmente.');
  };

  /**
   * renderView: define qual tela ativa renderizar de forma lazy.
   */
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <MobileDashboard />;
      case 'agenda':
        return <MobileAgenda />;
      case 'atendimentos':
        return <MobileAtendimentos />;
      case 'recursos':
        return <MobileRecursos />;
      case 'notificacoes':
        return <MobileNotificacoes />;
      case 'sermoes':
        return <MobileSermoes />;
      case 'settings':
        return <MobileSettings />;
      default:
        return <MobileDashboard />;
    }
  };

  // Loading state
  if (authLoading && isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002645] to-[#3261AB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#95C121] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Carregando PastorHub...</p>
        </div>
      </div>
    );
  }

  // Tela de autenticação (se Supabase configurado e não autenticado)
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
            <CloudOff className="w-4 h-4 mr-2" />
            Usar Modo Offline
          </Button>
        </div>
        <Toaster />
      </>
    );
  }

  // App principal
  const userName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Pastor';
  const userEmail = user?.email || 'Modo Offline';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#002645] to-[#3261AB] border-b border-[#002645]/20 shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#95C121] hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-[#002645]">Menu</SheetTitle>
                <SheetDescription>PastorHub App</SheetDescription>
              </SheetHeader>
              <div className="py-6">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#002645] to-[#3261AB] rounded-lg mb-6">
                  <Avatar className="w-12 h-12 bg-[#95C121] border-2 border-white">
                    <AvatarFallback className="bg-[#95C121] text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white">{userName}</p>
                    <p className="text-sm text-gray-200">{userEmail}</p>
                  </div>
                </div>

                {/* Status Connection */}
                <div className="mb-4">
                  {isOnline ? (
                    <Alert className="bg-green-50 border-green-200">
                      <Wifi className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-xs text-green-800">
                        {isAuthenticated
                          ? 'Conectado • Sincronizado'
                          : 'Online • Modo Local'}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-orange-50 border-orange-200">
                      <WifiOff className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-xs text-orange-800">
                        Offline • Dados salvos localmente
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-[#95C121] hover:text-white transition-colors"
                  >
                    Meu Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-[#95C121] hover:text-white transition-colors"
                  >
                    Configurações
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-[#95C121] hover:text-white transition-colors"
                  >
                    Sincronização
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-[#95C121] hover:text-white transition-colors"
                  >
                    Ajuda e Suporte
                  </Button>

                  {isAuthenticated && (
                    <>
                      <Separator className="my-4" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <h1 className="text-lg text-white">PastorHub</h1>
            <Badge
              variant="secondary"
              className="text-xs bg-[#95C121] text-white border-[#95C121] hover:bg-[#95C121]"
            >
              {isAuthenticated ? 'Online' : 'Offline'}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            {/* Indicador de conexão */}
            {isOnline ? (
              <Wifi className="w-4 h-4 text-[#95C121]" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-400" />
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#95C121] hover:text-white transition-colors"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {showSearch && (
        <Suspense
          fallback={<div className="p-4 text-center">Carregando busca...</div>}
        >
          <MobileSearch onClose={() => setShowSearch(false)} />
        </Suspense>
      )}

      {/* Main Content */}
      <main className="min-h-[calc(100vh-3.5rem)]">
        <Suspense
          fallback={<div className="p-6 text-center">Carregando...</div>}
        >
          {renderView()}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav activeView={activeView} onViewChange={setActiveView} />

      <Toaster />
    </div>
  );
}
