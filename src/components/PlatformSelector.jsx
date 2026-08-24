import { PLATFORMS } from "../services/analysisEngine";

export default function PlatformSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Platform">
      {Object.values(PLATFORMS).map((platform) => {
        const active = platform.id === value;
        return (
          <button
            key={platform.id}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(platform.id)}
            className={`
              font-sans text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
              ${
                active
                  ? "bg-pen border-pen text-paper"
                  : "bg-transparent border-sage-dim/60 text-muted hover:border-sage hover:text-ink"
              }
            `}
          >
            {platform.label}
          </button>
        );
      })}
    </div>
  );
}
