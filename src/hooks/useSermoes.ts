import { useState, useEffect, useCallback, useRef } from 'react';
import { SupabaseService } from '../lib/supabaseService';
import { OfflineStorage } from '../lib/offlineStorage';
import type { Sermon } from '../types';
import { toast } from 'sonner@2.0.3';

/**
 * Hook principal para gerenciamento de sermões (online/offline) com paginação opcional
 */
export function useSermoes(
  isAuthenticated: boolean,
  isSupabaseConfigured: boolean
) {
  const [sermoes, setSermoes] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const loadSermoesRef =
    useRef<(opts?: { reset?: boolean }) => Promise<void>>();

  // Modo: online com Supabase ou offline com localStorage
  const useSupabase = isAuthenticated && isSupabaseConfigured && isOnline;

  /**
   * Carrega sermões. Em modo online, utiliza paginação via `limit` e `page`.
   * Use `reset: true` para reiniciar a paginação (page = 1) e substituir a lista.
   */
  const loadSermoes = useCallback(
    async (opts?: { reset?: boolean }) => {
      setLoading(true);

      try {
        if (useSupabase) {
          // Em modo online: paginação
          const nextPage = opts?.reset ? 1 : page;
          const data = await SupabaseService.getSermoes({
            limit,
            page: nextPage,
          });
          if (opts?.reset) {
            setPage(1);
            setSermoes(data);
          } else {
            setSermoes((prev) => (nextPage === 1 ? data : [...prev, ...data]));
          }

          // Atualiza indicador de "tem mais"
          setHasMore(data.length === limit);

          // Salvar localmente para offline
          OfflineStorage.saveSermoes(
            opts?.reset ? data : nextPage === 1 ? data : [...sermoes, ...data]
          );
          OfflineStorage.setLastSync();
        } else {
          // Carregar do localStorage
          const data = OfflineStorage.getSermoes();
          setSermoes(data);
          // Em modo offline não há paginação real do backend
          setHasMore(false);
        }
      } catch (error) {
        console.error('Erro ao carregar sermões:', error);
        toast.error('Erro ao carregar sermões');

        // Fallback para localStorage em caso de erro
        const data = OfflineStorage.getSermoes();
        setSermoes(data);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [useSupabase, page, limit, sermoes]
  );

  /**
   * Carrega a próxima página e concatena à lista atual (somente online)
   */
  const loadMore = useCallback(async () => {
    if (!useSupabase || loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await SupabaseService.getSermoes({ limit, page: nextPage });
      setSermoes((prev) => {
        const combined = [...prev, ...data];
        // Persistir a lista combinada para uso offline
        OfflineStorage.saveSermoes(combined);
        OfflineStorage.setLastSync();
        return combined;
      });
      setPage(nextPage);
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Erro ao carregar mais sermões:', error);
      toast.error('Erro ao carregar mais sermões');
    } finally {
      setLoading(false);
    }
  }, [useSupabase, page, limit, hasMore, loading]);

  // Criar sermão
  const createSermao = useCallback(
    async (sermon: Omit<Sermon, 'id'>) => {
      try {
        if (useSupabase) {
          // Criar no Supabase
          const newSermon = await SupabaseService.createSermao(sermon);
          setSermoes((prev) => [newSermon, ...prev]);

          // Atualizar localStorage
          OfflineStorage.addSermao(newSermon);

          toast.success('Sermão criado com sucesso!');
          return newSermon;
        } else {
          // Criar localmente
          const newSermon: Sermon = {
            ...sermon,
            id: Date.now().toString(),
          } as Sermon;

          setSermoes((prev) => [newSermon, ...prev]);
          OfflineStorage.addSermao(newSermon);

          // Adicionar à fila de sincronização
          OfflineStorage.addToSyncQueue({
            id: newSermon.id,
            type: 'create',
            data: newSermon,
          });

          toast.success('Sermão salvo localmente!');
          return newSermon;
        }
      } catch (error) {
        console.error('Erro ao criar sermão:', error);
        toast.error('Erro ao criar sermão');
        throw error;
      }
    },
    [useSupabase]
  );

  // Atualizar sermão
  const updateSermao = useCallback(
    async (id: string, updates: Partial<Sermon>) => {
      try {
        if (useSupabase) {
          // Atualizar no Supabase
          const updated = await SupabaseService.updateSermao(id, updates);
          setSermoes((prev) => prev.map((s) => (s.id === id ? updated : s)));

          // Atualizar localStorage
          OfflineStorage.updateSermao(id, updates);

          toast.success('Sermão atualizado!');
          return updated;
        } else {
          // Atualizar localmente
          setSermoes((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
          );
          OfflineStorage.updateSermao(id, updates);

          // Adicionar à fila de sincronização
          OfflineStorage.addToSyncQueue({
            id,
            type: 'update',
            data: updates,
          });

          toast.success('Sermão atualizado localmente!');
        }
      } catch (error) {
        console.error('Erro ao atualizar sermão:', error);
        toast.error('Erro ao atualizar sermão');
        throw error;
      }
    },
    [useSupabase]
  );

  // Deletar sermão
  const deleteSermao = useCallback(
    async (id: string) => {
      try {
        if (useSupabase) {
          // Deletar no Supabase
          await SupabaseService.deleteSermao(id);
          setSermoes((prev) => prev.filter((s) => s.id !== id));

          // Deletar do localStorage
          OfflineStorage.deleteSermao(id);

          toast.success('Sermão excluído!');
        } else {
          // Deletar localmente
          setSermoes((prev) => prev.filter((s) => s.id !== id));
          OfflineStorage.deleteSermao(id);

          // Adicionar à fila de sincronização
          OfflineStorage.addToSyncQueue({
            id,
            type: 'delete',
            data: null,
          });

          toast.success('Sermão excluído localmente!');
        }
      } catch (error) {
        console.error('Erro ao deletar sermão:', error);
        toast.error('Erro ao deletar sermão');
        throw error;
      }
    },
    [useSupabase]
  );

  // Toggle status pregado
  const togglePregado = useCallback(
    async (id: string, status: boolean) => {
      try {
        const updates: Partial<Sermon> = {
          status_pregado: status,
          data_pregado: status ? new Date().toISOString().split('T')[0] : null,
        };

        await updateSermao(id, updates);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    },
    [updateSermao]
  );

  // Sincronizar com Supabase (processar fila offline)
  /**
   * Processa fila offline e sincroniza com Supabase
   */
  const syncWithSupabase = useCallback(async () => {
    if (!isAuthenticated || !isSupabaseConfigured) {
      return;
    }

    const queue = OfflineStorage.getSyncQueue();
    if (queue.length === 0) {
      return;
    }

    setSyncing(true);
    toast.info(`Sincronizando ${queue.length} alterações...`);

    try {
      for (const action of queue) {
        switch (action.type) {
          case 'create':
            await SupabaseService.createSermao(action.data);
            break;
          case 'update':
            await SupabaseService.updateSermao(action.id, action.data);
            break;
          case 'delete':
            await SupabaseService.deleteSermao(action.id);
            break;
        }
      }

      // Limpar fila após sincronização bem-sucedida
      OfflineStorage.clearSyncQueue();
      OfflineStorage.setLastSync();

      // Recarregar dados reiniciando paginação
      await loadSermoes({ reset: true });

      toast.success('Sincronização concluída!');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  }, [isAuthenticated, isSupabaseConfigured, loadSermoes]);

  // Manter referência estável da função de carregamento
  useEffect(() => {
    loadSermoesRef.current = loadSermoes;
  }, [loadSermoes]);

  // Carregar sermões ao montar (resetando paginação) apenas uma vez
  useEffect(() => {
    loadSermoesRef.current?.({ reset: true });
  }, []);

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    const cleanup = OfflineStorage.addOnlineListener((online) => {
      setIsOnline(online);

      if (online && isAuthenticated && isSupabaseConfigured) {
        // Tentar sincronizar quando voltar online
        syncWithSupabase();
      }
    });

    return cleanup;
  }, [isAuthenticated, isSupabaseConfigured, syncWithSupabase]);

  // Sincronizar periodicamente se necessário
  useEffect(() => {
    if (!useSupabase) return;

    const interval = setInterval(() => {
      if (OfflineStorage.needsSync()) {
        loadSermoesRef.current?.({ reset: true });
      }
    }, 5 * 60 * 1000); // A cada 5 minutos

    return () => clearInterval(interval);
  }, [useSupabase]);

  return {
    sermoes,
    loading,
    syncing,
    isOnline,
    useSupabase,
    page,
    limit,
    hasMore,
    setLimit,
    createSermao,
    updateSermao,
    deleteSermao,
    togglePregado,
    refreshSermoes: (opts?: { reset?: boolean }) => loadSermoes(opts),
    loadMore,
    syncWithSupabase,
  };
}
