// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isPagesBuild =
  /^(1|true)$/i.test(process.env.CF_PAGES ?? '') ||
  process.env.BUILD_TARGET === 'pages';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.glorisauto.com',
  output: isPagesBuild ? 'static' : 'server',
  ...(isPagesBuild ? {} : { adapter: node({ mode: 'standalone' }) }),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
  image: {
    domains: ['assets.glorisauto.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.glorisauto.com',
      },
    ],
  },
});
