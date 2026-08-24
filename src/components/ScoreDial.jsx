import { useEffect, useState } from "react";

const SIZE = 132;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorForScore(score) {
  if (score >= 75) return "var(--color-sage)";
  if (score >= 50) return "var(--color-highlighter)";
  return "var(--color-pen)";
}

export default function ScoreDial({ score, label }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // let the browser paint the 0-state first, then animate to the real score
    const raf = requestAnimationFrame(() => setAnimatedScore(score));
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = CIRCUMFERENCE * (1 - animatedScore / 100);
  const color = colorForScore(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--color-ink-softer)"
            strokeWidth={STROKE}
          />
          <circle
            className="dial-arc"
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold text-ink tabular-nums">
            {score}
          </span>
          <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <span
        className="font-sans text-sm font-medium px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` }}
      >
        {label}
      </span>
    </div>
  );
}
