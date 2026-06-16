export type Category =
  | 'Technology'
  | 'Business'
  | 'Science'
  | 'Health'
  | 'Culture'
  | 'Other';

/** Fixed taxonomy, in tie-break priority order. `Other` is the fallback. */
export const CATEGORIES: readonly Category[] = [
  'Technology',
  'Business',
  'Science',
  'Health',
  'Culture',
  'Other',
];

export interface Digest {
  /** 1–3 sentence summary. */
  summary: string;
  /** Up to 5 bullet-sized key points. */
  keyPoints: string[];
  /** Up to 5 lowercase keyword tags. */
  tags: string[];
  suggestedCategory: Category;
}

export interface DigestInput {
  text: string;
  title?: string;
}

/** The seam: mock (Feature 002/003) and HTTP/Claude (Feature 004) both conform. */
export interface Digester {
  digest(input: DigestInput): Promise<Digest>;
}
