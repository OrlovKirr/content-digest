import type { CSSProperties } from 'react';
import type { Card } from '../board/types';
import { sectionsFromCards } from '../board/group';
import { CardView } from './CardView';

interface Props {
  cards: Card[];
  onClear: () => void;
}

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '1rem',
};

export function BoardView({ cards, onClear }: Props) {
  const sections = sectionsFromCards(cards);

  if (cards.length === 0) {
    return (
      <p style={{ color: '#888' }}>
        No cards yet — paste an article above and digest it to start your board.
      </p>
    );
  }

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: '0.5rem 0' }}>Board</h2>
        <button
          onClick={onClear}
          style={{
            font: 'inherit',
            fontSize: '0.85rem',
            color: '#c0392b',
            background: 'none',
            border: '1px solid #e2b8b3',
            borderRadius: 8,
            padding: '0.3rem 0.7rem',
            cursor: 'pointer',
          }}
        >
          Clear board
        </button>
      </div>
      {sections.map((section) => (
        <div key={section.category} style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>
            {section.category}{' '}
            <span style={{ color: '#9ca3af', fontWeight: 400 }}>({section.cards.length})</span>
          </h3>
          <div style={grid}>
            {section.cards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
