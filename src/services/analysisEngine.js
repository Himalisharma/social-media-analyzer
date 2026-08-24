import {
  countWords,
  fleschReadingEase,
  extractHashtags,
  extractMentions,
  extractLinks,
  extractAllCapsWords,
  extractEmoji,
  findCtaPhrase,
  getFirstLine,
  getParagraphs,
} from "../utils/textUtils";

export const PLATFORMS = {
  general: {
    id: "general",
    label: "General",
    idealLength: [80, 300],
    maxLength: 2000,
    idealHashtags: [1, 3],
  },
  twitter: {
    id: "twitter",
    label: "X / Twitter",
    idealLength: [70, 180],
    maxLength: 280,
    idealHashtags: [0, 2],
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    idealLength: [138, 500],
    maxLength: 2200,
    idealHashtags: [3, 8],
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    idealLength: [150, 600],
    maxLength: 3000,
    idealHashtags: [2, 5],
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    idealLength: [40, 200],
    maxLength: 63206,
    idealHashtags: [0, 2],
  },
};

const CHECK_WEIGHTS = {
  length: 15,
  hook: 12,
  cta: 13,
  hashtags: 10,
  readability: 15,
  formatting: 10,
  tone: 15,
  emoji: 10,
};

function clampPoints(fraction, weight) {
  return Math.round(Math.max(0, Math.min(1, fraction)) * weight);
}

// ---------- individual checks ----------

function checkLength(text, platform) {
  const len = text.length;
  const [idealMin, idealMax] = platform.idealLength;
  const max = platform.maxLength;
  const weight = CHECK_WEIGHTS.length;

  if (len === 0) {
    return {
      id: "length",
      label: "Length",
      status: "bad",
      message: "There's no text to measure yet.",
      points: 0,
      maxPoints: weight,
    };
  }

  if (len > max) {
    return {
      id: "length",
      label: "Length",
      status: "bad",
      message: `${len} characters — over ${platform.label}'s ${max}-character limit by ${len - max}. It will be cut off or rejected.`,
      points: 0,
      maxPoints: weight,
    };
  }

  if (len >= idealMin && len <= idealMax) {
    return {
      id: "length",
      label: "Length",
      status: "good",
      message: `${len} characters — right in ${platform.label}'s sweet spot (${idealMin}–${idealMax}).`,
      points: weight,
      maxPoints: weight,
    };
  }

  if (len < idealMin) {
    const fraction = len / idealMin;
    return {
      id: "length",
      label: "Length",
      status: "warn",
      message: `${len} characters — a bit short of the ideal ${idealMin}–${idealMax} range. There's room to add context.`,
      points: clampPoints(0.4 + 0.6 * fraction, weight),
      maxPoints: weight,
    };
  }

  const over = len - idealMax;
  const fraction = 1 - over / (max - idealMax || 1);
  return {
    id: "length",
    label: "Length",
    status: "warn",
    message: `${len} characters — ${over} over the ideal ${idealMin}–${idealMax} range, though still under the ${max} limit.`,
    points: clampPoints(0.4 + 0.5 * fraction, weight),
    maxPoints: weight,
  };
}

