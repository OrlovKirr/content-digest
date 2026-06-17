import { afterEach, describe, expect, it, vi } from 'vitest';
import { cardFromWire, getCards, postDigest } from './api';
import type { WireCard } from './api';

const WIRE: WireCard = {
  id: 'c1',
  url: 'https://example.com/a',
  title: 'A title',
  summary: 'A summary.',
  key_points: ['one', 'two'],
  tags: ['ai', 'data'],
  category: 'Technology',
  created_at: '2026-06-01T00:00:00+00:00',
};

function mockFetch(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    })) as unknown as typeof fetch,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('cardFromWire', () => {
  it('maps the snake_case wire shape to a camelCase Card', () => {
    const card = cardFromWire(WIRE);
    expect(card).toEqual({
      id: 'c1',
      url: 'https://example.com/a',
      title: 'A title',
      createdAt: Date.parse('2026-06-01T00:00:00+00:00'),
      digest: {
        summary: 'A summary.',
        keyPoints: ['one', 'two'],
        tags: ['ai', 'data'],
        suggestedCategory: 'Technology',
      },
    });
  });

  it('falls back to Other for a category outside the taxonomy', () => {
    expect(cardFromWire({ ...WIRE, category: 'Politics' }).digest.suggestedCategory).toBe('Other');
  });
});

describe('postDigest', () => {
  it('returns the created card on success', async () => {
    mockFetch(200, WIRE);
    const card = await postDigest({ url: 'https://example.com/a', text: '' });
    expect(card.id).toBe('c1');
    expect(card.digest.suggestedCategory).toBe('Technology');
  });

  it('sends only the non-empty fields', async () => {
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<unknown>>(
      async () => ({ ok: true, status: 200, json: async () => WIRE }),
    );
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
    await postDigest({ url: '  https://example.com/a  ', text: '   ' });
    const init = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ url: 'https://example.com/a' });
  });

  it('throws a readable error using the server message on a non-OK response', async () => {
    mockFetch(502, { error: 'could not fetch the article' });
    await expect(postDigest({ url: 'https://bad', text: '' })).rejects.toThrow(
      /could not fetch the article/i,
    );
  });

  it('throws a readable error when the network fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch,
    );
    await expect(postDigest({ url: '', text: 'hi' })).rejects.toThrow(/couldn’t reach|reach the server/i);
  });
});

describe('getCards', () => {
  it('maps a list of wire cards', async () => {
    mockFetch(200, [WIRE, { ...WIRE, id: 'c2' }]);
    const cards = await getCards();
    expect(cards.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('throws a readable error on a non-OK response', async () => {
    mockFetch(500, { error: 'boom' });
    await expect(getCards()).rejects.toThrow(/boom/i);
  });
});
