import { describe, it, expect, vi, afterEach } from 'vitest';
import { httpDigest } from './httpDigester';
import type { Digest } from './types';

const digest: Digest = {
  summary: 's',
  keyPoints: ['k'],
  tags: ['t'],
  suggestedCategory: 'Technology',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('httpDigest', () => {
  it('returns the backend digest on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(digest), { status: 200 })),
    );
    const result = await httpDigest({ url: '', text: 'Modern software and ai and code.' });
    expect(result).toEqual(digest);
  });

  it('falls back to the local mock when the backend fails but text is present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    );
    const result = await httpDigest({ url: '', text: 'Modern software relies on ai and code and data.' });
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.tags.length).toBeGreaterThanOrEqual(1);
  });

  it('throws when the backend fails and there is no text to fall back on', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );
    await expect(httpDigest({ url: 'https://example.com/a', text: '' })).rejects.toThrow();
  });
});
