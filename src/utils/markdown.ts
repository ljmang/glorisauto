/**
 * 与 insights [slug].astro 一致的 Markdown 处理（unified + remark/rehype）
 * 供品牌故事、洞察文章等页面复用
 */

import { sanitizeMediaAltText } from './strapiApi';

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeRenderedImageAlts(html: string, fallbackAlt?: string): string {
  const fallback = sanitizeMediaAltText(fallbackAlt);

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (/\salt\s*=/i.test(tag)) {
      return tag.replace(/\salt=(["'])(.*?)\1/i, (_match, quote: string, alt: string) => {
        const cleanAlt = sanitizeMediaAltText(alt) || fallback;
        return ` alt=${quote}${escapeHtmlAttribute(cleanAlt)}${quote}`;
      });
    }

    if (!fallback) return tag;
    return tag.replace(/<img\b/i, `<img alt="${escapeHtmlAttribute(fallback)}"`);
  });
}

function wrapRenderedTables(html: string): string {
  return html
    .replace(/<table\b/gi, '<div class="article-table-scroll"><table')
    .replace(/<\/table>/gi, '</table></div>');
}

/** 将 markdown 转为 HTML，使用与 Astro 一致的 remark/rehype 管道 */
export async function markdownToHtml(
  markdown: string | null | undefined,
  fallbackImageAlt?: string
): Promise<string> {
  if (!markdown) return '';
  const { unified } = await import('unified');
  const { default: remarkParse } = await import('remark-parse');
  const { default: remarkRehype } = await import('remark-rehype');
  const { default: rehypeStringify } = await import('rehype-stringify');
  const { default: remarkGfm } = await import('remark-gfm');
  const { default: rehypeSlug } = await import('rehype-slug');

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);

  return wrapRenderedTables(sanitizeRenderedImageAlts(String(result), fallbackImageAlt));
}

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** 从渲染后的 HTML 中提取 h2/h3 作为目录 */
export function extractTOCFromHtml(html: string): TOCItem[] {
  const tocItems: TOCItem[] = [];
  const headingRegex = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gis;

  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (id && text) tocItems.push({ id, text, level });
  }

  return tocItems;
}

/** 渲染 markdown 并返回 HTML + 目录（供 insights [slug].astro 使用） */
export async function renderMarkdownWithTOC(
  markdown: string | null | undefined,
  fallbackImageAlt?: string
): Promise<{ html: string; toc: TOCItem[] }> {
  const html = await markdownToHtml(markdown, fallbackImageAlt);
  const toc = extractTOCFromHtml(html);
  return { html, toc };
}
