import {
  extractPdfText,
  isLikelyScanned,
  renderPageToCanvas,
  PasswordProtectedError,
  CorruptPdfError,
} from "./pdfExtractor";
import { ocrImage, OcrFailedError } from "./ocrService";
import { analyzeText } from "./analysisEngine";

/**
 * Run the full upload -> extract -> analyze pipeline for one file.
 * Calls onUpdate(patch) repeatedly with partial state so the UI can show
 * live stage/progress. Returns the final patch as well.
 */
export async function processFile(file, type, platformId, onUpdate) {
  onUpdate({ status: "processing", stage: "reading", progress: null });

  try {
    let text = "";
    let ocrMeta = null;
    let isScanned = false;

    if (type === "application/pdf") {
      const buffer = await file.arrayBuffer();

      onUpdate({ stage: "extracting" });
      const { doc, pages, avgCharsPerPage, numPages } = await extractPdfText(buffer);

      if (isLikelyScanned(avgCharsPerPage)) {
        isScanned = true;
        onUpdate({ stage: "ocr", progress: 0, pageProgress: { current: 0, total: numPages } });

        const pageTexts = [];
        let confidences = [];
        let uncertainTotal = 0;
        let wordTotal = 0;

        for (let i = 1; i <= numPages; i++) {
          onUpdate({ pageProgress: { current: i, total: numPages }, progress: 0 });
          const canvas = await renderPageToCanvas(doc, i, 2);
          const result = await ocrImage(canvas, (pct) => {
            onUpdate({ progress: pct, pageProgress: { current: i, total: numPages } });
          });
          pageTexts.push(result.text);
          confidences.push(result.confidence);
          uncertainTotal += result.uncertainWords;
          wordTotal += result.wordCount;
        }

        text = pageTexts.join("\n\n");
        ocrMeta = {
          confidence: confidences.length
            ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
            : 0,
          uncertainWords: uncertainTotal,
          wordCount: wordTotal,
        };
      } else {
        text = pages.join("\n\n");
      }
    } else {
      // standalone image
      onUpdate({ stage: "ocr", progress: 0, pageProgress: null });
      const result = await ocrImage(file, (pct) => onUpdate({ progress: pct }));
      text = result.text;
      ocrMeta = {
        confidence: result.confidence,
        uncertainWords: result.uncertainWords,
        wordCount: result.wordCount,
      };
      isScanned = true;
    }

    onUpdate({ stage: "analyzing", progress: null });
    const analysis = analyzeText(text, platformId);

    const finalPatch = {
      status: "ready",
      stage: null,
      progress: null,
      pageProgress: null,
      text,
      isScanned,
      ocrMeta,
      analysis,
    };
    onUpdate(finalPatch);
    return finalPatch;
  } catch (err) {
    const message = errorMessageFor(err);
    const patch = { status: "error", stage: null, progress: null, error: message };
    onUpdate(patch);
    return patch;
  }
}

export function reanalyze(text, platformId) {
  return analyzeText(text, platformId);
}

function errorMessageFor(err) {
  if (
    err instanceof PasswordProtectedError ||
    err instanceof CorruptPdfError ||
    err instanceof OcrFailedError
  ) {
    return err.message;
  }
  if (err?.name === "PasswordException") {
    return "This PDF is password-protected. Remove the password and upload it again.";
  }
  return "Something unexpected went wrong while processing this file. Try again, or try a different file.";
}
