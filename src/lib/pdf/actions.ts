import type { Sermon } from "../../types";
import { generatePrintHTML } from "./printHtml";
import { generatePlainText } from "./plainText";

/**
 * Exporta o sermão como PDF via janela de impressão
 */
export async function exportSermon(sermon: Sermon): Promise<void> {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("Não foi possível abrir janela de impressão");
  }

  const html = generatePrintHTML(sermon);
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Copia o conteúdo do sermão para a área de transferência
 */
export async function copyToClipboard(sermon: Sermon): Promise<void> {
  const text = generatePlainText(sermon);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

/**
 * Faz download do sermão como arquivo .txt
 */
export function downloadAsText(sermon: Sermon): void {
  const text = generatePlainText(sermon);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sermon.titulo.replace(/[^a-z0-9]/gi, "_")}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

