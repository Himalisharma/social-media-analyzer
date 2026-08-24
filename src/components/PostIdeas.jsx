import { ArrowRight, Lightbulb, MessageCircleQuestion, Sparkles } from "lucide-react";

const IDEAS = [
  {
    icon: Lightbulb,
    label: "STRONGER HOOK",
    title: "Lead with the reason to care.",
    body: "Replace a generic opening with a specific lesson, result, question, or surprising claim.",
    example: "Instead of: I learned a lot during my internship.\nTry: I made 3 mistakes during my first internship — here's what I would do differently.",
  },
  {
    icon: Sparkles,
    label: "MAKE IT SCANNABLE",
    title: "Give every idea some breathing room.",
    body: "Short paragraphs, numbered points, and intentional line breaks make posts easier to read on mobile.",
    example: "Hook → useful insight → 3 takeaways → personal close → CTA",
  },
  {
    icon: MessageCircleQuestion,
    label: "BETTER CTA",
    title: "Give people something easy to answer.",
    body: "A specific question usually creates a stronger invitation than a generic 'What do you think?'.",
    example: "Try: What's one lesson you wish you'd known earlier?",
  },
];

export default function PostIdeas() {
  return (
    <section id="ideas" className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-8 sm:pb-10 scroll-mt-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="max-w-xl">
          <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
            Ideas for your next draft
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-ink mt-2">Make your post stand out.</h2>
          <p className="font-sans text-sm sm:text-base text-muted mt-2 leading-relaxed">
            A few editorial moves you can use before you publish — or let Margin spot them for you.
          </p>
        </div>
        <a href="#workspace" className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent hover:text-accent-dark transition-colors">
          Analyze your draft <ArrowRight size={15} />
        </a>
      </div>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
        {IDEAS.map((idea) => {
          const Icon = idea.icon;
          return (
            <article key={idea.label} className="bg-card border border-line rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <Icon size={18} strokeWidth={2} />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted mt-5">{idea.label}</p>
              <h3 className="font-display text-xl text-ink mt-1.5">{idea.title}</h3>
              <p className="font-sans text-sm text-muted mt-2 leading-relaxed">{idea.body}</p>
              <div className="mt-4 rounded-xl bg-paper border border-line p-3.5">
                <p className="font-mono text-[11px] text-ink whitespace-pre-line leading-relaxed">{idea.example}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
