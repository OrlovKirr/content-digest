import { useEffect, useState } from 'react';
import { createMockDigester } from './digest/mockDigester';
import type { Card } from './board/types';
import { loadBoard, saveBoard } from './board/storage';
import { deriveTitle } from './board/title';
import { DigestForm } from './components/DigestForm';
import { BoardView } from './components/BoardView';

// Feature 002/003 run on the deterministic mock; Feature 004 swaps in an
// HTTP-backed Digester (real fetch + Claude) behind this same interface.
const digester = createMockDigester();

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [cards, setCards] = useState<Card[]>(() => loadBoard());

  useEffect(() => {
    saveBoard(cards);
  }, [cards]);

  async function handleSubmit(input: { url: string; text: string }) {
    const digest = await digester.digest({ text: input.text, title: input.url || undefined });
    const card: Card = {
      id: newId(),
      url: input.url.trim(),
      title: deriveTitle({ url: input.url, text: input.text }),
      digest,
      createdAt: Date.now(),
    };
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
      <BoardView cards={cards} onClear={() => setCards([])} />
    </main>
  );
}
