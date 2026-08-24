import { X, Loader2, FileWarning } from "lucide-react";

function scoreColor(score) {
  if (score >= 75) return "text-sage border-sage/50";
  if (score >= 50) return "text-highlighter border-highlighter/50";
  return "text-pen border-pen/50";
}

export default function FileTabs({ files, activeId, onSelect, onRemove }) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Uploaded posts">
      {files.map((f) => {
        const active = f.id === activeId;
        return (
          <div
            key={f.id}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            onClick={() => onSelect(f.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(f.id)}
            className={`
              group flex items-center gap-2 shrink-0 pl-3 pr-2 py-2 rounded-md border cursor-pointer
              font-sans text-xs transition-colors
              ${active ? "bg-card border-sage text-ink" : "bg-transparent border-sage-dim/40 text-muted hover:border-sage-dim hover:text-ink"}
            `}
          >
            {f.status === "processing" && (
              <Loader2 size={12} className="animate-spin text-sage shrink-0" />
            )}
            {f.status === "error" && <FileWarning size={12} className="text-pen shrink-0" />}
            {f.status === "ready" && f.analysis && (
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded border tabular-nums shrink-0 ${scoreColor(
                  f.analysis.score
                )}`}
              >
                {f.analysis.score}
              </span>
            )}
            <span className="max-w-[10rem] truncate">{f.name}</span>
            <button
              aria-label={`Remove ${f.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
              className="opacity-60 hover:opacity-100 hover:text-pen transition-opacity shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
