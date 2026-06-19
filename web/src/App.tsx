import { useEffect, useState } from 'react';
import type { Card } from './board/types';
import { getCards, postDigest } from './lib/api';
import { DigestForm } from './components/DigestForm';
import { BoardView } from './components/BoardView';

export default function App() {
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
    const card = await postDigest(input);
    setCards((prev) => [card, ...prev]);
  }

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <span className="app-nav-brand">Content Digest</span>
      </nav>
      <header className="hero">
        <p className="hero-eyebrow">AI-Powered Reading</p>
        <h1 className="hero-title">
          Every article,<br />distilled.
        </h1>
        <p className="hero-subtitle">
          Paste a URL or article text — get a summary, key points, and tags, filed by topic.
        </p>
      </header>
      <DigestForm onSubmit={handleSubmit} />
      {loadError !== null && <p className="load-error">{loadError}</p>}
      {loading ? (
        <p className="state-message">Loading your board…</p>
      ) : (
        <BoardView cards={cards} />
      )}
    </div>
  );
}
