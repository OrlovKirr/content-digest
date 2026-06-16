import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
    // Proxy the digest API to the backend (server/) so the frontend talks only to /api.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
