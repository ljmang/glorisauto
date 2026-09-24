import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist/en');
if (!fs.existsSync(root)) {
  console.error(`English page directory not found: ${root}`);
  console.error('Build the site first, then run: node scripts/audit-en-pages.mjs [dist/en]');
  process.exit(2);
}

const htmlFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.isFile() && filePath.endsWith('.html')) htmlFiles.push(filePath);
  }
}
walk(root);

const approvedHanTerms = new Set(['鹦鹉']);
const checks = [
  { pattern: /country\/regionl/i, message: 'Possible typo: Country/Regionl' },
  { pattern: /0\.\.\d/, message: 'Check malformed decimal notation' },
  { pattern: /(?:,|，)\s*鹦鹉(?:®)?\s*\(?in english/i, message: 'Remove translator-style brand note from English copy' },
  { pattern: /start the partnership\s+launch your distribution plan/i, message: 'Possible duplicated heading/body copy' },
  { pattern: /\bsand paper\b/i, message: 'Review against the preferred term “sandpaper”' },
  { pattern: /\b(?:analyse|analysed|personalised|enquiries|enquiry|colour|centre|programme)\b/i, message: 'Review against the en-US spelling standard' },
];

function visibleMainText(html) {
  return html
    .replace(/<(script|style|header|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

const findings = [];
for (const filePath of htmlFiles) {
  const text = visibleMainText(fs.readFileSync(filePath, 'utf8'));
  const page = `/${path.relative(root, filePath).replaceAll(path.sep, '/')}`;

  for (const run of text.match(/\p{Script=Han}+/gu) ?? []) {
    if (!approvedHanTerms.has(run)) {
      findings.push({ page, issue: `Untranslated Chinese text: ${run}` });
    }
  }

  for (const check of checks) {
    if (check.pattern.test(text)) findings.push({ page, issue: check.message });
  }
}

if (findings.length) {
  console.error(`English copy audit found ${findings.length} item(s) across ${htmlFiles.length} page(s):`);
  for (const finding of findings) console.error(`- ${finding.page}: ${finding.issue}`);
  process.exit(1);
}

console.log(`English copy audit passed: ${htmlFiles.length} generated page(s), no configured issues found.`);
