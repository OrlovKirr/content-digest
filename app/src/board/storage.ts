import { CATEGORIES } from '../digest/types';
import type { Card } from './types';

const STORAGE_KEY = 'content-digest.board.v1';

export function serializeBoard(cards: Card[]): string {
  return JSON.stringify(cards);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isCard(value: unknown): value is Card {
  if (typeof value !== 'object' || value === null) return false;
  const card = value as Record<string, unknown>;
  const digest = card.digest;
  if (typeof digest !== 'object' || digest === null) return false;
  const d = digest as Record<string, unknown>;
  return (
    typeof card.id === 'string' &&
    typeof card.url === 'string' &&
    typeof card.title === 'string' &&
    typeof card.createdAt === 'number' &&
    typeof d.summary === 'string' &&
    isStringArray(d.keyPoints) &&
    isStringArray(d.tags) &&
    typeof d.suggestedCategory === 'string' &&
    (CATEGORIES as readonly string[]).includes(d.suggestedCategory)
  );
}

/** Parse and validate; tolerant of malformed or stale payloads (returns []). */
export function deserializeBoard(raw: string): Card[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isCard);
}

export function loadBoard(): Card[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? deserializeBoard(raw) : [];
}

export function saveBoard(cards: Card[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, serializeBoard(cards));
}
