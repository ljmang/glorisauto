import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'node_modules/@fontsource/noto-sans/files');
const dest = path.join(root, 'public/fonts');
const files = [
  'noto-sans-latin-300-normal.woff2',
  'noto-sans-latin-400-normal.woff2',
  'noto-sans-latin-600-normal.woff2',
];

fs.mkdirSync(dest, { recursive: true });
for (const f of files) {
  const srcPath = path.join(src, f);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(dest, f));
    console.log('Copied', f);
  }
}
