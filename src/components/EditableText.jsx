import { useState } from "react";
import { Pencil, Eye } from "lucide-react";
import AnnotatedText from "./AnnotatedText";

// Parent should pass a `key` tied to the active file's id so this component
// remounts (and re-derives its initial draft) when the user switches files.
export default function EditableText({ text, highlights, onSave }) {
  const [mode, setMode] = useState("annotated"); // "annotated" | "edit"
  const [draft, setDraft] = useState(text);

  const dirty = draft !== text;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 bg-ink-softer rounded-md p-0.5">
          <button
            onClick={() => setMode("annotated")}
            className={`inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-1.5 rounded transition-colors ${
              mode === "annotated" ? "bg-card text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <Eye size={13} /> Annotated
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`inline-flex items-center gap-1.5 font-sans text-xs font-medium px-2.5 py-1.5 rounded transition-colors ${
              mode === "edit" ? "bg-card text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <Pencil size={13} /> Edit text
          </button>
        </div>

        {mode === "edit" && (
          <button
            onClick={() => onSave(draft)}
            disabled={!dirty}
            className="font-sans text-xs font-medium bg-pen hover:bg-pen-dim disabled:bg-ink-softer disabled:text-cream-dim disabled:cursor-not-allowed text-paper px-3 py-1.5 rounded-md transition-colors"
          >
            Save & re-analyze
          </button>
        )}
      </div>

      <div className="bg-paper rounded-sm shadow-xl p-6 sm:p-8 paper-texture min-h-[200px]">
        {mode === "annotated" ? (
          <AnnotatedText text={text} highlights={highlights} />
        ) : (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="w-full bg-transparent font-display text-lg leading-relaxed text-ink resize-y focus:outline-none"
            placeholder="Extracted text will appear here — edit anything OCR got wrong before saving."
          />
        )}
      </div>
    </div>
  );
}
