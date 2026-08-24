import { createWorker } from "tesseract.js";

let workerPromise = null;
// The logger is bound once at worker creation, so we route progress
// events through a mutable ref that points at whichever job is active.
let activeProgressHandler = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 1, {
      logger: (m) => {
        if (activeProgressHandler && m.status === "recognizing text") {
          activeProgressHandler(Math.round((m.progress || 0) * 100));
        }
      },
    });
  }
  return workerPromise;
}

export class OcrFailedError extends Error {
  constructor(detail) {
    super(
      detail ||
        "OCR couldn't find readable text in this image — it may be blank, too low-resolution, or too blurry."
    );
    this.name = "OcrFailedError";
  }
}

/**
 * Run OCR on an image source (File, Blob, canvas, or data URL), reusing a
 * single shared worker. onProgress receives a 0-100 number.
 */
export async function ocrImage(source, onProgress) {
  const worker = await getWorker();

  activeProgressHandler = onProgress || null;
  let result;
  try {
    result = await worker.recognize(source, {}, { text: true });
  } catch {
    activeProgressHandler = null;
    throw new OcrFailedError();
  }
  activeProgressHandler = null;

  const { data } = result;
  const text = (data.text || "").trim();
  if (!text) {
    throw new OcrFailedError();
  }

  const words = (data.words || []).map((w) => ({
    text: w.text,
    confidence: w.confidence,
  }));

  const avgConfidence = words.length
    ? words.reduce((sum, w) => sum + w.confidence, 0) / words.length
    : data.confidence ?? 0;

  const uncertainWords = words.filter((w) => w.confidence < 60).length;

  return {
    text,
    confidence: Math.round(avgConfidence),
    wordCount: words.length,
    uncertainWords,
  };
}

export async function terminateOcrWorker() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}
