import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerenderHeads, prerenderContent } from './scripts/prerender-heads.mjs';

function deferCssPlugin() {
  return {
    name: 'defer-css',
    apply: 'build' as const,
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        '<link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\'">' +
        '<noscript><link rel="stylesheet" href="$1"></noscript>'
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    deferCssPlugin(),
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
