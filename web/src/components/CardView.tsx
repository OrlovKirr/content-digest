import type { Card } from '../board/types';
import { CategoryBadge } from './CategoryBadge';

export function CardView({ card }: { card: Card }) {
  const { title, url, digest } = card;
  return (
    <article className="card">
      <div className="card-header">
        <strong className="card-title">{title}</strong>
        <CategoryBadge category={digest.suggestedCategory} />
      </div>
      {url.length > 0 && (
        <a href={url} target="_blank" rel="noreferrer" className="card-url">
          {url}
        </a>
      )}
      <p className="card-summary">{digest.summary}</p>
      {digest.keyPoints.length > 0 && (
        <ul className="card-points">
          {digest.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}
      {digest.tags.length > 0 && (
        <div className="card-tags">
          {digest.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
