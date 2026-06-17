import type { Card } from './types';

/**
 * Static sample cards used to populate the board shell before any API exists
 * (PLAN step 1). They are illustrative only — replaced by server-loaded cards
 * once persistence lands (PLAN step 3). Spread across categories so the board
 * renders multiple non-empty sections.
 */
export const PLACEHOLDER_CARDS: Card[] = [
  {
    id: 'placeholder-tech-1',
    url: 'https://example.com/articles/transformers-explained',
    title: 'Transformers explained',
    createdAt: 6,
    digest: {
      summary:
        'A gentle walk through the attention mechanism and why transformer models scaled so well across language tasks.',
      keyPoints: [
        'Self-attention relates every token to every other token',
        'Positional encodings restore word order',
        'Scaling parameters and data drove the recent leaps',
      ],
      tags: ['ai', 'transformers', 'nlp'],
      suggestedCategory: 'Technology',
    },
  },
  {
    id: 'placeholder-tech-2',
    url: '',
    title: 'Why local-first apps are back',
    createdAt: 5,
    digest: {
      summary:
        'Local-first software keeps data on the device and syncs in the background, trading server round-trips for resilience and speed.',
      keyPoints: ['Works offline by default', 'Sync is a background concern, not a blocker'],
      tags: ['local-first', 'sync', 'architecture'],
      suggestedCategory: 'Technology',
    },
  },
  {
    id: 'placeholder-business-1',
    url: 'https://example.com/news/subscription-fatigue',
    title: 'Subscription fatigue and what comes next',
    createdAt: 4,
    digest: {
      summary:
        'Consumers are trimming recurring spend, pushing companies toward bundles and usage-based pricing.',
      keyPoints: ['Churn rises as budgets tighten', 'Bundling re-emerges as a retention lever'],
      tags: ['pricing', 'saas', 'retention'],
      suggestedCategory: 'Business',
    },
  },
  {
    id: 'placeholder-science-1',
    url: 'https://example.com/research/webb-early-galaxies',
    title: 'Webb spots surprisingly mature early galaxies',
    createdAt: 3,
    digest: {
      summary:
        'New observations show galaxies forming earlier and more massively than models predicted, prompting fresh debate.',
      keyPoints: ['Mature galaxies appear sooner than expected', 'Models of early star formation may need revising'],
      tags: ['astronomy', 'jwst', 'cosmology'],
      suggestedCategory: 'Science',
    },
  },
  {
    id: 'placeholder-health-1',
    url: '',
    title: 'Sleep regularity beats sleep duration',
    createdAt: 2,
    digest: {
      summary:
        'A large cohort study suggests consistent sleep and wake times predict health outcomes better than total hours slept.',
      keyPoints: ['Regularity correlated with lower mortality risk', 'Consistency mattered more than raw duration'],
      tags: ['sleep', 'health', 'study'],
      suggestedCategory: 'Health',
    },
  },
  {
    id: 'placeholder-culture-1',
    url: 'https://example.com/culture/the-return-of-the-zine',
    title: 'The return of the zine',
    createdAt: 1,
    digest: {
      summary:
        'Print zines are finding a new audience as a deliberate, tactile counterpoint to algorithmic feeds.',
      keyPoints: ['Small-run print as a reaction to infinite scroll', 'Community and craft over reach'],
      tags: ['print', 'culture', 'media'],
      suggestedCategory: 'Culture',
    },
  },
];
