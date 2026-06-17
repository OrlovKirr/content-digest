import type { CSSProperties } from 'react';
import type { Card } from '../board/types';
import { CategoryBadge } from './CategoryBadge';

const cardStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '1rem',
  background: '#fff',
  color: '#111827',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  display: 'grid',
  gap: '0.5rem',
};

const tagStyle: CSSProperties = {
  fontSize: '0.75rem',
  background: '#f1f5f9',
  color: '#334155',
  borderRadius: 6,
  padding: '0.1rem 0.4rem',
};

export function CardView({ card }: { card: Card }) {
  const { title, url, digest } = card;
  return (
    <article style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <strong style={{ lineHeight: 1.3 }}>{title}</strong>
        <CategoryBadge category={digest.suggestedCategory} />
      </div>
      {url.length > 0 && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '0.8rem', color: '#2d6cdf', wordBreak: 'break-all' }}
        >
          {url}
        </a>
      )}
      <p style={{ margin: 0, color: '#374151' }}>{digest.summary}</p>
      {digest.keyPoints.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#4b5563' }}>
          {digest.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      )}
      {digest.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {digest.tags.map((tag) => (
            <span key={tag} style={tagStyle}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
