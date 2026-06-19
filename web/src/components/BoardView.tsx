import type { Card } from '../board/types';
import { sectionsFromCards } from '../board/group';
import { CardView } from './CardView';

interface Props {
  cards: Card[];
}

export function BoardView({ cards }: Props) {
  const sections = sectionsFromCards(cards);

  if (sections.length === 0) {
    return (
      <p className="state-message">
        No cards yet — paste an article above to start your board.
      </p>
    );
  }

  return (
    <section>
      {sections.map((section) => (
        <div key={section.category} className="board-section">
          <div className="section-header">
            <h2 className="section-title">{section.category}</h2>
            <span className="section-count">{section.cards.length}</span>
          </div>
          <div className="card-grid">
            {section.cards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
