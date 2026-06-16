import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { DigestSchema } from './schema';
import type { Digest, DigestInput } from './schema';
import { buildSystemPrompt, buildUserContent } from './prompt';
import { normalizeDigest } from './normalize';

/** User-chosen model (ADR 003). Swap here to change models. */
export const DIGEST_MODEL = 'claude-opus-4-8';

/** Build a Digester backed by Claude structured output. */
export function createClaudeDigester(client: Anthropic) {
  const system = buildSystemPrompt();
  return async (input: DigestInput): Promise<Digest> => {
    const response = await client.messages.parse({
      model: DIGEST_MODEL,
      max_tokens: 2048,
      system,
      output_config: {
        format: zodOutputFormat(DigestSchema),
        effort: 'medium',
      },
      messages: [{ role: 'user', content: buildUserContent(input) }],
    });
    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error('digest: model returned no structured output');
    }
    return normalizeDigest(parsed);
  };
}
