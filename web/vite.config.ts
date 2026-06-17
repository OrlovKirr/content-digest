import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
//
// Distinct ports from the legacy app/ (5173/4173) so both frontends can run
// side-by-side during the ADR 004 migration. When app/ is removed at the deploy
// step, web/ takes the canonical 5173/4173. `/api` proxies to the FastAPI api/
// dev server on :8788 (PLAN step 4); on Vercel both are served from one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    open: false,
    proxy: { '/api': 'http://127.0.0.1:8788' },
  },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
