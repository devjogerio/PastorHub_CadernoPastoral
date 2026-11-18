import { describe, it, expect } from 'vitest';
import { generatePrintHTML } from '../printHtml';
import type { Sermon } from '../../../types';

describe('generatePrintHTML', () => {
  const mockSermon: Sermon = {
    id: '1',
    titulo: 'O Amor de Deus',
    texto_biblico: 'João 3:16',
    tema: 'Amor',
    publico_alvo: 'Geral',
    tipo_sermao: 'Temático',
    conteudo_html: '<p>Deus amou o mundo.</p>',
    conteudo_plain: 'Deus amou o mundo.',
    tags: ['amor', 'salvação'],
    data_criacao: '2023-01-01T10:00:00Z',
    data_pregado: null,
    status_pregado: false,
    local_pregado: '',
  };

  it('should generate HTML with correct content', () => {
    const html = generatePrintHTML(mockSermon);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('O Amor de Deus');
    expect(html).toContain('João 3:16');
    expect(html).toContain('Deus amou o mundo.');
  });
});
