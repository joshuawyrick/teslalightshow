import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerenderHeads, prerenderContent } from './scripts/prerender-heads.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'prerender-heads',
      apply: 'build',
      async closeBundle() {
        if (process.env.SSG_BUILD === '1') return;
        prerenderHeads();
        await prerenderContent();
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
