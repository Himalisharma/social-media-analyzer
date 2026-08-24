export default function StatsStrip({ stats }) {
  const items = [
    { label: "Characters", value: stats.characters },
    { label: "Words", value: stats.words },
    { label: "Hashtags", value: stats.hashtags },
    { label: "Links", value: stats.links },
    { label: "Readability", value: stats.readability },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-line rounded-md overflow-hidden">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-3 py-2.5 text-center">
          <div className="font-mono text-lg text-ink tabular-nums">{item.value}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
