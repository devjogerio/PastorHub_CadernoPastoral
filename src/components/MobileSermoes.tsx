import { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, Plus, RefreshCw, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../hooks/useAuth';
import { useSermoes } from '../hooks/useSermoes';
import { PDFExporter } from '../lib/pdfExport';
import { OfflineStorage } from '../lib/offlineStorage';
import { Sermon } from '../types';
import { SermonItem } from './SermonItem';

const SermonGenerator = lazy(() =>
  import('./SermonGenerator').then((module) => ({
    default: module.SermonGenerator,
  }))
);
const SermonEditor = lazy(() =>
  import('./SermonEditor').then((module) => ({ default: module.SermonEditor }))
);

export function MobileSermoes() {
  const { isAuthenticated, isConfigured } = useAuth();
  const {
    sermoes,
    loading,
    syncing,
    isOnline,
    useSupabase,
    page,
    limit,
    hasMore,
    loadMore,
    createSermao,
    updateSermao,
    deleteSermao,
    togglePregado,
    refreshSermoes,
    syncWithSupabase,
  } = useSermoes(isAuthenticated, isConfigured);

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'todos' | 'pregado' | 'nao_pregado'
  >('todos');

  const handleNewSermon = async (sermon: Sermon) => {
    await createSermao(sermon);
    setGeneratorOpen(false);
  };

  const handleEditSermon = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setEditorOpen(true);
  };

  const handleUpdateSermon = async (updatedSermon: Sermon) => {
    await updateSermao(updatedSermon.id, updatedSermon);
    setEditorOpen(false);
    setSelectedSermon(null);
  };

  const handleDeleteSermon = async (id: string) => {
    await deleteSermao(id);
  };

  const handleTogglePregado = async (id: string, currentStatus: boolean) => {
    await togglePregado(id, !currentStatus);
  };

  const handleExportPDF = async (sermon: Sermon) => {
    try {
      await PDFExporter.exportSermon(sermon);
      toast.success('Abrindo visualização de PDF...');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleDownloadText = (sermon: Sermon) => {
    try {
      PDFExporter.downloadAsText(sermon);
      toast.success('Arquivo baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar texto:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleRefresh = async () => {
    await refreshSermoes({ reset: true });
    toast.success('Sermões atualizados!');
  };

  const handleSync = async () => {
    await syncWithSupabase();
  };

  const filteredSermoes = sermoes.filter((sermon) => {
    const matchesSearch =
      sermon.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.texto_biblico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.tema.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'todos'
        ? true
        : filterStatus === 'pregado'
        ? sermon.status_pregado
        : !sermon.status_pregado;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: sermoes.length,
    pregados: sermoes.filter((s) => s.status_pregado).length,
    naoPregados: sermoes.filter((s) => !s.status_pregado).length,
  };

  // Storage stats para debug
  const storageStats = OfflineStorage.getStorageStats();

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2>Caderno do Pastor</h2>
            <p className="text-sm text-muted-foreground">
              Seus sermões e mensagens
            </p>
          </div>
          <div className="flex gap-2">
            {!useSupabase && storageStats.syncQueueCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing || !isOnline}
                className="text-xs"
              >
                <RefreshCw
                  className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`}
                />
                Sync ({storageStats.syncQueueCount})
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Status indicator */}
        {!useSupabase && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 inline-flex items-center gap-1">
            {isOnline ? '🟢' : '🔴'} Modo {useSupabase ? 'Online' : 'Offline'} •{' '}
            {storageStats.sermoesCount} sermões salvos localmente
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-2xl">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                Pregados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-2xl text-[#95C121]">{stats.pregados}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                Aguardando
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-2xl text-orange-500">{stats.naoPregados}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Sermon Button */}
      <div className="px-4">
        <Sheet open={generatorOpen} onOpenChange={setGeneratorOpen}>
          <SheetTrigger asChild>
            <Button className="w-full bg-[#002645] hover:bg-[#95C121] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Sermão com IA
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[95vh]">
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }
            >
              <SermonGenerator
                onSermonCreated={handleNewSermon}
                onCancel={() => setGeneratorOpen(false)}
              />
            </Suspense>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search and Filter */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sermões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('todos')}
            className={
              filterStatus === 'todos' ? 'bg-[#002645] hover:bg-[#95C121]' : ''
            }
          >
            Todos
          </Button>
          <Button
            variant={filterStatus === 'pregado' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pregado')}
            className={
              filterStatus === 'pregado'
                ? 'bg-[#95C121] hover:bg-[#002645]'
                : ''
            }
          >
            Pregados
          </Button>
          <Button
            variant={filterStatus === 'nao_pregado' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('nao_pregado')}
            className={
              filterStatus === 'nao_pregado'
                ? 'bg-orange-500 hover:bg-orange-600'
                : ''
            }
          >
            Aguardando
          </Button>
        </div>
      </div>

      {/* Sermons List */}
      <div className="px-4 space-y-3">
        {loading && sermoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-[#002645] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-muted-foreground">Carregando sermões...</p>
            </CardContent>
          </Card>
        ) : filteredSermoes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'todos'
                  ? 'Nenhum sermão encontrado'
                  : 'Você ainda não tem sermões. Crie seu primeiro sermão com IA!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSermoes.map((sermon) => (
            <SermonItem
              key={sermon.id}
              sermon={sermon}
              onEdit={handleEditSermon}
              onDelete={handleDeleteSermon}
              onTogglePregado={handleTogglePregado}
              onExportPDF={handleExportPDF}
              onDownloadText={handleDownloadText}
            />
          ))
        )}
        {useSupabase && filteredSermoes.length > 0 && (
          <div className="py-2">
            {hasMore ? (
              <Button
                className="w-full"
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#002645] border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  `Carregar mais`
                )}
              </Button>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Todos os sermões carregados
              </p>
            )}
          </div>
        )}
      </div>

      {/* Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="bottom" className="h-[95vh]">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            {selectedSermon && (
              <SermonEditor
                sermon={selectedSermon}
                onSave={handleUpdateSermon}
                onCancel={() => {
                  setEditorOpen(false);
                  setSelectedSermon(null);
                }}
              />
            )}
          </Suspense>
        </SheetContent>
      </Sheet>
    </div>
  );
}
