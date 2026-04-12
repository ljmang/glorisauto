const PLACEHOLDER_VALUES = new Set([
  '',
  '-',
  '--',
  'n/a',
  'na',
  'none',
  'null',
  'undefined',
  '缺失',
  '暂无',
  '待补充',
]);

function replaceFullWidthPunctuation(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/，/g, ', ')
    .replace(/；/g, '; ')
    .replace(/：/g, ': ')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/【/g, '[')
    .replace(/】/g, ']');
}

function compactInlineWhitespace(value: string): string {
  return value
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,;!?])/g, '$1')
    .replace(/\s+:/g, ':')
    .replace(/[ \t]+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

export function sanitizeInlineText(value?: string | null): string {
  const normalized = compactInlineWhitespace(replaceFullWidthPunctuation(value ?? ''));
  if (!normalized) return '';

  const comparison = normalized.toLowerCase();
  return PLACEHOLDER_VALUES.has(comparison) ? '' : normalized;
}

export function hasMeaningfulText(value?: string | null): boolean {
  return sanitizeInlineText(value) !== '';
}

export function sanitizeMarkdown(value?: string | null): string {
  if (!value) return '';

  const normalized = value
    .split('\n')
    .map((line) =>
      compactInlineWhitespace(replaceFullWidthPunctuation(line))
        .replace(/\*\*([^*\n]+?)\s+\*\*/g, '**$1**')
        .replace(/__([^_\n]+?)\s+__/g, '__$1__')
    )
    .join('\n')
    .trim();

  return normalized;
}
