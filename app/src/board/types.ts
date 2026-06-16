import type { Digest } from '../digest/types';

export interface Card {
  id: string;
  /** Source article URL (may be empty until Feature 004 wires fetching). */
  url: string;
  title: string;
  digest: Digest;
  /** Epoch ms; used to order cards newest-first within a section. */
  createdAt: number;
}
