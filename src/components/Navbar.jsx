import { useState } from "react";
import { PenLine, Menu, X } from "lucide-react";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#workspace", label: "Analyze" },
  { href: "#ideas", label: "Post ideas" },
  { href: "#about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#home" className="flex items-center gap-2.5 shrink-0 group">
            <span className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0 group-hover:bg-accent-dark transition-colors">
              <PenLine size={16} className="text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg text-ink leading-none">Margin</span>
          </a>

          <nav className="hidden sm:flex items-center gap-1" aria-label="Primary">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-sans text-sm text-muted hover:text-ink px-3 py-2 rounded-md hover:bg-accent-soft transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#workspace"
            className="hidden sm:inline-flex font-sans text-xs font-medium uppercase tracking-wider bg-accent hover:bg-accent-dark text-white px-3.5 py-2 rounded-md transition-colors"
          >
            Analyze a post
          </a>

          <button
            type="button"
            className="sm:hidden text-ink p-2 -mr-2"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <nav
            className="sm:hidden pb-4 flex flex-col gap-1 border-t border-line pt-3"
            aria-label="Primary"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-sans text-sm text-muted hover:text-ink px-3 py-2.5 rounded-md hover:bg-accent-soft transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#workspace"
              onClick={() => setOpen(false)}
              className="mt-1 font-sans text-xs font-medium uppercase tracking-wider bg-accent hover:bg-accent-dark text-white px-3.5 py-2.5 rounded-md text-center transition-colors"
            >
              Analyze a post
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
