import { CHAVES, lerJSON, salvarJSON } from './armazenamento';

/* ============================================================
   Comunidade & Pastores — dados e persistência do chat.
   Espelha js/usuario.js (PASTORS, CONVERSAS e histórico).
   ============================================================ */

export interface Pastor {
  id: number;
  nome: string;
  cargo: string;
  avatar: string;
  online: boolean;
  ultimaMsg: string;
  naoLida: number;
}

export interface Mensagem {
  autor: 'usuario' | 'pastor';
  texto: string;
  hora: string;
}

export const PASTORS: Pastor[] = [
  {
    id: 1,
    nome: 'Pastor João Silva',
    cargo: 'Pastor Titular',
    avatar: 'JS',
    online: true,
    ultimaMsg: 'Bom dia! Quer conversar sobre o culto de hoje?',
    naoLida: 2,
  },
  {
    id: 2,
    nome: 'Pra. Maria Oliveira',
    cargo: 'Aconselhamento Familiar',
    avatar: 'MO',
    online: false,
    ultimaMsg: 'Confirmado nosso encontro de casais amanhã.',
    naoLida: 1,
  },
  {
    id: 3,
    nome: 'Pr. Lucas Ferreira',
    cargo: 'Líder de Ensino Bíblico',
    avatar: 'LF',
    online: true,
    ultimaMsg: 'O material do estudo bíblico de sábado já está disponível.',
    naoLida: 0,
  },
  {
    id: 4,
    nome: 'Pr. Carlos Santos',
    cargo: 'Ministério de Oração',
    avatar: 'CS',
    online: true,
    ultimaMsg: 'Estamos intercedendo pelo seu pedido de oração!',
    naoLida: 0,
  },
];

export type RegistroChat = Record<string, Mensagem[]>;

export function pastorPorId(id: number | string): Pastor {
  const numero = Number(id);
  return PASTORS.find((pastor) => pastor.id === numero) ?? PASTORS[0];
}

export function lerConversas(): RegistroChat {
  return lerJSON<RegistroChat>(CHAVES.chats, {});
}

export function salvarConversas(registro: RegistroChat): boolean {
  return salvarJSON(CHAVES.chats, registro);
}

/** Mensagens do pastor, com saudação inicial na primeira abertura. */
export function mensagensDoPastor(
  pastor: Pastor,
  registro: RegistroChat = lerConversas(),
): Mensagem[] {
  const existentes = registro[pastor.id];
  if (Array.isArray(existentes) && existentes.length) return existentes;
  return [
    { autor: 'pastor', texto: pastor.ultimaMsg, hora: '14:00' },
    {
      autor: 'usuario',
      texto: 'Olá! Gostaria de saber mais detalhes e confirmar minha participação.',
      hora: '14:02',
    },
    {
      autor: 'pastor',
      texto:
        'Que alegria! Nossos encontros acontecem às 9h e às 19h. Conte conosco em oração.',
      hora: '14:03',
    },
  ];
}

export function horaAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const RESPOSTA_AUTOMATICA =
  'Recebi sua mensagem! Estarei orando e acompanhando você de perto. Deus abençoe!';

/**
 * Acrescenta a mensagem do usuário e a resposta pastoral, persistindo tudo.
 * Retorna o registro atualizado para o componente refletir na hora.
 */
export function enviarMensagem(
  pastor: Pastor,
  texto: string,
  registro: RegistroChat = lerConversas(),
): RegistroChat {
  const limpo = texto.trim();
  if (!limpo) return registro;
  const hora = horaAgora();
  const atualizadas: Mensagem[] = [
    ...mensagensDoPastor(pastor, registro),
    { autor: 'usuario', texto: limpo, hora },
    { autor: 'pastor', texto: RESPOSTA_AUTOMATICA, hora },
  ];
  const proximo: RegistroChat = { ...registro, [pastor.id]: atualizadas };
  salvarConversas(proximo);
  return proximo;
}

export function ultimaMensagem(
  pastor: Pastor,
  registro: RegistroChat = lerConversas(),
): string {
  const mensagens = mensagensDoPastor(pastor, registro);
  return mensagens[mensagens.length - 1]?.texto ?? pastor.ultimaMsg;
}
