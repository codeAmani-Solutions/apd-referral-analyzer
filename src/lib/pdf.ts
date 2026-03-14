import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Configure pdf.js worker — Vite resolves the URL at build time
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url,
).toString();

/** Known APD document types that can be auto-detected. */
export type DocumentType = "lrc_base" | "qsi" | "support_plan" | "other";

/**
 * Extract all text content from a PDF file.
 * Iterates every page and joins text items with spaces, pages with newlines.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is TextItem => "str" in item)
      .map((item) => item.str)
      .join(" ");
    pageTexts.push(text);
  }

  return pageTexts.join("\n");
}

/**
 * Auto-detect the APD document type from extracted text content.
 * Matches keyword patterns found in standardized APD form headers.
 */
export function detectDocumentType(text: string): DocumentType {
  const upper = text.toUpperCase();

  // LRC BASE form — contains both "LRC" and "BASE" in the header area
  if (upper.includes("LRC") && upper.includes("BASE")) {
    return "lrc_base";
  }

  // QSI Assessment — contains "QSI" and "QUESTIONNAIRE"
  if (upper.includes("QSI") && upper.includes("QUESTIONNAIRE")) {
    return "qsi";
  }

  // Support Plan — contains "SUPPORT PLAN"
  if (upper.includes("SUPPORT PLAN")) {
    return "support_plan";
  }

  return "other";
}
