import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Pure-module specs only (node env). A DOM-testing layer would be added via an
// ADR when a real need appears — see CLAUDE.md working agreement #5.
export default defineConfig({
  test: { environment: 'node' },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
