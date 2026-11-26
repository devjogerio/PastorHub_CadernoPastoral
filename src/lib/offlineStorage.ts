import type { Sermon } from "../types";

// Tipos
export interface SyncAction {
  id: string;
  type: "create" | "update" | "delete";
  data: any;
  timestamp: number;
}

/**
 * Cache offline-first do app React.
 *
 * Os dados pastorais (sermões e fila de sincronização) podem conter conteúdo
 * íntimo; por isso são gravados cifrados com AES-GCM. A chave é gerada no
 * dispositivo e guardada como CryptoKey não-exportável no IndexedDB: um dump
 * do localStorage não revela o conteúdo e a chave não pode ser copiada por JS.
 *
 * A API pública continua síncrona (compatível com hooks e testes); a leitura e
 * a gravação cifradas acontecem em segundo plano, com cache em memória.
 */

const DB_NAME = "pastorhub_vault";
const STORE_NAME = "chaves";
const KEY_ID = "offline-aes-gcm";

/** A fila de sincronização é efêmera: descartamos ações com mais de 7 dias. */
const RETENCAO_FILA_MS = 7 * 24 * 60 * 60 * 1000;

export const EVENTO_OFFLINE_PRONTO = "pastorhub:offline-ready";

interface Envelope {
  v: 1;
  iv: string;
  data: string;
}

// ==================== Criptografia em repouso ====================

let chaveEmCache: CryptoKey | null | undefined;

function subtleDisponivel(): SubtleCrypto | null {
  try {
    return globalThis.crypto?.subtle ?? null;
  } catch {
    return null;
  }
}

function bytesParaBase64(bytes: Uint8Array): string {
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario);
}

