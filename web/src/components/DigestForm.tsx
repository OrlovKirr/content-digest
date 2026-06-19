import { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
  /** Resolves when the card is created; rejects (with a readable message) on failure. */
  onSubmit: (input: { url: string; text: string }) => Promise<void>;
}

export function DigestForm({ onSubmit }: Props) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (url.trim().length === 0 && text.trim().length === 0) {
      setError('Paste an article URL or the article text to get started.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ url, text });
      setUrl('');
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Digesting failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="digest-form">
      <input
        type="url"
        placeholder="Paste an article URL…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={submitting}
        className="form-field form-field-url"
      />
      <div className="form-divider">or</div>
      <textarea
        placeholder="Paste article text directly…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        disabled={submitting}
        className="form-field form-field-text"
      />
      <div className="form-footer">
        <span className="form-error">{error}</span>
        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? 'Processing…' : 'Digest'}
        </button>
      </div>
    </form>
  );
}
