const STAGE_LABELS = {
  reading: "Reading file",
  extracting: "Extracting text",
  ocr: "Running OCR",
  analyzing: "Analyzing content",
};

const STAGE_ORDER = ["reading", "extracting", "ocr", "analyzing"];

export default function LoadingState({ stage, progress, pageProgress, isImage }) {
  const activeStages = isImage
    ? ["reading", "ocr", "analyzing"]
    : STAGE_ORDER;

  const currentIndex = activeStages.indexOf(stage);

  let label = STAGE_LABELS[stage] || "Working";
  if (stage === "ocr" && typeof progress === "number") {
    label += ` — ${progress}%`;
  }
  if (stage === "ocr" && pageProgress && pageProgress.total > 1) {
    label += ` (page ${pageProgress.current} of ${pageProgress.total})`;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="relative w-48 h-64 bg-paper rounded-sm shadow-2xl overflow-hidden paper-texture">
        <div className="absolute inset-0 p-4 space-y-2 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-2 bg-ink/20 rounded-sm"
              style={{ width: `${70 + ((i * 13) % 25)}%` }}
            />
          ))}
        </div>
        <div className="scan-line absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-pen/25 to-transparent" />
      </div>

      <div className="text-center">
        <p className="font-mono text-sm text-highlighter" role="status" aria-live="polite">
          {label}
        </p>
        <div className="flex items-center gap-1.5 mt-3 justify-center">
          {activeStages.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i < currentIndex
                  ? "bg-sage"
                  : i === currentIndex
                  ? "bg-highlighter"
                  : "bg-ink-softer"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
