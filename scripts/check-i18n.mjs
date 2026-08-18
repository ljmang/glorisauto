import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const localeDir = path.join(scriptDir, '..', 'src', 'i18n', 'locales');
const sourceLocale = 'en';

function loadLocale(locale) {
  const filePath = path.join(localeDir, `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectLeafPaths(value, prefix = '', output = new Set()) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      collectLeafPaths(child, prefix ? `${prefix}.${key}` : key, output);
    }
    return output;
  }

  output.add(prefix);
  return output;
}

const sourceKeys = collectLeafPaths(loadLocale(sourceLocale));
const localeFiles = fs
  .readdirSync(localeDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

let hasError = false;
for (const file of localeFiles) {
  const locale = path.basename(file, '.json');
  if (locale === sourceLocale) continue;

  const keys = collectLeafPaths(loadLocale(locale));
  const missing = [...sourceKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !sourceKeys.has(key));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`[i18n] ${locale}: missing=${missing.length} extra=${extra.length}`);
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
    if (extra.length) console.error(`  extra: ${extra.join(', ')}`);
  } else {
    console.log(`[i18n] ${locale}: ${keys.size} keys OK`);
  }
}

if (hasError) process.exit(1);
console.log(`[i18n] all locales match ${sourceLocale}.json`);
