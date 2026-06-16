import { describe, it, expect } from 'vitest';
import { mockDigest, createMockDigester } from './mockDigester';
import { CATEGORIES } from './types';

const TECH = `Modern software relies on clever ai. New tools help engineers write code faster. The data and the algorithm behind every app keep improving.`;

const BUSINESS = `The startup raised funding to grow revenue. Investors and the market liked the company. Customer growth and profit are the business goals.`;

const NEUTRAL = `A quiet ordinary plain afternoon passed slowly outside the window.`;

describe('mockDigest', () => {
  it('returns a structured digest from article text', () => {
    const d = mockDigest({ text: TECH });
    expect(d.summary.length).toBeGreaterThan(0);
    expect(d.keyPoints.length).toBeGreaterThanOrEqual(1);
    expect(d.keyPoints.length).toBeLessThanOrEqual(5);
    expect(d.tags.length).toBeGreaterThanOrEqual(1);
    expect(d.tags.length).toBeLessThanOrEqual(5);
    expect(CATEGORIES).toContain(d.suggestedCategory);
  });

  it('is deterministic for identical input', () => {
    expect(mockDigest({ text: TECH })).toEqual(mockDigest({ text: TECH }));
  });

  it('suggests a category from the dominant vocabulary', () => {
    expect(mockDigest({ text: TECH }).suggestedCategory).toBe('Technology');
    expect(mockDigest({ text: BUSINESS }).suggestedCategory).toBe('Business');
  });

  it('falls back to Other when there is no category signal', () => {
    expect(mockDigest({ text: NEUTRAL }).suggestedCategory).toBe('Other');
  });

  it('lowercases tags and never emits stop-words', () => {
    const d = mockDigest({ text: TECH });
    for (const tag of d.tags) {
      expect(tag).toBe(tag.toLowerCase());
    }
    expect(d.tags).not.toContain('the');
    expect(d.tags).not.toContain('and');
  });

  it('throws on empty / whitespace-only text', () => {
    expect(() => mockDigest({ text: '   ' })).toThrow();
  });
});

describe('createMockDigester', () => {
  it('implements the async Digester interface', async () => {
    const digester = createMockDigester();
    const d = await digester.digest({ text: TECH });
    expect(d.suggestedCategory).toBe('Technology');
  });
});
