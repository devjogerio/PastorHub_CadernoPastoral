import type { Sermon } from '../types';
import { exportSermon, copyToClipboard, downloadAsText } from './pdf/actions';

/**
 * Biblioteca para exportação de sermões em PDF/TXT (fachada)
 * Mantém compatibilidade com a API anterior usando uma classe
 */
export class PDFExporter {
  /** Exporta sermão como PDF usando Print API */
  static async exportSermon(sermon: Sermon): Promise<void> {
    return exportSermon(sermon);
  }

  /** Copia versão em texto para área de transferência */
  static async copyToClipboard(sermon: Sermon): Promise<void> {
    return copyToClipboard(sermon);
  }

  /** Faz download do sermão como arquivo .txt */
  static downloadAsText(sermon: Sermon): void {
    return downloadAsText(sermon);
  }
}
