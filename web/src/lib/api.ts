import type { Card } from '../board/types';
import type { Category } from '../digest/types';
import { CATEGORIES } from '../digest/types';

/**
 * The single boundary between the browser and `/api` (PLAN step 4, issue #9).
 *
 * Owns the wire-format (snake_case, per ADR 004) ↔ domain-type (camelCase)
 * mapping and turns transport/HTTP failures into human-readable Errors the UI
 * can show. The card shape mirrors the Postgres columns planned in #8, so when
 * #8 swaps the in-memory store for Postgres nothing here has to change.
 */

/** A card exactly as `/api` returns it (snake_case; `created_at` is ISO 8601). */
export interface WireCard {
  id: string;
  url: string;
  title: string;
  summary: string;
  key_points: string[];
  tags: string[];
  category: string;
  created_at: string;
}

function toCategory(value: string): Category {
  return (CATEGORIES as readonly string[]).includes(value) ? (value as Category) : 'Other';
}

/** Pure: map a wire card to the frontend's camelCase `Card`. */
export function cardFromWire(raw: WireCard): Card {
  return {
    id: raw.id,
    url: raw.url,
    title: raw.title,
    createdAt: Date.parse(raw.created_at),
    digest: {
      summary: raw.summary,
      keyPoints: raw.key_points,
      tags: raw.tags,
      suggestedCategory: toCategory(raw.category),
    },
  };
}

/** Read the server's `{ error }` message, or fall back to the status code. */
async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string' && body.error.trim().length > 0) {
      return body.error;
    }
  } catch {
    // non-JSON body — fall through to the status code
  }
  return `The server responded ${response.status}.`;
}

/** Run a fetch, mapping a network failure to a friendly Error. */
async function request(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error('We couldn’t reach the server. Check that the API is running and try again.');
  }
}

/** Submit a URL or text to be digested; returns the created card. */
export async function postDigest(input: { url: string; text: string }): Promise<Card> {
  const url = input.url.trim();
  const text = input.text.trim();
  const payload: { url?: string; text?: string } = {};
  if (url.length > 0) payload.url = url;
  if (text.length > 0) payload.text = text;

  const response = await request('/api/digest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  return cardFromWire((await response.json()) as WireCard);
}

/** Load every board card, newest first (ordering comes from the server). */
export async function getCards(): Promise<Card[]> {
  const response = await request('/api/cards');
  if (!response.ok) throw new Error(await errorMessage(response));
  const wire = (await response.json()) as WireCard[];
  return wire.map(cardFromWire);
}
