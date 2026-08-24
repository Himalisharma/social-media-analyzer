import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Below this average characters-per-page, we treat the PDF as having no
// usable embedded text layer (i.e. it's a scan) and fall back to OCR.
const SCANNED_PAGE_CHAR_THRESHOLD = 25;

export class PasswordProtectedError extends Error {
  constructor() {
    super("This PDF is password-protected. Remove the password and upload it again.");
    this.name = "PasswordProtectedError";
  }
}

export class CorruptPdfError extends Error {
  constructor() {
    super("This PDF couldn't be read — it may be corrupted or not a real PDF. Try re-exporting or saving it again.");
    this.name = "CorruptPdfError";
  }
}

/**
 * Group a page's text items into paragraphs by comparing y-position gaps,
 * rather than concatenating every string with no structure.
 */
function groupItemsIntoText(textContent) {
  const items = textContent.items.filter((it) => it.str !== undefined);
  if (items.length === 0) return "";

  // Each item's transform gives us [scaleX, skewX, skewY, scaleY, x, y]
  const rows = items.map((it) => ({
    str: it.str,
    x: it.transform[4],
    y: it.transform[5],
    height: it.height || Math.abs(it.transform[3]) || 10,
    hasEOL: it.hasEOL,
  }));

  // Group into lines first (items sharing a similar y within one row)
  const lines = [];
  let currentLine = [];
  let lastY = null;
  const LINE_TOLERANCE = 3;

  for (const item of rows) {
    if (lastY === null || Math.abs(item.y - lastY) <= LINE_TOLERANCE) {
      currentLine.push(item);
    } else {
      lines.push(currentLine);
      currentLine = [item];
    }
    lastY = item.y;
  }
  if (currentLine.length) lines.push(currentLine);

  // Build paragraph text: insert a paragraph break when the vertical gap
  // between consecutive lines is notably larger than the typical line height.
  const lineHeights = lines.map((line) => Math.max(...line.map((i) => i.height)));
  const medianHeight =
    [...lineHeights].sort((a, b) => a - b)[Math.floor(lineHeights.length / 2)] || 10;

  let out = "";
  let prevY = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineText = line
      .sort((a, b) => a.x - b.x)
      .map((i2) => i2.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!lineText) continue;

    const y = line[0].y;
    if (prevY !== null) {
      const gap = prevY - y; // pdf y grows upward, so gap is positive going down
      if (gap > medianHeight * 1.8) {
        out += "\n\n";
      } else {
        out += "\n";
      }
    }
    out += lineText;
    prevY = y;
  }

  return out.trim();
}

/**
 * Extract text for every page of a PDF, preserving paragraph structure.
 * Returns { pages: string[], text: string, avgCharsPerPage: number, numPages }
 */
export async function extractPdfText(arrayBuffer) {
  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    if (err?.name === "PasswordException") {
      throw new PasswordProtectedError();
    }
    throw new CorruptPdfError();
  }

  const pages = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = groupItemsIntoText(textContent);
    pages.push(pageText);
  }

  const totalChars = pages.reduce((sum, p) => sum + p.length, 0);
  const avgCharsPerPage = doc.numPages ? totalChars / doc.numPages : 0;

  return {
    doc,
    pages,
    text: pages.join("\n\n"),
    avgCharsPerPage,
    numPages: doc.numPages,
  };
}

export function isLikelyScanned(avgCharsPerPage) {
  return avgCharsPerPage < SCANNED_PAGE_CHAR_THRESHOLD;
}

/**
 * Rasterize a single PDF page to a canvas and return it as a data URL,
 * for OCR fallback on scanned documents.
 */
export async function renderPageToCanvas(doc, pageNum, scale = 2) {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}
