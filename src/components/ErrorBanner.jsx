import { AlertTriangle, RotateCcw, X } from "lucide-react";

export default function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div className="bg-pen/10 border border-pen/40 rounded-lg p-5 flex items-start gap-3">
      <AlertTriangle size={18} className="text-pen shrink-0 mt-0.5" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-sm text-ink leading-relaxed">{message}</p>
        <div className="flex gap-2 mt-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 font-sans text-xs font-medium bg-pen hover:bg-pen-dim text-paper px-3 py-1.5 rounded-md transition-colors"
            >
              <RotateCcw size={12} /> Try again
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 font-sans text-xs font-medium border border-sage-dim/60 text-muted hover:text-ink hover:border-sage px-3 py-1.5 rounded-md transition-colors"
            >
              <X size={12} /> Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
