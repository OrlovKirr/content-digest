import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

interface Props {
  onSubmit: (input: { url: string; text: string }) => void;
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

export function DigestForm({ onSubmit }: Props) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (url.trim().length === 0 && text.trim().length === 0) {
      setError('Paste an article URL or the article text.');
      return;
    }
    setError(null);
    onSubmit({ url, text });
    setUrl('');
    setText('');
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.6rem', margin: '1.5rem 0' }}>
      <input
        type="url"
        placeholder="https://example.com/article  (the server will fetch & extract it)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={field}
      />
      <textarea
        placeholder="…or paste the article text directly"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{ ...field, resize: 'vertical' }}
      />
      {error !== null && <span style={{ color: '#c0392b' }}>{error}</span>}
      <button type="submit" style={button}>
        Digest &amp; add to board
      </button>
    </form>
  );
}
