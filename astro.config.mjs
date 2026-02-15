// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
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
    // 允许优化的远程图片域名
    domains: ['assets.glorisauto.com'],
    // 远程图片配置
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.glorisauto.com',
      },
    ],
  },
});