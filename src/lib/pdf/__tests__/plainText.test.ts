// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { generatePlainText } from '../plainText';
import type { Sermon } from '../../../types';

describe('generatePlainText', () => {
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

  it('should generate plain text correctly', () => {
    const text = generatePlainText(mockSermon);
    expect(text).toContain('O AMOR DE DEUS');
    expect(text).toContain('João 3:16');
    expect(text).toContain('Deus amou o mundo.');
    expect(text).toContain('#amor');
  });

  it('should include preached info if status_pregado is true', () => {
    const preachedSermon: Sermon = {
      ...mockSermon,
      status_pregado: true,
      data_pregado: '2023-02-01T10:00:00Z',
      local_pregado: 'Igreja Central',
    };
    const text = generatePlainText(preachedSermon);
    expect(text).toContain('✓ PREGADO');
    expect(text).toContain('Igreja Central');
  });
});