function base64ParaBytes(valor: string): Uint8Array {
  const binario = atob(valor);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function abrirBanco(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function lerChaveDoBanco(): Promise<CryptoKey | null> {
  const db = await abrirBanco();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(KEY_ID);
      req.onsuccess = () => resolve((req.result as CryptoKey) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function gravarChaveNoBanco(chave: CryptoKey): Promise<void> {
  const db = await abrirBanco();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(chave, KEY_ID);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

/** Obtém (ou cria) a chave AES-GCM não-exportável do dispositivo. */
async function obterChave(): Promise<CryptoKey | null> {
  if (chaveEmCache !== undefined) return chaveEmCache;
  const subtle = subtleDisponivel();
  if (!subtle) {
    chaveEmCache = null;
    return null;
  }
  const existente = await lerChaveDoBanco();
  if (existente) {
    chaveEmCache = existente;
    return existente;
  }
  try {
    const nova = await subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false, // não-exportável: JS nunca vê os bytes da chave
      ["encrypt", "decrypt"]
    );
    await gravarChaveNoBanco(nova);
    chaveEmCache = nova;
    return nova;
  } catch {
    chaveEmCache = null;
    return null;
  }
}

async function cifrar(texto: string): Promise<string | null> {
  const chave = await obterChave();
  const subtle = subtleDisponivel();
  if (!chave || !subtle) return null;
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const bytes = new TextEncoder().encode(texto);
    const dados = new Uint8Array(bytes.byteLength);
    dados.set(bytes);
    const buffer = await subtle.encrypt(
      { name: "AES-GCM", iv },
      chave,
      dados
    );
    const envelope: Envelope = {
      v: 1,
      iv: bytesParaBase64(iv),
      data: bytesParaBase64(new Uint8Array(buffer)),
    };
    return JSON.stringify(envelope);
  } catch {
    return null;
  }
}

function ehEnvelope(valor: unknown): valor is Envelope {
  return (
    !!valor &&
    typeof valor === "object" &&
    (valor as Envelope).v === 1 &&
    typeof (valor as Envelope).iv === "string" &&
    typeof (valor as Envelope).data === "string"
  );
}

/** Decifra o conteúdo; devolve o texto legado quando não há envelope. */
async function decifrar(bruto: string): Promise<string | null> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(bruto);
  } catch {
    return bruto;
  }
  if (!ehEnvelope(parsed)) return bruto; // dados antigos em texto puro

  const chave = await obterChave();
  const subtle = subtleDisponivel();
  if (!chave || !subtle) return null;
  try {
    const buffer = await subtle.decrypt(
      { name: "AES-GCM", iv: base64ParaBytes(parsed.iv) as BufferSource },
      chave,
      base64ParaBytes(parsed.data) as BufferSource
    );
    return new TextDecoder().decode(buffer);
  } catch {
    return null;
  }
}

// ==================== Estado em memória ====================

let sermoesCache: Sermon[] | null = null;
let filaCache: SyncAction[] | null = null;
let hidratacao: Promise<void> | null = null;
let gravacao: Promise<void> = Promise.resolve();

/** Grava cifrado, em série, sem bloquear a API síncrona.
 *  Sem IndexedDB/WebCrypto (testes, navegadores antigos) grava em texto puro. */
function persistirEmSegundoPlano(chave: string, texto: string): void {
  if (typeof indexedDB === "undefined" || !subtleDisponivel()) {
    try {
      localStorage.setItem(chave, texto);
    } catch {
      /* quota cheia ou storage indisponível */
    }
    return;
  }

  gravacao = gravacao
    .then(async () => {
      const cifrado = await cifrar(texto);
      if (!cifrado) {
        // Nunca degradar para texto puro quando a cifra estava disponível.
        console.error("Não foi possível cifrar o cache offline; gravação ignorada.");
        return;
      }
      localStorage.setItem(chave, cifrado);
    })
    .catch(() => {
      /* quota cheia ou storage indisponível */
    });
}

function lerBruto(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function pareceEnvelope(bruto: string | null): boolean {
  if (!bruto) return false;
  try {
    return ehEnvelope(JSON.parse(bruto));
  } catch {
    return false;
  }
}

// Sistema de sincronização offline-first (localStorage + AES-GCM)
export class OfflineStorage {
  private static SERMOES_KEY = "pastorhub_sermoes";
  private static SYNC_QUEUE_KEY = "pastorhub_sync_queue";
  private static LAST_SYNC_KEY = "pastorhub_last_sync";

  // ==================== HIDRATAÇÃO ====================

  /**
   * Decifra os dados gravados em sessões anteriores para o cache em memória.
   * Idempotente; em ambientes sem IndexedDB/WebCrypto cai no texto legado.
   */
  static init(): Promise<void> {
    if (hidratacao) return hidratacao;

    hidratacao = (async () => {
      const sermoesBrutos = lerBruto(this.SERMOES_KEY);
      if (sermoesBrutos) {
        const texto = await decifrar(sermoesBrutos);
        if (texto && sermoesCache === null) {
          try {
            sermoesCache = JSON.parse(texto) as Sermon[];
          } catch {
            sermoesCache = [];
          }
        }
        // Migra dados legados em texto puro para o formato cifrado.
        if (!pareceEnvelope(sermoesBrutos) && sermoesCache) {
          persistirEmSegundoPlano(this.SERMOES_KEY, JSON.stringify(sermoesCache));
        }
      }

      const filaBruta = lerBruto(this.SYNC_QUEUE_KEY);
      if (filaBruta) {
        const texto = await decifrar(filaBruta);
        if (texto && filaCache === null) {
          try {
            filaCache = JSON.parse(texto) as SyncAction[];
          } catch {
            filaCache = [];
          }
          // Reduz retenção: ações antigas não devem ser reenviadas.
          const limite = Date.now() - RETENCAO_FILA_MS;
          const filtrada = filaCache.filter((a) => a.timestamp >= limite);
          if (filtrada.length !== filaCache.length) {
            filaCache = filtrada;
            persistirEmSegundoPlano(
              this.SYNC_QUEUE_KEY,
              JSON.stringify(filtrada)
            );
          }
        }
        if (!pareceEnvelope(filaBruta) && filaCache) {
          persistirEmSegundoPlano(this.SYNC_QUEUE_KEY, JSON.stringify(filaCache));
        }
      }
    })().catch(() => undefined);

    return hidratacao;
  }

  // ==================== SERMÕES LOCAIS ====================

  // Salvar sermões localmente
  static saveSermoes(sermoes: Sermon[]): void {
    try {
      sermoesCache = sermoes;
      persistirEmSegundoPlano(this.SERMOES_KEY, JSON.stringify(sermoes));
    } catch (error) {
      console.error("Erro ao salvar sermões localmente:", error);
    }
  }

  // Carregar sermões locais
  static getSermoes(): Sermon[] {
    try {
      const bruto = lerBruto(this.SERMOES_KEY);
      // Storage limpo por outro contexto (ou logout): invalida o cache.
      if (bruto === null) {
        sermoesCache = [];
        return [];
      }
      if (sermoesCache) return [...sermoesCache];
      if (pareceEnvelope(bruto)) {
        // Cifrado: o conteúdo aparece após init() (evento offline-ready).
        void this.init();
        return [];
      }
      const dados = JSON.parse(bruto);
      sermoesCache = Array.isArray(dados) ? (dados as Sermon[]) : [];
      return [...sermoesCache];
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
      filaCache = queue;
      persistirEmSegundoPlano(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("Erro ao adicionar à fila de sincronização:", error);
    }
  }

  // Obter fila de sincronização
  static getSyncQueue(): SyncAction[] {
    try {
      const bruto = lerBruto(this.SYNC_QUEUE_KEY);
      if (bruto === null) {
        filaCache = [];
        return [];
      }
      if (filaCache) return [...filaCache];
      if (pareceEnvelope(bruto)) {
        void this.init();
        return [];
      }
      const dados = JSON.parse(bruto);
      filaCache = Array.isArray(dados) ? (dados as SyncAction[]) : [];
      return [...filaCache];
    } catch (error) {
      console.error("Erro ao carregar fila de sincronização:", error);
      return [];
    }
  }

  // Limpar fila de sincronização
  static clearSyncQueue(): void {
    filaCache = [];
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch {
      /* storage indisponível */
    }
  }

  // Remove uma ação da fila após sincronizar com sucesso (evita reprocessamento)
  static removeFromSyncQueue(id: string): void {
    try {
      const queue = this.getSyncQueue().filter((a) => a.id !== id);
      filaCache = queue;
      persistirEmSegundoPlano(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
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

  // Limpar todos os dados locais (chamado no logout)
  static clearAll(): void {
    sermoesCache = null;
    filaCache = null;
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

// Hidrata o cache cifrado no carregamento e avisa as telas quando prontas.
if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
  void OfflineStorage.init().then(() => {
    try {
      window.dispatchEvent(new Event(EVENTO_OFFLINE_PRONTO));
    } catch {
      /* ambientes sem Event global */
    }
  });
}
