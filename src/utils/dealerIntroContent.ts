import type { BlockNode, ImageNode, LinkNode, ListItemNode, ListNode, TextNode } from '@/types/blocks';
import { sanitizeMarkdown } from './contentSanitizers';
import { markdownToHtml } from './markdown';
import { parseImage, sanitizeMediaAltText } from './strapiApi';

const MARKDOWN_HINT_PATTERN =
  /(^|\n)\s*(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+|```|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/m;
const BRACKET_CTA_PATTERN = /(^|\n)\s*[【\[][^】\]\n]{2,80}[】\]]\s*$/m;
const INLINE_BRACKET_CTA_PATTERN = /\[([^[\]<>\n]{2,80})\]/g;

function renderTextNodeToMarkdown(node: TextNode): string {
  let text = node.text || '';
  if (!text) return '';

  if (node.code) text = `\`${text}\``;
  if (node.bold) text = `**${text}**`;
  if (node.italic) text = `*${text}*`;
  if (node.strikethrough) text = `~~${text}~~`;
  if (node.underline) text = `<u>${text}</u>`;

  return text;
}

function renderInlineChildrenToMarkdown(children: BlockNode[] | undefined): string {
  if (!children?.length) return '';

  return children
    .map((child) => {
      switch (child.type) {
        case 'text':
          return renderTextNodeToMarkdown(child as TextNode);

        case 'link': {
          const link = child as LinkNode;
          const content = renderInlineChildrenToMarkdown(link.children).trim() || sanitizeMediaAltText(link.url);
          return link.url ? `[${content}](${link.url})` : content;
        }

        default:
          return renderInlineChildrenToMarkdown(child.children);
      }
    })
    .join('');
}

function renderListItemToMarkdown(
  item: ListItemNode,
  format: ListNode['format'],
  index: number,
  depth: number
): string {
  const indent = '  '.repeat(depth);
  const continuationIndent = '  '.repeat(depth + 1);
  const prefix = format === 'ordered' ? `${index + 1}. ` : '- ';
  const parts: string[] = [];

  for (const child of item.children ?? []) {
    if (child.type === 'list') {
      const nestedList = renderBlockToMarkdown(child, depth + 1).trimEnd();
      if (nestedList) parts.push(`\n${nestedList}`);
      continue;
    }

    const rendered = renderBlockToMarkdown(child, depth + 1).trim();
    if (rendered) parts.push(rendered);
  }

  const content = parts.join('\n').trim();
  if (!content) return `${indent}${prefix}`.trimEnd();

  const [firstLine, ...restLines] = content.split('\n');
  const rest = restLines.length > 0 ? `\n${restLines.map((line) => `${continuationIndent}${line}`).join('\n')}` : '';
  return `${indent}${prefix}${firstLine}${rest}`;
}

function renderBlockToMarkdown(node: BlockNode, depth: number = 0): string {
  if (!node?.type) return '';

  switch (node.type) {
    case 'text':
      return renderTextNodeToMarkdown(node as TextNode);

    case 'heading': {
      const level = Math.min(Math.max(Number((node as { level?: number }).level) || 2, 1), 6);
      const content = renderInlineChildrenToMarkdown(node.children).trim();
      return content ? `${'#'.repeat(level)} ${content}` : '';
    }

    case 'paragraph':
      return renderInlineChildrenToMarkdown(node.children).trim();

    case 'list': {
      const list = node as ListNode;
      return (list.children ?? [])
        .map((child, index) => renderListItemToMarkdown(child as ListItemNode, list.format, index, depth))
        .filter(Boolean)
        .join('\n');
    }

    case 'list-item':
      return renderListItemToMarkdown(node as ListItemNode, 'unordered', 0, depth);

    case 'quote': {
      const content = renderInlineChildrenToMarkdown(node.children).trim();
      return content
        ? content
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
        : '';
    }

    case 'code': {
      const language = typeof (node as { language?: unknown }).language === 'string' ? String((node as { language?: unknown }).language) : '';
      const content = renderInlineChildrenToMarkdown(node.children);
      return `\`\`\`${language}\n${content}\n\`\`\``;
    }

    case 'image': {
      const imageNode = node as ImageNode;
      const image = parseImage(imageNode.image);
      if (!image?.src) return '';

      const alt = sanitizeMediaAltText(image.alt || imageNode.caption);
      return `![${alt}](${image.src})`;
    }

    default:
      return renderInlineChildrenToMarkdown(node.children).trim();
  }
}

function blocksToMarkdown(blocks: BlockNode[]): string {
  return blocks
    .map((block) => renderBlockToMarkdown(block).trim())
    .filter(Boolean)
    .join('\n\n');
}

function blocksNeedMarkdownFallback(blocks: BlockNode[]): boolean {
  return blocks.some((block) => {
    const text = renderBlockToMarkdown(block).trim();
    if (!text) return false;
    return MARKDOWN_HINT_PATTERN.test(text) || BRACKET_CTA_PATTERN.test(text);
  });
}

function decorateDealerIntroHtml(html: string): string {
  return html
    .replace(/<p>\s*\[([^[\]<>\n]{2,80})\]\s*<\/p>/g, '<p class="dealer-intro-cta-row"><span class="dealer-intro-cta">$1</span></p>')
    .replace(INLINE_BRACKET_CTA_PATTERN, '<span class="dealer-intro-inline-cta">$1</span>');
}

export async function renderDealerIntroHtml(
  introContent: BlockNode[] | string | null | undefined,
  fallbackImageAlt?: string,
  locale?: string
): Promise<string> {
  const markdownSource = typeof introContent === 'string'
    ? sanitizeMarkdown(introContent)
    : Array.isArray(introContent) && introContent.length > 0 && blocksNeedMarkdownFallback(introContent)
      ? sanitizeMarkdown(blocksToMarkdown(introContent))
      : '';

  if (!markdownSource) return '';

  const html = await markdownToHtml(markdownSource, fallbackImageAlt, locale);
  return decorateDealerIntroHtml(html);
}
