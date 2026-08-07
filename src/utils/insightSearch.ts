import { sanitizeInlineText } from './contentSanitizers';
import { extractMarkdownHeadings, stripMarkdown } from './helpContent';
import { toHref } from './navigationData';
import type { InsightAttributes } from '@/types/content';

export interface InsightSearchItem {
  title: string;
  description: string;
  content: string;
  href: string;
  categoryName: string;
}

function compactContent(parts: Array<string | null | undefined>, maxLength = 2400): string {
  const text = parts
    .map((part) => sanitizeInlineText(stripMarkdown(part)))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function buildInsightSearchItems(
  insights: InsightAttributes[],
  locale: string
): InsightSearchItem[] {
  return insights
    .map((insight) => {
      const title = sanitizeInlineText(insight.title);
      const slug = sanitizeInlineText(insight.slug);
      const categorySlug = sanitizeInlineText(insight.insight_category?.slug);
      const categoryName = sanitizeInlineText(insight.insight_category?.name);
      const headings = extractMarkdownHeadings(insight.content);

      if (!title || !slug) return null;

      const href = categorySlug
        ? toHref(`/about/insights/${categorySlug}/${slug}`, locale)
        : toHref(`/about/insights/${slug}`, locale);

      return {
        title,
        description: sanitizeInlineText(insight.excerpt || insight.description),
        content: compactContent([
          insight.excerpt,
          insight.description,
          headings.join(' '),
          insight.content,
          categoryName,
        ]),
        href,
        categoryName,
      };
    })
    .filter((item): item is InsightSearchItem => item !== null);
}
