import { lerJSON, salvarJSON } from './armazenamento';

/* ============================================================
   Planos e cobrança — dados portados de admin-planos.js e
   pagamentos.js. Mantém as mesmas chaves do app estático para
   que a assinatura local continue válida após a migração.
   ============================================================ */

export interface Plano {
  id: 'offline' | 'premium' | 'igreja';
  nome: string;
  precoMensal: number;
  precoAnual: number;
  cor: string;
  destaque: boolean;
  desc: string;
  recursos: string[];
  limites: {
    sermoes: number;
    atendimentos: number;
    assentos: number;
    agentes: number;
    storageMB: number;
  };
}

export type CicloCobranca = 'mensal' | 'anual';

export interface Assinatura {
  plano: string;
  ciclo: CicloCobranca;
  valor: number;
  statusCobranca?: 'Ativa' | 'Pendente' | 'Bloqueada';
  proxima?: string;
  metodo?: string;
}

const K_PLANOS = 'pastorhub_admin_planos';
const K_ASSINATURAS = 'pastorhub_admin_assinaturas';
const K_PIX = 'pastorhub_pix';

export const PLANOS_PADRAO: Plano[] = [
  {
    id: 'offline',
    nome: 'Offline',
    precoMensal: 0,
    precoAnual: 0,
    cor: '#64748b',
    destaque: false,
    desc: 'Uso local e gratuito — porta de entrada',
    recursos: [
      'Dados salvos no dispositivo',
      'Caderno do Pastor completo',
      'Exportação TXT e PDF',
      'Agenda e atendimentos locais',
    ],
    limites: { sermoes: 200, atendimentos: 500, assentos: 1, agentes: 0, storageMB: 50 },
  },
  {
    id: 'premium',
    nome: 'Premium',
    precoMensal: 49.9,
    precoAnual: 598.8,
    cor: '#95C121',
    destaque: true,
    desc: 'Pro — para o pastor individual',
    recursos: [
      'Tudo do Offline',
      'Assistente de estudo (RAG + OCR)',
      '3 agentes de IA treináveis',
      'Conselho (Meet AI) com relatórios',
      'Lembretes via WhatsApp',
      'Backup na nuvem',
    ],
    limites: { sermoes: 5000, atendimentos: 5000, assentos: 1, agentes: 3, storageMB: 512 },
  },
  {
    id: 'igreja',
    nome: 'Igreja',
    precoMensal: 149.9,
    precoAnual: 1499,
    cor: '#3261AB',
    destaque: false,
    desc: 'Multi-usuário para toda a igreja',
    recursos: [
      'Tudo do Premium para cada pastor',
      'Até 10 assentos de pastor',
      'Agentes de IA por ministério',
      'Painel administrativo da igreja',
      'Suporte prioritário',
      'Onboarding assistido',
    ],
    limites: { sermoes: 20000, atendimentos: 20000, assentos: 10, agentes: 10, storageMB: 2048 },
  },
];

/** Lê os planos salvos pelo painel admin; usa o padrão quando vazio. */
export function lerPlanos(): Plano[] {
  const salvos = lerJSON<Plano[]>(K_PLANOS, []);
  return Array.isArray(salvos) && salvos.length ? salvos : PLANOS_PADRAO;
}

export function salvarPlanos(planos: Plano[]): boolean {
  return salvarJSON(K_PLANOS, planos);
}

export function formatarPreco(valor: number): string {
  if (!valor) return 'Grátis';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function precoDoCiclo(plano: Plano, ciclo: CicloCobranca): number {
  return ciclo === 'anual' ? plano.precoAnual : plano.precoMensal;
}

/** Equivalente mensal do plano anual, usado no selo de economia. */
export function equivalenteMensal(plano: Plano): number {
  return plano.precoAnual ? plano.precoAnual / 12 : 0;
}

export function economiaAnual(plano: Plano): number {
  const cheio = plano.precoMensal * 12;
  return cheio > plano.precoAnual ? cheio - plano.precoAnual : 0;
}

export function lerAssinaturas(): Record<string, Assinatura> {
  return lerJSON<Record<string, Assinatura>>(K_ASSINATURAS, {});
}

export function assinaturaDe(email: string): Assinatura | null {
  if (!email) return null;
  return lerAssinaturas()[email] ?? null;
}

export function salvarAssinatura(email: string, assinatura: Assinatura): boolean {
  if (!email) return false;
  const registro = lerAssinaturas();
  registro[email] = assinatura;
  return salvarJSON(K_ASSINATURAS, registro);
}

/* ---------- Pix (BR Code / EMV) — portado de pagamentos.js ---------- */

export interface ConfigPix {
  chave: string;
  nome: string;
  cidade: string;
  valor: number;
  tipo: string;
  gateway: string;
  recorrente: boolean;
  cobrancaAuto: boolean;
}

const PIX_PADRAO: ConfigPix = {
  chave: '',
  nome: 'PastorHub',
  cidade: 'SAO PAULO',
  valor: 0,
  tipo: 'estatica',
  gateway: 'mercadopago',
  recorrente: true,
  cobrancaAuto: true,
};

export function lerPix(): ConfigPix {
  return { ...PIX_PADRAO, ...lerJSON<Partial<ConfigPix>>(K_PIX, {}) };
}

export function salvarPix(config: ConfigPix): boolean {
  return salvarJSON(K_PIX, config);
}

function emv(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, '0') + valor;
}

export function crc16(texto: string): string {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i += 1) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Gera o "Pix copia e cola" com o valor do plano escolhido. */
export function payloadPix(config: ConfigPix, valor: number): string {
  let base =
    emv('00', '01') +
    emv('26', emv('00', 'BR.GOV.BCB.PIX') + emv('01', config.chave));
  if (valor > 0) {
    base += emv('52', '0000') + emv('53', '986') + emv('54', valor.toFixed(2));
  }
  base +=
    emv('58', 'BR') +
    emv('59', (config.nome || 'PASTORHUB').toUpperCase().slice(0, 25)) +
    emv('60', (config.cidade || 'SAO PAULO').toUpperCase().slice(0, 15)) +
    emv('62', emv('05', '***'));
  base += '6304';
  return base + crc16(base);
}
