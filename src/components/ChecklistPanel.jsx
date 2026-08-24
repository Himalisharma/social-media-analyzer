import { Check, TriangleAlert, X } from "lucide-react";

const STATUS_ICON = {
  good: Check,
  warn: TriangleAlert,
  bad: X,
};

const STATUS_COLOR = {
  good: "text-sage",
  warn: "text-highlighter",
  bad: "text-pen",
};

const STATUS_BG = {
  good: "bg-sage/10",
  warn: "bg-highlighter/10",
  bad: "bg-pen/10",
};

export default function ChecklistPanel({ checks }) {
  return (
    <ul className="space-y-2">
      {checks.map((check) => {
        const Icon = STATUS_ICON[check.status];
        return (
          <li
            key={check.id}
            className={`rounded-md p-3 flex gap-3 ${STATUS_BG[check.status]}`}
          >
            <span className={`mt-0.5 shrink-0 ${STATUS_COLOR[check.status]}`}>
              <Icon size={16} strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-sans text-sm font-semibold text-ink">
                  {check.label}
                </span>
                <span className="font-mono text-xs text-ink-dim tabular-nums shrink-0">
                  {check.points}/{check.maxPoints}
                </span>
              </div>
              <p className="font-sans text-xs text-ink-dim mt-0.5 leading-relaxed">
                {check.message}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
