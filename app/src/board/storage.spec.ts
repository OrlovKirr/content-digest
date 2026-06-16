import { describe, it, expect } from 'vitest';
import { serializeBoard, deserializeBoard } from './storage';
import type { Card } from './types';

const card: Card = {
  id: 'c1',
  url: 'https://example.com/a',
  title: 'A',
  createdAt: 123,
  digest: { summary: 's', keyPoints: ['k1', 'k2'], tags: ['x'], suggestedCategory: 'Technology' },
};

describe('board storage', () => {
  it('round-trips cards through serialize/deserialize', () => {
    expect(deserializeBoard(serializeBoard([card]))).toEqual([card]);
  });

  it('returns an empty board for malformed JSON', () => {
    expect(deserializeBoard('{not json')).toEqual([]);
  });

  it('returns an empty board for non-array JSON', () => {
    expect(deserializeBoard('{"foo":1}')).toEqual([]);
  });

  it('drops entries that are not valid cards', () => {
    const raw = JSON.stringify([card, { id: 'bad' }, { ...card, digest: { suggestedCategory: 'Nope' } }]);
    expect(deserializeBoard(raw)).toEqual([card]);
  });
});
