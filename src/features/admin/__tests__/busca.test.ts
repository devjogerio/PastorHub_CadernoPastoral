import { describe, expect, it } from 'vitest';
import {
  buscarItens,
  interpretarTermo,
  montarIndiceAdmin,
  paginarItens,
  termoEhPesquisavel,
  type ItemBusca,
} from '../busca';

const itens: ItemBusca[] = [
  { grupo: 'Usuários', titulo: 'Marcos Vieira', sub: 'marcos@x.com', status: 'Ativo', campos: ['Marcos Vieira', 'marcos@x.com', 'Igreja do Evangelho Quadrado'] },
  { grupo: 'Usuários', titulo: 'Samuel Aguiar', sub: 'samuel@x.com', status: 'Suspenso', campos: ['Samuel Aguiar', 'samuel@x.com', 'Igreja Batista Central'] },
  { grupo: 'Registros', titulo: 'Conta suspensa', sub: 'samuel@x.com · Violação', status: 'erro', campos: ['Conta suspensa', 'samuel@x.com', 'Violação de uso'] },
];

describe('busca do painel (React)', () => {
  it('normaliza acentos e maiúsculas na interpretação do termo', () => {
    expect(interpretarTermo('  IGREJA   Único ')).toEqual({ texto: 'igreja unico', modo: 'parcial' });
  });

  it('busca parcial encontra trecho de palavra em qualquer campo', () => {
    expect(buscarItens(itens, { termo: 'evangelho', grupo: 'todos', status: 'todos' }).map((i) => i.titulo)).toEqual(['Marcos Vieira']);
  });

  it('busca parcial exige todas as palavras digitadas', () => {
    expect(buscarItens(itens, { termo: 'samuel batista', grupo: 'todos', status: 'todos' })).toHaveLength(1);
    expect(buscarItens(itens, { termo: 'marcos batista', grupo: 'todos', status: 'todos' })).toHaveLength(0);
  });

  it('busca exata só casa campo inteiro entre aspas', () => {
    expect(buscarItens(itens, { termo: '"Marcos"', grupo: 'todos', status: 'todos' })).toHaveLength(0);
    expect(buscarItens(itens, { termo: '"marcos vieira"', grupo: 'todos', status: 'todos' })).toHaveLength(1);
  });

  it('aplica filtros de módulo e status junto com o texto', () => {
    expect(buscarItens(itens, { termo: 'samuel', grupo: 'Registros', status: 'todos' })).toHaveLength(1);
    expect(buscarItens(itens, { termo: 'samuel', grupo: 'todos', status: 'Suspenso' })).toHaveLength(1);
    expect(buscarItens(itens, { termo: 'samuel', grupo: 'Usuários', status: 'erro' })).toHaveLength(0);
  });

  it('não pesquisa termo com menos de 2 caracteres', () => {
    expect(termoEhPesquisavel('a')).toBe(false);
    expect(termoEhPesquisavel('ab')).toBe(true);
    expect(termoEhPesquisavel('"a"')).toBe(true);
    expect(buscarItens(itens, { termo: 'a', grupo: 'todos', status: 'todos' })).toHaveLength(0);
  });

  it('pagina e limita a página ao intervalo válido', () => {
    const lista = [1, 2, 3, 4, 5, 6, 7];
    expect(paginarItens(lista, 1, 5)).toEqual({ itens: [1, 2, 3, 4, 5], pagina: 1, totalPaginas: 2, total: 7 });
    expect(paginarItens(lista, 2, 5).itens).toEqual([6, 7]);
    expect(paginarItens(lista, 9, 5).pagina).toBe(2);
    expect(paginarItens([], 1, 5).totalPaginas).toBe(1);
  });

  it('monta o índice a partir das fontes do painel, com grupo e status', () => {
    const indice = montarIndiceAdmin({
      usuarios: [{ nome: 'Ana', email: 'ana@x.com', igreja: 'Betel', cidade: 'Campinas', plano: 'Igreja', status: 'Ativo' }],
      contas: [{ nome: 'Administrador', email: 'admin@x.com', papel: 'admin' }],
      logs: [{ usuario: 'system', acao: 'Falha', alvo: 'send-notification', tipo: 'erro', hora: 'Hoje' }],
      planos: [{ nome: 'Premium', desc: 'Plano pastoral' }],
    });
    expect(indice.map((i) => i.grupo)).toEqual(['Usuários', 'Contas', 'Registros', 'Planos']);
    expect(buscarItens(indice, { termo: 'betel', grupo: 'todos', status: 'todos' })[0].titulo).toBe('Ana');
    expect(buscarItens(indice, { termo: 'falha', grupo: 'todos', status: 'erro' })).toHaveLength(1);
  });
});
