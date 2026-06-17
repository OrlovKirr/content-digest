import type { Category } from '../digest/types';
import { CATEGORIES } from '../digest/types';
import type { Card } from './types';

export interface Section {
  category: Category;
  cards: Card[];
}

/** Group cards into non-empty sections, in taxonomy order, newest card first. */
export function sectionsFromCards(cards: Card[]): Section[] {
  const byCategory = new Map<Category, Card[]>();
  for (const card of cards) {
    const list = byCategory.get(card.digest.suggestedCategory) ?? [];
    list.push(card);
    byCategory.set(card.digest.suggestedCategory, list);
  }
  const sections: Section[] = [];
  for (const category of CATEGORIES) {
    const list = byCategory.get(category);
    if (list && list.length > 0) {
      sections.push({
        category,
        cards: [...list].sort((a, b) => b.createdAt - a.createdAt),
      });
    }
  }
  return sections;
}
