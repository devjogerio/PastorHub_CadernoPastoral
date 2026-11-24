import { describe, expect, it, vi } from 'vitest';
import {
  MIN_CARACTERES,
  TIPOS,
  TODOS,
  agruparPorTipo,
  buscarItens,
  interpretarTermo,
  montarIndiceAdmin,
  termoEhPesquisavel,
  type FiltrosBusca,
  type ItemBusca,
} from '../busca';

const filtros = (termo: string, extras: Partial<FiltrosBusca> = {}): FiltrosBusca => ({
  termo,
  tipo: TODOS,
  grupo: TODOS,
  status: TODOS,
  ...extras,
});

const itens: ItemBusca[] = [
  { tipo: 'conteudo', grupo: 'Usuários', titulo: 'Marcos Vieira', sub: 'marcos@x.com', status: 'Ativo', campos: ['Marcos Vieira', 'marcos@x.com', 'Igreja do Evangelho Quadrado'] },
  { tipo: 'conteudo', grupo: 'Usuários', titulo: 'Samuel Aguiar', sub: 'samuel@x.com', status: 'Suspenso', campos: ['Samuel Aguiar', 'samuel@x.com', 'Igreja Batista Central'] },
  { tipo: 'acao', grupo: 'Ações', titulo: 'Conta suspensa', sub: 'samuel@x.com · Violação', status: 'erro', campos: ['Conta suspensa', 'samuel@x.com', 'Violação de uso'] },
  { tipo: 'funcionalidade', grupo: 'Funcionalidades', titulo: 'Financeiro', sub: 'Cobrança', status: '', campos: ['Financeiro', 'cobranca pix'] },
];

describe('busca do painel (React)', () => {
  it('normaliza acentos e maiúsculas na interpretação do termo', () => {
    expect(interpretarTermo('  IGREJA   Único ')).toEqual({ texto: 'igreja unico', modo: 'parcial' });
  });

  it('busca parcial encontra trecho de palavra em qualquer campo', () => {
    expect(buscarItens(itens, filtros('evangelho')).map((i) => i.titulo)).toEqual(['Marcos Vieira']);
  });

  it('busca parcial exige todas as palavras digitadas, em ordem livre', () => {
    expect(buscarItens(itens, filtros('samuel batista'))).toHaveLength(1);
    expect(buscarItens(itens, filtros('batista samuel'))).toHaveLength(1);
    expect(buscarItens(itens, filtros('marcos batista'))).toHaveLength(0);
  });

  it('busca exata só casa campo inteiro entre aspas', () => {
    expect(buscarItens(itens, filtros('"Marcos"'))).toHaveLength(0);
    expect(buscarItens(itens, filtros('"marcos vieira"'))).toHaveLength(1);
  });

  it('aplica filtros de categoria, módulo e status junto com o texto', () => {
    expect(buscarItens(itens, filtros('samuel', { grupo: 'Ações' }))).toHaveLength(1);
    expect(buscarItens(itens, filtros('samuel', { status: 'Suspenso' }))).toHaveLength(1);
    expect(buscarItens(itens, filtros('samuel', { grupo: 'Usuários', status: 'erro' }))).toHaveLength(0);
    expect(buscarItens(itens, filtros('samuel', { tipo: 'funcionalidade' }))).toHaveLength(0);
  });

  it('não pesquisa com menos de 3 caracteres (aspas não contam)', () => {
    expect(MIN_CARACTERES).toBe(3);
    expect(termoEhPesquisavel('a')).toBe(false);
    expect(termoEhPesquisavel('ab')).toBe(false);
    expect(termoEhPesquisavel('abc')).toBe(true);
    expect(termoEhPesquisavel('"ab"')).toBe(false);
    expect(termoEhPesquisavel('"abc"')).toBe(true);
    expect(buscarItens(itens, filtros('ab'))).toHaveLength(0);
  });

  it('agrupa na ordem conteúdo, funcionalidade, ação e omite vazios', () => {
    expect(TIPOS.map((t) => t.rotulo)).toEqual(['Conteúdo', 'Funcionalidade', 'Ação']);
    const grupos = agruparPorTipo(buscarItens(itens, filtros('samuel')));
    expect(grupos.map((g) => g.id)).toEqual(['conteudo', 'acao']);
    expect(grupos.map((g) => g.itens.length)).toEqual([1, 1]);
  });

  it('devolve todos os itens correspondentes, sem paginação', () => {
    const muitos: ItemBusca[] = Array.from({ length: 40 }, (_, i) => ({
      tipo: 'conteudo', grupo: 'Usuários', titulo: `Pastor ${i + 1}`, sub: '', status: '', campos: ['Pastor'],
    }));
    expect(buscarItens(muitos, filtros('pastor'))).toHaveLength(40);
  });

  it('monta o índice com conteúdos, funcionalidades e ações navegáveis', () => {
    const navegar = vi.fn();
    const indice = montarIndiceAdmin({
      usuarios: [{ nome: 'Ana', email: 'ana@x.com', igreja: 'Betel', cidade: 'Campinas', plano: 'Igreja', status: 'Ativo' }],
      contas: [{ nome: 'Administrador', email: 'admin@x.com', papel: 'admin' }],
      logs: [{ usuario: 'system', acao: 'Falha', alvo: 'send-notification', tipo: 'erro', hora: 'Hoje' }],
      planos: [{ nome: 'Premium', desc: 'Plano pastoral' }],
      navegar,
    });

    expect(indice.map((i) => i.grupo)).toEqual([
      'Usuários', 'Contas', 'Registros', 'Planos', 'Funcionalidades', 'Funcionalidades', 'Funcionalidades', 'Ações', 'Ações',
    ]);
    expect(buscarItens(indice, filtros('betel'))[0].titulo).toBe('Ana');
    expect(buscarItens(indice, filtros('falha', { status: 'erro' }))).toHaveLength(1);

    const acao = buscarItens(indice, filtros('pix', { tipo: 'acao' }))[0];
    expect(acao?.titulo).toBe('Configurar chave Pix');
    acao.executar?.();
    expect(navegar).toHaveBeenCalledWith('financeiro');

    const funcionalidade = buscarItens(indice, filtros('planos', { tipo: 'funcionalidade' }))[0];
    funcionalidade.executar?.();
    expect(navegar).toHaveBeenCalledWith('planos');
  });
});
