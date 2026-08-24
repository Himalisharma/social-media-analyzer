# Margin

Margin is a fully client-side social media content analyzer. Upload a post as a PDF or an image, and Margin extracts the text, runs it through a rule-based engagement analysis, and marks it up like an editor reviewing a manuscript — underlines, wavy lines, and highlighter boxes right on the text, with margin notes on hover.

Nothing leaves the browser. There's no backend, no API key, and no rate limit — PDF parsing, OCR, and scoring all run client-side.

## Architecture

```
                 ┌──────────────┐
   User uploads  │   Upload     │  drag/drop or file picker
   PDF or image  │   Zone       │  validates type, size, non-empty
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Extract    │
                 │              │
                 │  PDF ──► pdfjs-dist reads the embedded text layer,
                 │          grouping items into lines/paragraphs by
                 │          y-position gaps.
                 │          │
                 │          ├─ text layer present & substantial ──► use it
                 │          └─ avg chars/page < threshold (scanned) ──►
                 │             rasterize each page to canvas, OCR it
                 │
                 │  Image ──► tesseract.js OCR directly
                 └──────┬───────┘
                        │  editable text + OCR confidence
                        ▼
                 ┌──────────────┐
                 │   Analyze    │  rule-based engagement scoring:
                 │              │  length, hook, CTA, hashtags,
                 │              │  readability, formatting, tone, emoji
                 └──────┬───────┘
                        │  score + checklist + highlight spans
                        ▼
                 ┌──────────────┐
                 │  Annotated   │  score dial, checklist panel, stats
                 │  Results     │  strip, and the text itself marked up
                 └──────────────┘  with inline editorial annotations
```

## Setup & run

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build locally
npm run lint       # oxlint
```

Requires Node 18+.

## Approach

Everything runs in-browser by design: no backend means no deployment complexity, no API keys to leak, no rate limits, and no server cost — a static host is enough. It also means uploaded posts never leave the user's machine, which matters for pre-publish drafts.

Analysis is rule-based rather than LLM-based on purpose: the checks (length, hook strength, CTA presence, hashtag count, Flesch readability, formatting, tone, emoji density) are well-understood, deterministic heuristics that don't need a model call to compute, run instantly, cost nothing, and give the same input the same score every time — useful when someone is iterating on a caption and wants stable, explainable feedback rather than a black box.

The scanned-PDF fallback works by first extracting the embedded text layer, then checking average characters per page. If that number is implausibly low, the PDF almost certainly has no real text layer (it's a scan or an image dropped onto a page), so each page is rasterized to a canvas and run through the same OCR path used for standalone images, rather than returning a near-empty extraction.

## Known limitations

- OCR (tesseract.js) is English-only by default and struggles with handwriting, stylized fonts, low-contrast screenshots, and dense multi-column layouts.
- The Flesch Reading Ease syllable count is an approximation (vowel-group counting), not a dictionary lookup — it can be off by a syllable on irregular words.
- CTA/hashtag/hook detection is regex- and heuristic-based; it won't catch every phrasing of a call to action, and non-English posts will score poorly since checks assume English.
- Multi-page PDFs are treated as one continuous post — Margin doesn't currently distinguish per-page captions in a carousel-style export.
- Very large or many-page scanned PDFs run OCR page-by-page through a single reused Tesseract worker, so processing time scales with page count.

## Deployment (Vercel / Netlify)

Both are static builds — no environment variables or server config needed.

**Vercel**
```bash
npm run build
vercel deploy --prebuilt  # or connect the repo and let Vercel run `npm run build`
```
Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.

**Netlify**
```bash
npm run build
netlify deploy --dir=dist --prod
```
Or connect the repo with build command `npm run build` and publish directory `dist`.

## Test data

See [`test-data/`](./test-data) for sample files to exercise each path through the pipeline, with notes on what each one is for.
