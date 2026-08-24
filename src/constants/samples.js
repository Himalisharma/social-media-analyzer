// Sample fixtures used by the "Try a sample" buttons on the landing page.
// These files live in /public/samples and mirror /test-data — see
// /test-data/README.md for what path through the pipeline each one exercises.
export const SAMPLES = [
  {
    id: "clean",
    file: "01-clean-digital-post.pdf",
    name: "01-clean-digital-post.pdf",
    label: "Clean post",
    hint: "Well-formed text layer",
    type: "application/pdf",
  },
  {
    id: "screenshot",
    file: "02-screenshotted-post.png",
    name: "02-screenshotted-post.png",
    label: "Screenshotted post",
    hint: "Sharp OCR read",
    type: "image/png",
  },
  {
    id: "scan",
    file: "03-low-quality-scan.png",
    name: "03-low-quality-scan.png",
    label: "Low-quality scan",
    hint: "Noisy OCR read",
    type: "image/png",
  },
  {
    id: "short",
    file: "04-very-short-post.pdf",
    name: "04-very-short-post.pdf",
    label: "Very short post",
    hint: "Under the ideal length",
    type: "application/pdf",
  },
  {
    id: "long",
    file: "05-over-character-limit.pdf",
    name: "05-over-character-limit.pdf",
    label: "Over character limit",
    hint: "Too long for X",
    type: "application/pdf",
  },
];
