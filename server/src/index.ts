import { serve } from '@hono/node-server';
import { createApp } from './server';
import { createDigester } from './digest';

// Load server/.env if present (Node built-in; no dependency). Safe if missing.
try {
  process.loadEnvFile();
} catch {
  // no .env file — run with the deterministic fallback
}

const port = Number(process.env.PORT ?? 8787);
const deps = createDigester();
const app = createApp(deps);

serve({ fetch: app.fetch, hostname: '127.0.0.1', port }, (info) => {
  const mode = deps.usingClaude ? 'Claude (claude-opus-4-8)' : 'deterministic fallback (no ANTHROPIC_API_KEY)';
  console.log(`[server] digest API on http://127.0.0.1:${info.port} — ${mode}`);
});
