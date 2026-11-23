import { lerJSON, salvarJSON } from './armazenamento';

/* ============================================================
   Versículos — banco e rotação portados de js/versiculos.js.
   A seleção muda a cada janela de 3 minutos, mas é estável
   dentro da janela (mesmo algoritmo de PRNG semeado).
   ============================================================ */

export interface Versiculo {
  ref: string;
  versao: string;
  texto: string;
  ativo: boolean;
}

export interface ConfigVersiculo {
  ativo: boolean;
  hora: string;
  canais: { app: boolean; notificacao: boolean; whatsapp: boolean };
  versao: string;
}

export const BANCO_PADRAO: Versiculo[] = [
  { ref: 'Lamentações 3:22-23', versao: 'ACF', texto: 'As misericórdias do Senhor são a causa de não sermos consumidos; porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.', ativo: true },
  { ref: 'Salmos 46:1', versao: 'ACF', texto: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.', ativo: true },
  { ref: 'Provérbios 3:5-6', versao: 'ACF', texto: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.', ativo: true },
  { ref: 'Isaías 41:10', versao: 'ACF', texto: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.', ativo: true },
  { ref: 'Filipenses 4:13', versao: 'ACF', texto: 'Posso todas as coisas naquele que me fortalece.', ativo: true },
  { ref: 'Salmos 23:1', versao: 'ACF', texto: 'O Senhor é o meu pastor; nada me faltará.', ativo: true },
  { ref: 'Josué 1:9', versao: 'ACF', texto: 'Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.', ativo: true },
  { ref: 'Mateus 11:28', versao: 'ACF', texto: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.', ativo: true },
  { ref: 'Romanos 8:28', versao: 'ACF', texto: 'E sabemos que todas as coisas contribuem conjuntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.', ativo: true },
  { ref: 'Salmos 37:5', versao: 'ACF', texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', ativo: true },
  { ref: 'Salmos 119:105', versao: 'ACF', texto: 'Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.', ativo: true },
  { ref: 'Isaías 40:31', versao: 'ACF', texto: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.', ativo: true },
  { ref: 'Mateus 6:33', versao: 'ACF', texto: 'Mas buscai primeiro o Reino de Deus, e a sua justiça, e todas essas coisas vos serão acrescentadas.', ativo: true },
  { ref: 'João 14:27', versao: 'ACF', texto: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.', ativo: true },
  { ref: 'Salmos 91:1', versao: 'ACF', texto: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.', ativo: true },
  { ref: 'Hebreus 11:1', versao: 'ACF', texto: 'Ora, a fé é o firmamento das coisas que se esperam e a prova das coisas que se não veem.', ativo: true },
  { ref: 'Salmos 121:1-2', versao: 'ACF', texto: 'Elevo os meus olhos para os montes: de onde me vem o socorro? O meu socorro vem do Senhor, que fez o céu e a terra.', ativo: true },
  { ref: 'Provérbios 18:10', versao: 'ACF', texto: 'O nome do Senhor é torre forte; o justo corre para ela e está seguro.', ativo: true },
  { ref: 'Colossenses 3:23', versao: 'ACF', texto: 'E tudo quanto fizerdes, fazei-o de coração, como para o Senhor e não para os homens.', ativo: true },
  { ref: 'Salmos 118:24', versao: 'ACF', texto: 'Este é o dia que fez o Senhor; regozijemo-nos e alegremo-nos nele.', ativo: true },
  { ref: 'Gálatas 6:9', versao: 'ACF', texto: 'E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.', ativo: true },
  { ref: '1 Pedro 5:7', versao: 'ACF', texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', ativo: true },
  { ref: 'Isaías 26:3', versao: 'ACF', texto: 'Tu conservarás em paz aquele que te guarda a mente firme, porque em ti confia.', ativo: true },
  { ref: 'Neemias 8:10', versao: 'ACF', texto: 'A alegria do Senhor é a vossa força.', ativo: true },
  { ref: 'Salmos 62:1', versao: 'ACF', texto: 'A minha alma espera somente em Deus; dele vem a minha salvação.', ativo: true },
  { ref: 'Tiago 1:5', versao: 'ACF', texto: 'E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente e não o lança em rosto; e ser-lhe-á dada.', ativo: true },
  { ref: 'Efésios 4:32', versao: 'ACF', texto: 'Antes, sede uns para com os outros benignos, compassivos, perdoando-vos uns aos outros, como também Deus, em Cristo, vos perdoou.', ativo: true },
  { ref: 'Salmos 55:22', versao: 'ACF', texto: 'Lança a tua sobrecarga sobre o Senhor, e ele te susterá; nunca permitirá que o justo seja abalado.', ativo: true },
];

export const CONFIG_PADRAO: ConfigVersiculo = {
  ativo: true,
  hora: '07:00',
  canais: { app: true, notificacao: true, whatsapp: false },
  versao: 'ACF',
};

const K_CONFIG = 'pastorhub_vers_config';
const K_BANCO = 'pastorhub_vers_banco';
const K_LOG = 'pastorhub_vers_log';
export const INTERVALO_ROTACAO = 3 * 60 * 1000;

export function lerBanco(): Versiculo[] {
  const salvo = lerJSON<Versiculo[]>(K_BANCO, BANCO_PADRAO);
  return Array.isArray(salvo) && salvo.length ? salvo : BANCO_PADRAO;
}

export function salvarBanco(banco: Versiculo[]): boolean {
  return salvarJSON(K_BANCO, banco);
}

export function lerConfig(): ConfigVersiculo {
  return { ...CONFIG_PADRAO, ...lerJSON<Partial<ConfigVersiculo>>(K_CONFIG, {}) };
}

export function salvarConfig(config: ConfigVersiculo): boolean {
  return salvarJSON(K_CONFIG, config);
}

export function lerHistorico(): Array<Record<string, unknown>> {
  return lerJSON<Array<Record<string, unknown>>>(K_LOG, []);
}

/** Semente estável por janela de 3 minutos (mesmo cálculo do app estático). */
function aleatorioDoSlot(slot: number): number {
  let s = (Math.imul(slot, 2654435761) ^ 0x9e3779b9) >>> 0;
  s = (s + 0x6d2b79f5) >>> 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Versículo vigente na janela atual. */
export function versiculoAtual(
  data: Date = new Date(),
  banco: Versiculo[] = lerBanco(),
): Versiculo | null {
  const ativos = banco.filter((item) => item.ativo !== false);
  if (!ativos.length) return null;
  const slot = Math.floor(data.getTime() / INTERVALO_ROTACAO);
  return ativos[Math.floor(aleatorioDoSlot(slot) * ativos.length)] ?? ativos[0];
}

export function textoParaCompartilhar(versiculo: Versiculo): string {
  return `“${versiculo.texto}” — ${versiculo.ref} (${versiculo.versao || 'ACF'}) · PastorHub`;
}

export function linkWhatsApp(versiculo: Versiculo): string {
  const texto = `📖 *${versiculo.ref}* (${versiculo.versao || 'ACF'})\n“${versiculo.texto}”\n\nEnviado pelo PastorHub`;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
