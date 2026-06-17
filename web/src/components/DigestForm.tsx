import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

interface Props {
  /** Resolves when the card is created; rejects (with a readable message) on failure. */
  onSubmit: (input: { url: string; text: string }) => Promise<void>;
}

const field: CSSProperties = {
  padding: '0.6rem 0.7rem',
  border: '1px solid #ccc',
  borderRadius: 8,
  font: 'inherit',
};

const button: CSSProperties = {
  padding: '0.6rem 1rem',
  border: 'none',
  borderRadius: 8,
  background: '#2d6cdf',
  color: '#fff',
  font: 'inherit',
  cursor: 'pointer',
  justifySelf: 'start',
};

const buttonBusy: CSSProperties = {
  ...button,
  background: '#93b4ec',
  cursor: 'progress',
};

export function DigestForm({ onSubmit }: Props) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (url.trim().length === 0 && text.trim().length === 0) {
      setError('Paste an article URL or the article text.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ url, text });
      // Clear only on success so a failed submit keeps the user's input.
      setUrl('');
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Digesting failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.6rem', margin: '1.5rem 0' }}>
      <input
        type="url"
        placeholder="https://example.com/article  (the server will fetch & extract it)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={submitting}
        style={field}
      />
      <textarea
        placeholder="…or paste the article text directly"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        disabled={submitting}
        style={{ ...field, resize: 'vertical' }}
      />
      {error !== null && <span style={{ color: '#c0392b' }}>{error}</span>}
      <button type="submit" disabled={submitting} style={submitting ? buttonBusy : button}>
        {submitting ? 'Digesting…' : 'Digest & add to board'}
      </button>
    </form>
  );
}
