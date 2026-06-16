import Anthropic from '@anthropic-ai/sdk';
import type { Digest, DigestInput } from './schema';
import { createClaudeDigester } from './claude';
import { fallbackDigest } from './fallback';

export type Digester = (input: DigestInput) => Promise<Digest>;

export interface DigesterSelection {
  digester: Digester;
  usingClaude: boolean;
}

/** Use Claude when ANTHROPIC_API_KEY is set; otherwise the deterministic fallback. */
export function createDigester(): DigesterSelection {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (apiKey && apiKey.length > 0) {
    const claude = createClaudeDigester(new Anthropic({ apiKey }));
    return { digester: claude, usingClaude: true };
  }
  return { digester: (input) => Promise.resolve(fallbackDigest(input)), usingClaude: false };
}
