# Test data

Sample files to exercise each path through Margin's upload → extract → analyze pipeline.

| File | Type | What it exercises |
|---|---|---|
| `01-clean-digital-post.pdf` | PDF, real text layer | The main path: pdfjs-dist extracts embedded text directly, no OCR needed. Post is well-formed (short hook, numbered list, CTA, 3 hashtags) so it should score well across most platforms — good for confirming the "good" states of every check render correctly. |
| `02-screenshotted-post.png` | PNG, clean rendered text | Standalone-image OCR path. High-contrast, clean sans-serif text — should OCR with high confidence (90%+) and produce clean analysis. Confirms the OCR confidence summary shows a "looks clean" message when few/no words are uncertain. |
| `03-low-quality-scan.png` | PNG, degraded/noisy | Stresses OCR accuracy: blurred, low-contrast, noise-added image. Expect a meaningfully lower OCR confidence score and several "uncertain" words flagged — this is the file to use for confirming the low-confidence UI path and the "worth a check" messaging, and for testing that the editable-text view lets you correct OCR mistakes before re-analyzing. |
| `04-very-short-post.pdf` | PDF, real text layer | A post far under every platform's ideal length ("Shipped it."). Confirms the length check's "too short" state, and that very short text doesn't crash the readability/formatting checks (which special-case low word counts). |
| `05-over-character-limit.pdf` | PDF, real text layer | A long-form post (~530 characters) that exceeds X/Twitter's 280-character limit but fits comfortably on LinkedIn/Instagram. Use it to confirm the length check's "over the limit" bad-state messaging and to test switching the platform selector and watching the score/length message update live. |

## Regenerating these files

The PDFs were built with `reportlab` and the images with `Pillow`; both are standard Python packages. There's no need to regenerate them for normal use — they're static fixtures — but if you want to tweak the content, a short script using `reportlab.pdfgen.canvas` (for PDFs) and `PIL.ImageDraw` (for images, optionally piped through `ImageFilter.GaussianBlur` plus manual pixel noise for the degraded-scan case) reproduces the same shapes of file.
