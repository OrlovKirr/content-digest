import type { Category } from '../digest/types';

const COLORS: Record<Category, string> = {
  Technology: '#0071e3',
  Business:   '#28cd41',
  Science:    '#bf5af2',
  Health:     '#ff375f',
  Culture:    '#ff9f0a',
  Other:      '#8e8e93',
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="badge" style={{ color: COLORS[category] }}>
      {category}
    </span>
  );
}
