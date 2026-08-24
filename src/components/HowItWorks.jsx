import { Upload, ScanText, ClipboardCheck, PenSquare } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drop a PDF export or a screenshot of your post. Nothing leaves your browser — the whole pipeline runs client-side.",
  },
  {
    icon: ScanText,
    title: "Extract",
    body: "PDFs with a real text layer are read directly. Screenshots and scans go through OCR, with a confidence score so you know what to double-check.",
  },
  {
    icon: ClipboardCheck,
    title: "Analyze",
    body: "Margin checks the hook, length, hashtags, links, and readability against the platform you pick, then scores the post out of 100.",
  },
  {
    icon: PenSquare,
    title: "Revise",
    body: "Read the red-pen notes inline, fix the text right in the browser, and save to re-score instantly — no re-upload needed.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-16">
      <div className="max-w-xl">
        <h2 className="font-display text-3xl text-ink">How it works</h2>
        <p className="font-sans text-sm sm:text-base text-muted mt-2 leading-relaxed">
          Four steps, all running locally — from raw file to a marked-up, scored post.
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-softer rounded-lg overflow-hidden">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="bg-card p-5 sm:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-md bg-ink flex items-center justify-center text-sage">
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span className="font-mono text-xs text-muted/70 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h3 className="font-sans text-sm font-semibold text-ink">{step.title}</h3>
                <p className="font-sans text-xs text-muted mt-1.5 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
