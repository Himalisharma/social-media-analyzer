import { useState } from "react";

const CATEGORY_CLASS = {
  good: "mark-good",
  warn: "mark-warn",
  bad: "mark-bad",
  tag: "mark-tag",
  link: "mark-link",
  hook: "mark-hook",
};

function buildSegments(text, spans) {
  // spans may overlap (e.g. hook line overlapping a hashtag) — keep it simple
  // and non-overlapping by taking the first span that claims each region.
  const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
  const claimed = [];
  let lastEnd = 0;

  for (const span of sorted) {
    if (span.start < lastEnd) continue; // skip overlaps, keep first-claimed
    claimed.push(span);
    lastEnd = span.end;
  }

  const segments = [];
  let cursor = 0;
  for (const span of claimed) {
    if (span.start > cursor) {
      segments.push({ text: text.slice(cursor, span.start), plain: true });
    }
    segments.push({ text: text.slice(span.start, span.end), ...span });
    cursor = span.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), plain: true });
  }
  return segments;
}

export default function AnnotatedText({ text, highlights }) {
  const [tooltip, setTooltip] = useState(null); // { note, x, y }

  if (!text) {
    return (
      <p className="font-display italic text-muted text-center py-10">
        No text extracted yet.
      </p>
    );
  }

  const segments = buildSegments(text, highlights || []);

  const showTooltip = (e, note) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = e.currentTarget.closest("[data-sheet]")?.getBoundingClientRect();
    if (!containerRect) return;
    setTooltip({
      note,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
    });
  };

  return (
    <div data-sheet className="relative">
      <p className="font-display text-lg sm:text-xl leading-relaxed text-ink whitespace-pre-wrap">
        {segments.map((seg, i) =>
          seg.plain ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <span
              key={i}
              className={CATEGORY_CLASS[seg.category] || ""}
              onMouseEnter={(e) => showTooltip(e, seg.note)}
              onFocus={(e) => showTooltip(e, seg.note)}
              onMouseLeave={() => setTooltip(null)}
              onBlur={() => setTooltip(null)}
              tabIndex={0}
            >
              {seg.text}
            </span>
          )
        )}
      </p>

      {tooltip && (
        <div
          className="margin-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.note}
        </div>
      )}
    </div>
  );
}
