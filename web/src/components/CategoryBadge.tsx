import type { CSSProperties } from 'react';
import type { Category } from '../digest/types';

const COLORS: Record<Category, string> = {
  Technology: '#2d6cdf',
  Business: '#0a8754',
  Science: '#7b4fc0',
  Health: '#c0392b',
  Culture: '#d97706',
  Other: '#6b7280',
};

export function CategoryBadge({ category }: { category: Category }) {
  const style: CSSProperties = {
    display: 'inline-block',
    padding: '0.1rem 0.5rem',
    borderRadius: 999,
    background: COLORS[category],
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
  };
  return <span style={style}>{category}</span>;
}
