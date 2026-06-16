import { sanitizeInlineText } from './contentSanitizers';
import { toHref } from './navigationData';
import type { HelpCenterAttributes } from '@/types/content';

export interface HelpSearchItem {
  title: string;
  description: string;
  content: string;
  href: string;
  categoryName: string;
}

function stripMarkdown(value?: string | null): string {
  if (!value) return '';

  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~|[\]()-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactContent(parts: Array<string | null | undefined>, maxLength = 700): string {
  const text = parts
    .map((part) => sanitizeInlineText(stripMarkdown(part)))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function buildHelpSearchItems(
  articles: HelpCenterAttributes[],
  locale: string
): HelpSearchItem[] {
  return articles
    .map((article) => {
      const title = sanitizeInlineText(article.title);
      const slug = sanitizeInlineText(article.slug);
      const categorySlug = sanitizeInlineText(article.help_category?.slug) || 'uncategorized';
      const categoryName = sanitizeInlineText(article.help_category?.name);

      if (!title || !slug || !categorySlug) return null;

      return {
        title,
        description: sanitizeInlineText(article.description),
        content: compactContent([article.description, article.contentMarkdown, categoryName]),
        href: toHref(`/help/${categorySlug}/${slug}`, locale),
        categoryName,
      };
    })
    .filter((item): item is HelpSearchItem => item !== null);
}
