/** Shared helpers for making help articles easier to scan and discover. */

import { stripYoutubeShortcodes } from './youtubeEmbed';

export function stripMarkdown(value?: string | null): string {
  if (!value) return '';

  return stripYoutubeShortcodes(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|[\]()-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractMarkdownHeadings(markdown?: string | null): string[] {
  if (!markdown) return [];

  return markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^#{2,3}\s+(.+?)\s*#*$/)?.[1]?.trim() ?? '')
    .filter(Boolean);
}

export function estimateReadingMinutes(markdown?: string | null): number {
  const text = stripMarkdown(markdown);
  if (!text) return 1;

  const isCjk = /[\u3040-\u30ff\u3400-\u9fff]/.test(text);
  const readingUnits = isCjk ? text.length / 350 : text.split(/\s+/).length / 220;
  return Math.max(1, Math.ceil(readingUnits));
}
