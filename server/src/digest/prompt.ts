import { CATEGORIES } from './schema';
import type { DigestInput } from './schema';

export function buildSystemPrompt(): string {
  return [
    'You are a precise content-digest assistant.',
    'Given an article, produce: a 1-3 sentence summary; up to 5 concise key points;',
    'up to 5 lowercase keyword tags; and the single best-fit category.',
    `The category MUST be exactly one of: ${CATEGORIES.join(', ')}.`,
    'Tags must be lowercase, with no leading hashtag.',
    'Base everything only on the provided article — do not invent facts.',
  ].join(' ');
}

export function buildUserContent(input: DigestInput): string {
  const title = input.title?.trim();
  const header = title ? `Title: ${title}\n\n` : '';
  return `${header}Article:\n${input.text.trim()}`;
}
