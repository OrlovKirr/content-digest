import { describe, it, expect } from 'vitest';
import { normalizeDigest } from './normalize';
import type { Digest } from './schema';

const base: Digest = {
  summary: '  A summary.  ',
  keyPoints: ['a', 'b', 'c', 'd', 'e', 'f'],
  tags: ['AI', 'ai', '  Data  ', ''],
  suggestedCategory: 'Technology',
};

describe('normalizeDigest', () => {
  it('trims the summary and clamps keyPoints to 5', () => {
    const d = normalizeDigest(base);
    expect(d.summary).toBe('A summary.');
    expect(d.keyPoints).toHaveLength(5);
  });

  it('lowercases, trims, dedupes and clamps tags', () => {
    const d = normalizeDigest(base);
    expect(d.tags).toEqual(['ai', 'data']);
  });

  it('fills empty keyPoints/tags so the contract holds', () => {
    const d = normalizeDigest({ ...base, keyPoints: [], tags: [] });
    expect(d.keyPoints.length).toBeGreaterThanOrEqual(1);
    expect(d.tags.length).toBeGreaterThanOrEqual(1);
  });
});
