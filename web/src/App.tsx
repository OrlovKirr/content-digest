import { useState } from 'react';
import type { CSSProperties } from 'react';
import { PLACEHOLDER_CARDS } from './board/placeholders';
import { DigestForm } from './components/DigestForm';
import { BoardView } from './components/BoardView';

const noticeStyle: CSSProperties = {
  margin: '0 0 1.5rem',
  padding: '0.6rem 0.8rem',
  borderRadius: 8,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1e40af',
  fontSize: '0.9rem',
};

export default function App() {
  // No API and no client storage yet (PLAN step 1). The board renders static
  // placeholder cards; submitting the form shows where digesting will plug in.
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit() {
    setNotice('Digesting isn’t wired up yet — the digest API arrives in step 2. For now the board shows placeholder cards.');
  }

  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 1100, margin: '0 auto', padding: '2rem' }}>
      <header>
        <h1 style={{ marginBottom: '0.25rem' }}>Content Digest</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>
          Paste an article, get a summary, key points, tags and a suggested category — filed onto
          the board by topic.
        </p>
      </header>
      <DigestForm onSubmit={handleSubmit} />
      {notice !== null && <p style={noticeStyle}>{notice}</p>}
      <BoardView cards={PLACEHOLDER_CARDS} />
    </main>
  );
}
