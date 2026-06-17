import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
//
// Distinct ports from the legacy app/ (5173/4173) so both frontends can run
// side-by-side during the ADR 004 migration. When app/ is removed at the deploy
// step, web/ takes the canonical 5173/4173. No /api proxy yet — the digest API
// arrives in PLAN step 2.
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5174, strictPort: true, open: false },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
