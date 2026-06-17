const MAX_TITLE = 80;

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function fromSlug(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const lastSegment = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
  const slug = decodeURIComponent(lastSegment)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (slug.length > 0) return capitalize(slug);
  return parsed.hostname.replace(/^www\./, '');
}

function firstSentence(text: string): string {
  const sentence = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)[0] ?? '';
  if (sentence.length > MAX_TITLE) {
    return sentence.slice(0, MAX_TITLE - 1).trimEnd() + '…';
  }
  return sentence;
}

/** A human-readable title from the URL slug, else the first sentence, else "Untitled". */
export function deriveTitle(input: { url?: string; text: string }): string {
  const url = input.url?.trim();
  if (url) {
    const fromUrl = fromSlug(url);
    if (fromUrl) return fromUrl;
  }
  return firstSentence(input.text) || 'Untitled';
}
