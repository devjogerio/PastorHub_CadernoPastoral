import type { Sermon } from "../types";

// Tipos
export interface SyncAction {
  id: string;
  type: "create" | "update" | "delete";
  data: any;
  timestamp: number;
}

// Sistema de sincronização offline-first usando localStorage
export class OfflineStorage {
  private static SERMOES_KEY = "pastorhub_sermoes";
  private static SYNC_QUEUE_KEY = "pastorhub_sync_queue";
  private static LAST_SYNC_KEY = "pastorhub_last_sync";

  // ==================== SERMÕES LOCAIS ====================

  // Salvar sermões localmente
  static saveSermoes(sermoes: Sermon[]): void {
    try {
      localStorage.setItem(this.SERMOES_KEY, JSON.stringify(sermoes));
    } catch (error) {
      console.error("Erro ao salvar sermões localmente:", error);
    }
  }

  // Carregar sermões locais
  static getSermoes(): Sermon[] {
    try {
      const data = localStorage.getItem(this.SERMOES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao carregar sermões locais:", error);
      return [];
    }
  }

  // Adicionar sermão local
  static addSermao(sermon: Sermon): void {
    const sermoes = this.getSermoes();
    sermoes.unshift(sermon);
    this.saveSermoes(sermoes);
  }

  // Atualizar sermão local
  static updateSermao(id: string, updates: Partial<Sermon>): void {
    const sermoes = this.getSermoes();
    const index = sermoes.findIndex((s) => s.id === id);

    if (index !== -1) {
      sermoes[index] = { ...sermoes[index], ...updates };
      this.saveSermoes(sermoes);
    }
  }

  // Deletar sermão local
  static deleteSermao(id: string): void {
    const sermoes = this.getSermoes();
    const filtered = sermoes.filter((s) => s.id !== id);
    this.saveSermoes(filtered);
  }

  // ==================== FILA DE SINCRONIZAÇÃO ====================

  // Adicionar ação à fila de sincronização
  static addToSyncQueue(action: Omit<SyncAction, "timestamp">): void {
    try {
      const queue = this.getSyncQueue();
      queue.push({ ...action, timestamp: Date.now() });
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("Erro ao adicionar à fila de sincronização:", error);
    }
  }

  // Obter fila de sincronização
  static getSyncQueue(): SyncAction[] {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao carregar fila de sincronização:", error);
      return [];
    }
  }

  // Limpar fila de sincronização
  static clearSyncQueue(): void {
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  // Remove uma ação da fila após sincronizar com sucesso (evita reprocessamento)
  static removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue().filter((a) => a.id !== id);
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("Erro ao remover da fila de sincronização:", error);
    }
  }

  // ==================== SINCRONIZAÇÃO ====================

  // Salvar timestamp da última sincronização
  static setLastSync(timestamp: number = Date.now()): void {
    localStorage.setItem(this.LAST_SYNC_KEY, timestamp.toString());
  }

  // Obter timestamp da última sincronização
  static getLastSync(): number | null {
    const data = localStorage.getItem(this.LAST_SYNC_KEY);
    return data ? parseInt(data, 10) : null;
  }

  // Verificar se precisa sincronizar (30 minutos)
  static needsSync(): boolean {
    const lastSync = this.getLastSync();
    if (!lastSync) return true;

    const thirtyMinutes = 30 * 60 * 1000;
    return Date.now() - lastSync > thirtyMinutes;
  }

  // ==================== UTILITÁRIOS ====================

  // Limpar todos os dados locais
  static clearAll(): void {
    localStorage.removeItem(this.SERMOES_KEY);
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
    localStorage.removeItem(this.LAST_SYNC_KEY);
  }

  // Obter estatísticas de armazenamento
  static getStorageStats(): {
    sermoesCount: number;
    syncQueueCount: number;
    lastSync: string | null;
    storageUsed: string;
  } {
    const sermoes = this.getSermoes();
    const queue = this.getSyncQueue();
    const lastSync = this.getLastSync();

    // Calcular uso de armazenamento
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith("pastorhub_")) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    return {
      sermoesCount: sermoes.length,
      syncQueueCount: queue.length,
      lastSync: lastSync ? new Date(lastSync).toLocaleString("pt-BR") : null,
      storageUsed: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  }

  // Verificar se está online
  static isOnline(): boolean {
    return navigator.onLine;
  }

  // Adicionar listener para status online/offline
  static addOnlineListener(callback: (isOnline: boolean) => void): () => void {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    // Retorna função para remover listeners
    return () => {
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
    };
  }
}