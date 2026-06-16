import type { Category, Digest, DigestInput, Digester } from './types';
import { CATEGORIES } from './types';
import { contentWords, splitSentences } from './text';

type RealCategory = Exclude<Category, 'Other'>;

const CATEGORY_KEYWORDS: Record<RealCategory, readonly string[]> = {
  Technology: [
    'software', 'code', 'data', 'tech', 'digital', 'internet', 'algorithm',
    'app', 'computer', 'hardware', 'cloud', 'robot', 'machine', 'ai', 'programming',
  ],
  Business: [
    'business', 'market', 'revenue', 'funding', 'startup', 'company', 'customer',
    'sales', 'profit', 'investment', 'economy', 'finance', 'growth', 'product', 'money',
  ],
  Science: [
    'science', 'research', 'study', 'physics', 'chemistry', 'biology', 'experiment',
    'theory', 'scientist', 'space', 'quantum', 'climate', 'energy', 'discovery', 'planet',
  ],
  Health: [
    'health', 'medical', 'disease', 'doctor', 'patient', 'hospital', 'medicine',
    'mental', 'diet', 'fitness', 'virus', 'vaccine', 'therapy', 'wellness', 'treatment',
  ],
  Culture: [
    'art', 'music', 'film', 'book', 'culture', 'history', 'food', 'travel',
    'fashion', 'design', 'story', 'game', 'movie', 'author', 'festival',
  ],
};

const KEYWORD_SETS: Record<RealCategory, ReadonlySet<string>> = {
  Technology: new Set(CATEGORY_KEYWORDS.Technology),
  Business: new Set(CATEGORY_KEYWORDS.Business),
  Science: new Set(CATEGORY_KEYWORDS.Science),
  Health: new Set(CATEGORY_KEYWORDS.Health),
  Culture: new Set(CATEGORY_KEYWORDS.Culture),
};

function suggestCategory(words: string[]): Category {
  const scores = new Map<RealCategory, number>();
  for (const word of words) {
    for (const category of Object.keys(KEYWORD_SETS) as RealCategory[]) {
      if (KEYWORD_SETS[category].has(word)) {
        scores.set(category, (scores.get(category) ?? 0) + 1);
      }
    }
  }
  let best: Category = 'Other';
  let bestScore = 0;
  // Iterate in taxonomy order so ties resolve to the earliest category.
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

function summarize(sentences: string[]): string {
  return sentences.slice(0, 2).join(' ');
}

function extractKeyPoints(sentences: string[]): string[] {
  const scored = sentences.map((sentence, idx) => ({
    sentence,
    idx,
    score: contentWords(sentence).length,
  }));
  return [...scored]
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .slice(0, Math.min(4, scored.length))
    .sort((a, b) => a.idx - b.idx)
    .map((s) => s.sentence);
}

function extractTags(words: string[]): string[] {
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([word]) => word);
}

/** Deterministic, network-free stand-in for the real AI digester (Feature 004). */
export function mockDigest(input: DigestInput): Digest {
  const text = input.text.trim();
  if (text.length === 0) {
    throw new Error('digest: text must not be empty');
  }
  const sentences = splitSentences(text);
  const words = contentWords(text);
  const summary = summarize(sentences) || text;
  const keyPoints = extractKeyPoints(sentences);
  const tags = extractTags(words);
  return {
    summary,
    keyPoints: keyPoints.length > 0 ? keyPoints : [summary],
    tags: tags.length > 0 ? tags : ['untagged'],
    suggestedCategory: suggestCategory(words),
  };
}

export function createMockDigester(): Digester {
  return {
    digest: (input) => Promise.resolve(mockDigest(input)),
  };
}
