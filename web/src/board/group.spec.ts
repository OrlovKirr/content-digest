import { describe, it, expect } from 'vitest';
import { sectionsFromCards } from './group';
import type { Card } from './types';
import type { Category } from '../digest/types';

function card(id: string, category: Category, createdAt: number): Card {
  return {
    id,
    url: '',
    title: id,
    createdAt,
    digest: { summary: 's', keyPoints: ['k'], tags: ['t'], suggestedCategory: category },
  };
}

describe('sectionsFromCards', () => {
  it('groups cards into sections by category in taxonomy order', () => {
    const sections = sectionsFromCards([
      card('b', 'Business', 1),
      card('t', 'Technology', 2),
      card('o', 'Other', 3),
    ]);
    expect(sections.map((s) => s.category)).toEqual(['Technology', 'Business', 'Other']);
  });

  it('omits empty categories', () => {
    const sections = sectionsFromCards([card('t', 'Technology', 1)]);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.category).toBe('Technology');
  });

  it('orders cards within a section newest first', () => {
    const sections = sectionsFromCards([
      card('old', 'Science', 100),
      card('new', 'Science', 200),
    ]);
    expect(sections[0]?.cards.map((c) => c.id)).toEqual(['new', 'old']);
  });

  it('returns no sections for an empty board', () => {
    expect(sectionsFromCards([])).toEqual([]);
  });
});
