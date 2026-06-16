const STOPWORDS = new Set<string>([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'for',
  'with', 'as', 'at', 'by', 'from', 'into', 'about', 'over', 'after', 'before',
  'between', 'out', 'up', 'down', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'am', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would',
  'can', 'could', 'should', 'may', 'might', 'must', 'shall', 'this', 'that',
  'these', 'those', 'it', 'its', 'they', 'them', 'their', 'he', 'she', 'his',
  'her', 'we', 'our', 'you', 'your', 'i', 'my', 'me', 'us', 'who', 'whom',
  'which', 'what', 'when', 'where', 'why', 'how', 'not', 'no', 'yes', 'so',
  'than', 'then', 'there', 'here', 'all', 'any', 'some', 'each', 'every', 'new',
  'more', 'most', 'very', 'just', 'also', 'only', 'such', 'own', 'same', 'too',
  'one', 'two', 'many', 'much', 'few', 'now', 'near', 'back', 'like', 'well',
]);

/** Split text into trimmed, non-empty sentences. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Lowercase alphanumeric tokens. */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function isStopword(word: string): boolean {
  return STOPWORDS.has(word);
}

/** Tokens that carry meaning: length >= 2 and not a stop-word. */
export function contentWords(text: string): string[] {
  return tokenize(text).filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}
