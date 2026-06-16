import { describe, it, expect } from 'vitest';
import { fallbackDigest } from './fallback';
import { CATEGORIES } from './schema';

const TECH = `Modern software relies on clever ai. New tools help engineers write code faster. The data and the algorithm behind every app keep improving.`;
const BUSINESS = `The startup raised funding to grow revenue. Investors and the market liked the company. Customer growth and profit are the business goals.`;

describe('fallbackDigest', () => {
  it('returns a valid Digest shape', () => {
    const d = fallbackDigest({ text: TECH });
    expect(d.summary.length).toBeGreaterThan(0);
    expect(d.keyPoints.length).toBeGreaterThanOrEqual(1);
    expect(d.keyPoints.length).toBeLessThanOrEqual(5);
    expect(d.tags.length).toBeGreaterThanOrEqual(1);
    expect(d.tags.length).toBeLessThanOrEqual(5);
    expect(CATEGORIES).toContain(d.suggestedCategory);
  });

  it('is deterministic', () => {
    expect(fallbackDigest({ text: TECH })).toEqual(fallbackDigest({ text: TECH }));
  });

  it('detects the dominant category', () => {
    expect(fallbackDigest({ text: TECH }).suggestedCategory).toBe('Technology');
    expect(fallbackDigest({ text: BUSINESS }).suggestedCategory).toBe('Business');
  });

  it('emits lowercase tags only', () => {
    for (const tag of fallbackDigest({ text: TECH }).tags) {
      expect(tag).toBe(tag.toLowerCase());
    }
  });
});