function checkHook(text) {
  const weight = CHECK_WEIGHTS.hook;
  const firstLine = getFirstLine(text);

  if (!firstLine) {
    return {
      id: "hook",
      label: "Opening hook",
      status: "bad",
      message: "No opening line to hook a reader before they scroll past.",
      points: 0,
      maxPoints: weight,
    };
  }

  const isShort = firstLine.length <= 80;
  const startsWithQuestion = /^(who|what|when|where|why|how|is|are|do|does|did|can|will|would|should)\b/i.test(
    firstLine
  ) || firstLine.trim().endsWith("?");
  const startsWithNumber = /^["'“]?\d/.test(firstLine.trim());

  const strong = isShort && (startsWithQuestion || startsWithNumber);
  const partial = isShort || startsWithQuestion || startsWithNumber;

  if (strong) {
    return {
      id: "hook",
      label: "Opening hook",
      status: "good",
      message: `Opening line ("${truncate(firstLine, 50)}") is short and leads with a ${
        startsWithNumber ? "number" : "question"
      } — a proven scroll-stopper.`,
      points: weight,
      maxPoints: weight,
    };
  }

  if (partial) {
    return {
      id: "hook",
      label: "Opening hook",
      status: "warn",
      message: isShort
        ? `Opening line is short, but doesn't lead with a question or number. Consider reframing it as one.`
        : `Opening line leads well, but at ${firstLine.length} characters it's longer than the ~80 that hold attention in a feed.`,
      points: clampPoints(0.55, weight),
      maxPoints: weight,
    };
  }

  return {
    id: "hook",
    label: "Opening hook",
    status: "bad",
    message: `Opening line is ${firstLine.length} characters and doesn't lead with a question or number — easy to scroll past.`,
    points: clampPoints(0.15, weight),
    maxPoints: weight,
  };
}

function checkCta(text) {
  const weight = CHECK_WEIGHTS.cta;
  const cta = findCtaPhrase(text);
  const questionCount = (text.match(/\?/g) || []).length;

  if (cta && !cta.isQuestion) {
    return {
      id: "cta",
      label: "Call to action",
      status: "good",
      message: `Found a clear CTA phrase ("${cta.value}") telling readers exactly what to do next.`,
      points: weight,
      maxPoints: weight,
    };
  }

  if (questionCount > 0) {
    return {
      id: "cta",
      label: "Call to action",
      status: "warn",
      message: `${questionCount} question mark${questionCount > 1 ? "s" : ""} found, which invites replies, but there's no explicit CTA phrase (e.g. "comment below").`,
      points: clampPoints(0.55, weight),
      maxPoints: weight,
    };
  }

  return {
    id: "cta",
    label: "Call to action",
    status: "bad",
    message: "No CTA phrase and no question — nothing is prompting a reply, save, or click.",
    points: 0,
    maxPoints: weight,
  };
}

function checkHashtags(hashtags, platform) {
  const weight = CHECK_WEIGHTS.hashtags;
  const count = hashtags.length;
  const [min, max] = platform.idealHashtags;

  if (count >= min && count <= max) {
    return {
      id: "hashtags",
      label: "Hashtags",
      status: "good",
      message:
        min === 0 && max === 0
          ? "No hashtags used, which fits this platform's low-hashtag norms."
          : `${count} hashtag${count === 1 ? "" : "s"} — within ${platform.label}'s ideal range of ${min}–${max}.`,
      points: weight,
      maxPoints: weight,
    };
  }

  if (count < min) {
    return {
      id: "hashtags",
      label: "Hashtags",
      status: "warn",
      message: `${count} hashtag${count === 1 ? "" : "s"} — ${platform.label} posts typically do best with ${min}–${max}.`,
      points: clampPoints(0.3 + 0.5 * (min ? count / min : 0), weight),
      maxPoints: weight,
    };
  }

  const over = count - max;
  return {
    id: "hashtags",
    label: "Hashtags",
    status: over > 5 ? "bad" : "warn",
    message: `${count} hashtags — ${over} over the ideal ${min}–${max}. Too many can read as spammy and hurt reach.`,
    points: clampPoints(Math.max(0, 0.6 - over * 0.1), weight),
    maxPoints: weight,
  };
}

function checkReadability(text) {
  const weight = CHECK_WEIGHTS.readability;
  const { score, wordCount } = fleschReadingEase(text);

  if (wordCount < 5) {
    return {
      id: "readability",
      label: "Readability",
      status: "warn",
      message: "Too little text to score readability reliably.",
      points: clampPoints(0.6, weight),
      maxPoints: weight,
    };
  }

  if (score >= 60) {
    return {
      id: "readability",
      label: "Readability",
      status: "good",
      message: `Flesch score ${score} — easy to skim on a phone screen.`,
      points: weight,
      maxPoints: weight,
    };
  }

  if (score >= 40) {
    return {
      id: "readability",
      label: "Readability",
      status: "warn",
      message: `Flesch score ${score} — moderately dense. Shorter sentences would make it easier to skim.`,
      points: clampPoints(0.55, weight),
      maxPoints: weight,
    };
  }

  return {
    id: "readability",
    label: "Readability",
    status: "bad",
    message: `Flesch score ${score} — dense, long-sentence writing. Break it into shorter sentences.`,
    points: clampPoints(0.2, weight),
    maxPoints: weight,
  };
}

function checkFormatting(text) {
  const weight = CHECK_WEIGHTS.formatting;
  const paragraphs = getParagraphs(text);
  const words = countWords(text);

  if (words < 20) {
    return {
      id: "formatting",
      label: "Formatting",
      status: "good",
      message: "Short enough that paragraph breaks aren't needed.",
      points: weight,
      maxPoints: weight,
    };
  }

  if (paragraphs.length <= 1 && words > 40) {
    return {
      id: "formatting",
      label: "Formatting",
      status: "bad",
      message: `${words} words in a single block with no breaks. Split it into shorter paragraphs or lines.`,
      points: clampPoints(0.15, weight),
      maxPoints: weight,
    };
  }

  const longestParagraphWords = Math.max(
    ...paragraphs.map((p) => countWords(p)),
    0
  );

  if (longestParagraphWords > 60) {
    return {
      id: "formatting",
      label: "Formatting",
      status: "warn",
      message: `One paragraph runs ${longestParagraphWords} words — consider breaking it up further.`,
      points: clampPoints(0.55, weight),
      maxPoints: weight,
    };
  }

  return {
    id: "formatting",
    label: "Formatting",
    status: "good",
    message: `Broken into ${paragraphs.length} paragraphs — easy to scan.`,
    points: weight,
    maxPoints: weight,
  };
}

function checkTone(text, allCapsWords) {
  const weight = CHECK_WEIGHTS.tone;
  const exclamations = (text.match(/!/g) || []).length;
  const capsCount = allCapsWords.length;

  const issues = [];
  if (capsCount > 2) issues.push(`${capsCount} all-caps words`);
  if (exclamations > 3) issues.push(`${exclamations} exclamation marks`);

  if (issues.length === 0) {
    return {
      id: "tone",
      label: "Tone",
      status: "good",
      message:
        capsCount === 0 && exclamations === 0
          ? "No shouty formatting — reads as measured, not spammy."
          : `${capsCount} all-caps word${capsCount === 1 ? "" : "s"} and ${exclamations} exclamation mark${exclamations === 1 ? "" : "s"} — well within a natural range.`,
      points: weight,
      maxPoints: weight,
    };
  }

  const severity = capsCount > 5 || exclamations > 6 ? "bad" : "warn";
  return {
    id: "tone",
    label: "Tone",
    status: severity,
    message: `${issues.join(" and ")} — this can trip spam filters and read as shouting.`,
    points: clampPoints(severity === "bad" ? 0.1 : 0.45, weight),
    maxPoints: weight,
  };
}

function checkEmoji(emoji) {
  const weight = CHECK_WEIGHTS.emoji;
  const count = emoji.length;

  if (count === 0) {
    return {
      id: "emoji",
      label: "Emoji usage",
      status: "warn",
      message: "No emoji — a well-placed one or two can add tone and break up text visually.",
      points: clampPoints(0.45, weight),
      maxPoints: weight,
    };
  }

  if (count >= 1 && count <= 4) {
    return {
      id: "emoji",
      label: "Emoji usage",
      status: "good",
      message: `${count} emoji — enough to add tone without cluttering the text.`,
      points: weight,
      maxPoints: weight,
    };
  }

  return {
    id: "emoji",
    label: "Emoji usage",
    status: "bad",
    message: `${count} emoji — likely to read as cluttered or spammy at this density.`,
    points: clampPoints(Math.max(0, 0.5 - (count - 4) * 0.06), weight),
    maxPoints: weight,
  };
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

// ---------- highlight spans for inline annotation ----------

function buildHighlightSpans(text, { hashtags, mentions, links, allCapsWords, hookCheck }) {
  const spans = [];

  hashtags.forEach((h) =>
    spans.push({
      start: h.index,
      end: h.index + h.value.length,
      category: "tag",
      note: "Hashtag — helps discovery when it matches the platform's ideal count.",
    })
  );

  mentions.forEach((m) =>
    spans.push({
      start: m.index,
      end: m.index + m.value.length,
      category: "tag",
      note: "Mention.",
    })
  );

  links.forEach((l) =>
    spans.push({
      start: l.index,
      end: l.index + l.value.length,
      category: "link",
      note: "Link.",
    })
  );

  allCapsWords.forEach((w) =>
    spans.push({
      start: w.index,
      end: w.index + w.value.length,
      category: hookCheck?.status === "bad" ? "bad" : "warn",
      note: "All-caps — can read as shouting.",
    })
  );

  const firstLine = getFirstLine(text);
  if (firstLine) {
    const idx = text.indexOf(firstLine);
    if (idx !== -1) {
      spans.push({
        start: idx,
        end: idx + firstLine.length,
        category: hookCheck?.status === "good" ? "good" : hookCheck?.status === "warn" ? "warn" : "bad",
        note: hookCheck?.message || "Opening line.",
      });
    }
  }

  return spans
    .filter((s) => s.start !== undefined && s.start !== -1 && s.end > s.start)
    .sort((a, b) => a.start - b.start);
}

// ---------- main entry point ----------

export function analyzeText(text, platformId = "general") {
  const platform = PLATFORMS[platformId] || PLATFORMS.general;
  const safeText = text || "";

  const hashtags = extractHashtags(safeText);
  const mentions = extractMentions(safeText);
  const links = extractLinks(safeText);
  const allCapsWords = extractAllCapsWords(safeText);
  const emoji = extractEmoji(safeText);
  const readability = fleschReadingEase(safeText);

  const hookCheck = checkHook(safeText);
  const ctaCheck = checkCta(safeText);

  const checks = [
    checkLength(safeText, platform),
    hookCheck,
    ctaCheck,
    checkHashtags(hashtags, platform),
    checkReadability(safeText),
    checkFormatting(safeText),
    checkTone(safeText, allCapsWords),
    checkEmoji(emoji),
  ];

  const score = checks.reduce((sum, c) => sum + c.points, 0);

  const highlights = buildHighlightSpans(safeText, {
    hashtags,
    mentions,
    links,
    allCapsWords,
    hookCheck,
    ctaCheck,
  });

  return {
    platform: platform.id,
    score,
    label: scoreLabel(score),
    checks,
    stats: {
      characters: safeText.length,
      words: countWords(safeText),
      hashtags: hashtags.length,
      links: links.length,
      mentions: mentions.length,
      emoji: emoji.length,
      readability: readability.score,
    },
    highlights,
  };
}

function scoreLabel(score) {
  if (score >= 75) return "Reads well";
  if (score >= 50) return "Needs a pass";
  return "Needs work";
}
