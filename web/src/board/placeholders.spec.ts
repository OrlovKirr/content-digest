import { describe, it, expect } from 'vitest';
import { PLACEHOLDER_CARDS } from './placeholders';
import { sectionsFromCards } from './group';
import { CATEGORIES } from '../digest/types';

describe('PLACEHOLDER_CARDS', () => {
  it('are all well-formed cards', () => {
    for (const card of PLACEHOLDER_CARDS) {
      expect(card.id.length).toBeGreaterThan(0);
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.digest.summary.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(card.digest.suggestedCategory);
    }
  });

  it('have unique ids', () => {
    const ids = PLACEHOLDER_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('span at least three categories so the board shows multiple sections', () => {
    const categories = new Set(PLACEHOLDER_CARDS.map((c) => c.digest.suggestedCategory));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it('group into non-empty sections in taxonomy order', () => {
    const sections = sectionsFromCards(PLACEHOLDER_CARDS);
    expect(sections.length).toBeGreaterThan(0);
    for (const section of sections) {
      expect(section.cards.length).toBeGreaterThan(0);
    }
    const order = sections.map((s) => CATEGORIES.indexOf(s.category));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
