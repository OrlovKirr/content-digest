import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Card } from './board/types';
import { getCards, postDigest } from './lib/api';
import { DigestForm } from './components/DigestForm';
import { BoardView } from './components/BoardView';

const noticeStyle: CSSProperties = {
  margin: '0 0 1.5rem',
  padding: '0.6rem 0.8rem',
  borderRadius: 8,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#b91c1c',
  fontSize: '0.9rem',
};

export default function App() {
  // The board is server-backed (PLAN step 4): it loads from GET /api/cards and
  // grows when POST /api/digest returns a new card. Persistence is in-memory in
  // the API for now (issue #8 swaps in Postgres behind the same endpoints).
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCards()
      .then((loaded) => active && setCards(loaded))
      .catch((err: unknown) => active && setLoadError(err instanceof Error ? err.message : 'Could not load the board.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(input: { url: string; text: string }) {
    // Errors propagate to DigestForm, which shows them inline next to the form.
    const card = await postDigest(input);
    setCards((prev) => [card, ...prev]);
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
      {loadError !== null && <p style={noticeStyle}>{loadError}</p>}
      {loading ? <p style={{ color: '#888' }}>Loading board…</p> : <BoardView cards={cards} />}
    </main>
  );
}
