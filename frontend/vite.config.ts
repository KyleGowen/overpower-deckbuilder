import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Vite dev server proxies API + card image asset requests to the Express
// backend on :8085 so the SPA can run on :5173 during local development.
// The backend default port is 8085 (process.env.PORT || 8085).
const BACKEND = 'http://localhost:8085';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Bind 0.0.0.0 so other devices on the LAN can reach the dev SPA.
    // API traffic still proxies to localhost:8085 on this machine.
    host: true,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/health': { target: BACKEND, changeOrigin: true },
      // Card art + UI image assets are served by Express static middleware
      // in local dev (production uses S3/CloudFront via cdnBase).
      '/src/resources': { target: BACKEND, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
