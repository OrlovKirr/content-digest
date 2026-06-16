import type { Digest } from './types';
import { mockDigest } from './mockDigester';

export interface HttpDigestRequest {
  url: string;
  text: string;
}

/**
 * POST to the backend `/api/digest` (real fetch + Claude, per ADR 002/003).
 * If the backend is unreachable or errors and we have pasted text, fall back to
 * the local deterministic mock so the board stays usable standalone.
 */
export async function httpDigest(req: HttpDigestRequest): Promise<Digest> {
  const url = req.url.trim();
  const text = req.text.trim();
  const payload: { url?: string; text?: string } = {};
  if (url.length > 0) payload.url = url;
  if (text.length > 0) payload.text = text;

  try {
    const response = await fetch('/api/digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`digest API responded ${response.status}`);
    }
    return (await response.json()) as Digest;
  } catch (err) {
    if (text.length > 0) {
      return mockDigest({ text });
    }
    throw err instanceof Error ? err : new Error('digest failed');
  }
}
