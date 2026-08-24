import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { SAMPLES } from "../constants/samples";

export default function Hero({ onFiles, disabled, uploadSlot }) {
  const [loadingSample, setLoadingSample] = useState(null);

  const loadSample = async (sample) => {
    if (disabled || loadingSample) return;
    setLoadingSample(sample.id);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}samples/${sample.file}`);
      if (!res.ok) throw new Error("sample fetch failed");
      const blob = await res.blob();
      const file = new File([blob], sample.name, { type: sample.type });
      onFiles([file]);
    } catch {
      // Sample fixtures are static and bundled — a failure here means the
      // asset didn't ship, not a user problem. Fail quietly to the console.
      // eslint-disable-next-line no-console
      console.error(`Could not load sample "${sample.name}".`);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <section id="home" className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-4 scroll-mt-16">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-accent bg-accent-soft border border-accent/20 rounded-full px-3 py-1">
          <Sparkles size={12} /> Editorial notes, before you publish
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-[1.08] mt-5">
          Turn your draft into a stronger post.
        </h1>
        <p className="font-sans text-base sm:text-lg text-muted mt-4 leading-relaxed">
          Upload a screenshot or exported PDF of your post. Margin reads it, marks it up like an
          editor with a red pen, and scores it against the platform you're posting to — hook,
          length, hashtags, links, and more.
        </p>
      </div>

      <div className="mt-8">{uploadSlot}</div>

      <div className="mt-6 rounded-2xl border border-line bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
              New here? Try a sample
            </p>
            <p className="font-sans text-xs text-muted mt-1">
              See Margin's analysis instantly without preparing a post.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
            5 ready-made examples
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={disabled || loadingSample !== null}
              onClick={() => loadSample(sample)}
              title={sample.hint}
              className="group inline-flex items-center gap-2 font-sans text-xs font-medium text-ink bg-paper border border-line hover:border-accent hover:bg-accent-soft rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSample === sample.id ? (
                <Loader2 size={12} className="animate-spin text-accent shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              )}
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
