import { describe, it, expect } from 'vitest';
import { deriveTitle } from './title';

describe('deriveTitle', () => {
  it('builds a title from a URL slug', () => {
    expect(deriveTitle({ url: 'https://example.com/blog/the-future-of-ai', text: 'x' })).toBe(
      'The future of ai',
    );
  });

  it('strips a file extension from the slug', () => {
    expect(deriveTitle({ url: 'https://example.com/posts/hello-world.html', text: 'x' })).toBe(
      'Hello world',
    );
  });

  it('falls back to the hostname when there is no path slug', () => {
    expect(deriveTitle({ url: 'https://www.example.com/', text: 'x' })).toBe('example.com');
  });

  it('falls back to the first sentence when the URL is missing or invalid', () => {
    expect(deriveTitle({ text: 'A short opening line. More text follows.' })).toBe(
      'A short opening line.',
    );
    expect(deriveTitle({ url: 'not a url', text: 'A short opening line. More.' })).toBe(
      'A short opening line.',
    );
  });

  it('truncates very long first sentences', () => {
    const long = 'word '.repeat(40).trim() + '.';
    const title = deriveTitle({ text: long });
    expect(title.length).toBeLessThanOrEqual(81);
    expect(title.endsWith('…')).toBe(true);
  });

  it('returns Untitled for empty text and no url', () => {
    expect(deriveTitle({ text: '   ' })).toBe('Untitled');
  });
});
