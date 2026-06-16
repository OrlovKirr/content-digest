import { Hono } from 'hono';
import { extractArticle } from './extract';
import type { DigesterSelection } from './digest';

/** Build the Hono app around an injected digester (so it's testable). */
export function createApp(deps: DigesterSelection) {
  const app = new Hono();

  app.get('/api/health', (c) => c.json({ ok: true, claude: deps.usingClaude }));

  app.post('/api/digest', async (c) => {
    let body: { url?: unknown; text?: unknown };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'invalid JSON body' }, 400);
    }

    const url = typeof body.url === 'string' ? body.url.trim() : '';
    let text = typeof body.text === 'string' ? body.text.trim() : '';
    let title: string | undefined;

    if (text.length === 0) {
      if (url.length === 0) {
        return c.json({ error: 'provide a non-empty "url" or "text"' }, 400);
      }
      try {
        const extracted = await extractArticle(url);
        text = extracted.text;
        title = extracted.title;
      } catch (err) {
        return c.json(
          { error: err instanceof Error ? err.message : 'article extraction failed' },
          502,
        );
      }
    }

    try {
      const digest = await deps.digester({ text, title });
      return c.json(digest);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : 'digest failed' }, 500);
    }
  });

  return app;
}
