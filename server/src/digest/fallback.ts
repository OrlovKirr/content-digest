import type { Category, Digest, DigestInput } from './schema';
import { CATEGORIES } from './schema';

type RealCategory = Exclude<Category, 'Other'>;

const STOPWORDS = new Set<string>([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'for',
  'with', 'as', 'at', 'by', 'from', 'into', 'is', 'are', 'was', 'were', 'be',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we',
  'our', 'you', 'your', 'not', 'no', 'so', 'than', 'then', 'there', 'here',
  'all', 'any', 'every', 'new', 'more', 'most', 'very', 'just', 'also', 'only',
  'one', 'two', 'now', 'near', 'back', 'like', 'well',
]);

const KEYWORDS: Record<RealCategory, ReadonlySet<string>> = {
  Technology: new Set(['software', 'code', 'data', 'tech', 'digital', 'algorithm', 'app', 'computer', 'cloud', 'machine', 'ai', 'programming', 'internet']),
  Business: new Set(['business', 'market', 'revenue', 'funding', 'startup', 'company', 'customer', 'sales', 'profit', 'investment', 'economy', 'growth', 'product', 'money']),
  Science: new Set(['science', 'research', 'study', 'physics', 'chemistry', 'biology', 'experiment', 'theory', 'space', 'quantum', 'climate', 'energy', 'discovery']),
  Health: new Set(['health', 'medical', 'disease', 'doctor', 'patient', 'hospital', 'medicine', 'mental', 'diet', 'virus', 'vaccine', 'therapy', 'treatment']),
  Culture: new Set(['art', 'music', 'film', 'book', 'culture', 'history', 'food', 'travel', 'fashion', 'design', 'story', 'game', 'movie']),
};

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function contentWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (w) => w.length >= 2 && !STOPWORDS.has(w),
  );
}

function suggestCategory(words: string[]): Category {
  const scores = new Map<RealCategory, number>();
  for (const word of words) {
    for (const category of Object.keys(KEYWORDS) as RealCategory[]) {
      if (KEYWORDS[category].has(word)) {
        scores.set(category, (scores.get(category) ?? 0) + 1);
      }
    }
  }
  let best: Category = 'Other';
  let bestScore = 0;
  for (const category of CATEGORIES) {
    if (category === 'Other') continue;
    const score = scores.get(category) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return bestScore > 0 ? best : 'Other';
}

/** Deterministic, network-free, key-free digest used when ANTHROPIC_API_KEY is unset. */
export function fallbackDigest(input: DigestInput): Digest {
  const text = input.text.trim();
  const sents = sentences(text);
  const words = contentWords(text);

  const summary = sents.slice(0, 2).join(' ') || text;

  const scored = sents.map((sentence, idx) => ({
    sentence,
    idx,
    score: contentWords(sentence).length,
  }));
  const keyPoints = [...scored]
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, Math.min(4, scored.length))
    .sort((a, b) => a.idx - b.idx)
    .map((s) => s.sentence);

  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  const tags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([word]) => word);

  return {
    summary,
    keyPoints: keyPoints.length > 0 ? keyPoints : [summary],
    tags: tags.length > 0 ? tags : ['untagged'],
    suggestedCategory: suggestCategory(words),
  };
}
