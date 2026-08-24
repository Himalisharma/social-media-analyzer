// Small, dependency-free text helpers shared by the analysis engine.

export function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countSentences(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (matches && matches.length) return matches.length;
  // no terminal punctuation — treat as one sentence if there's any text
  return 1;
}

/**
 * Approximate syllable count via vowel-group counting.
 * Not linguistically perfect, but good enough for a Flesch estimate.
 */
export function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;

  let stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  stripped = stripped.replace(/^y/, "");

  const groups = stripped.match(/[aeiouy]{1,2}/g);
  const count = groups ? groups.length : 1;
  return Math.max(1, count);
}

export function fleschReadingEase(text) {
  const words = (text.match(/[A-Za-z']+/g) || []);
  const wordCount = words.length;
  const sentenceCount = countSentences(text);
  if (wordCount === 0) return { score: 0, wordCount, sentenceCount, syllableCount: 0 };

  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const score =
    206.835 -
    1.015 * (wordCount / Math.max(1, sentenceCount)) -
    84.6 * (syllableCount / wordCount);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    wordCount,
    sentenceCount,
    syllableCount,
  };
}

export function extractHashtags(text) {
  const matches = [...text.matchAll(/#[\w]+/g)];
  return matches.map((m) => ({ value: m[0], index: m.index }));
}

export function extractMentions(text) {
  const matches = [...text.matchAll(/@[\w.]+/g)];
  return matches.map((m) => ({ value: m[0], index: m.index }));
}

export function extractLinks(text) {
  const matches = [...text.matchAll(/(https?:\/\/[^\s]+|www\.[^\s]+)/g)];
  return matches.map((m) => ({ value: m[0], index: m.index }));
}

export function extractAllCapsWords(text) {
  // words of 3+ letters, all uppercase, not just an acronym like "AI"/"US"
  const matches = [...text.matchAll(/\b[A-Z]{3,}\b/g)];
  return matches
    .filter((m) => m[0] !== m[0].toLowerCase()) // guard, always true but explicit
    .map((m) => ({ value: m[0], index: m.index }));
}

export function extractEmoji(text) {
  const emojiRegex =
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
  return [...text.matchAll(emojiRegex)].map((m) => ({ value: m[0], index: m.index }));
}

const CTA_PATTERNS = [
  /comment (below|your)/i,
  /comments below/i,
  /link in bio/i,
  /dm (us|me)/i,
  /tag (a friend|someone)/i,
  /share (this|with|your)/i,
  /save (this|for later)/i,
  /follow (us|for more)/i,
  /swipe up/i,
  /click the link/i,
  /sign up/i,
  /learn more/i,
  /read more/i,
  /let (us|me) know/i,
  /drop (a|it|your)/i,
  /double tap/i,
];

export function findCtaPhrase(text) {
  for (const pattern of CTA_PATTERNS) {
    const match = text.match(pattern);
    if (match) return { value: match[0], index: match.index };
  }
  const q = text.indexOf("?");
  if (q !== -1) {
    // grab the sentence containing the question mark as the "CTA"
    const start = Math.max(0, text.lastIndexOf(".", q) + 1, text.lastIndexOf("\n", q) + 1);
    return { value: text.slice(start, q + 1).trim(), index: start, isQuestion: true };
  }
  return null;
}

export function getFirstLine(text) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const newlineIdx = trimmed.indexOf("\n");
  const line = newlineIdx === -1 ? trimmed : trimmed.slice(0, newlineIdx);
  return line.trim();
}

export function getParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
