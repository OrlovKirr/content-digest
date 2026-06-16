import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserContent } from './prompt';
import { CATEGORIES } from './schema';

describe('buildSystemPrompt', () => {
  it('names every category from the taxonomy', () => {
    const prompt = buildSystemPrompt();
    for (const category of CATEGORIES) {
      expect(prompt).toContain(category);
    }
  });
});

describe('buildUserContent', () => {
  it('includes the article text', () => {
    expect(buildUserContent({ text: 'Hello world' })).toContain('Hello world');
  });

  it('includes the title when provided', () => {
    const content = buildUserContent({ text: 'Body', title: 'My Title' });
    expect(content).toContain('My Title');
    expect(content).toContain('Body');
  });
});
