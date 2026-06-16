import type { Digest } from './schema';
import { CATEGORIES } from './schema';

/** Clamp/normalize a (schema-valid) digest to the contract the frontend expects. */
export function normalizeDigest(raw: Digest): Digest {
  const summary = raw.summary.trim();
  const keyPoints = raw.keyPoints.map((s) => s.trim()).filter((s) => s.length > 0).slice(0, 5);
  const tags = [
    ...new Set(raw.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)),
  ].slice(0, 5);
  const suggestedCategory = (CATEGORIES as readonly string[]).includes(raw.suggestedCategory)
    ? raw.suggestedCategory
    : 'Other';
  return {
    summary,
    keyPoints: keyPoints.length > 0 ? keyPoints : [summary],
    tags: tags.length > 0 ? tags : ['untagged'],
    suggestedCategory,
  };
}
