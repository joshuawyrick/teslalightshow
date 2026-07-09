import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerenderHeads } from './scripts/prerender-heads.mjs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'prerender-heads',
      apply: 'build',
      closeBundle() {
        prerenderHeads();
      },
    },
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
