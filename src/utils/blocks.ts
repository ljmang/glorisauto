/**
 * Strapi Rich Text (Blocks) 渲染工具
 * 将 Blocks JSON 转换为 HTML
 */

import type {
  BlockNode,
  TextNode,
  HeadingNode,
  ParagraphNode,
  ListNode,
  ListItemNode,
  LinkNode,
  QuoteNode,
  CodeNode,
  ImageNode,
} from '@/types/blocks';
import { parseImage, sanitizeMediaAltText } from './strapiApi';

/** 渲染文本节点 */
function renderTextNode(node: TextNode): string {
  let text = node.text || '';
  
  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  if (node.strikethrough) text = `<s>${text}</s>`;
  if (node.code) text = `<code>${text}</code>`;
  
  return text;
}

/** 递归渲染子节点 */
function renderChildren(children: BlockNode[] | undefined): string {
  if (!children || children.length === 0) return '';
  return children.map((child) => renderBlockNode(child)).join('');
}

/** 渲染单个 Block 节点 */
export function renderBlockNode(node: BlockNode): string {
  if (!node || !node.type) return '';

  switch (node.type) {
    case 'text':
      return renderTextNode(node as TextNode);

    case 'heading': {
      const heading = node as HeadingNode;
      const level = heading.level || 1;
      const content = renderChildren(heading.children);
      return `<h${level}>${content}</h${level}>`;
    }

    case 'paragraph': {
      const paragraph = node as ParagraphNode;
      const content = renderChildren(paragraph.children);
      return `<p>${content}</p>`;
    }

    case 'list': {
      const list = node as ListNode;
      const content = renderChildren(list.children);
      const tag = list.format === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${content}</${tag}>`;
    }

    case 'list-item': {
      const item = node as ListItemNode;
      const content = renderChildren(item.children);
      return `<li>${content}</li>`;
    }

    case 'link': {
      const link = node as LinkNode;
      const content = renderChildren(link.children);
      const target = link.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${link.url}"${target}>${content}</a>`;
    }

    case 'quote': {
      const quote = node as QuoteNode;
      const content = renderChildren(quote.children);
      return `<blockquote>${content}</blockquote>`;
    }

    case 'code': {
      const code = node as CodeNode;
      const content = renderChildren(code.children);
      const language = code.language ? ` class="language-${code.language}"` : '';
      return `<pre><code${language}>${content}</code></pre>`;
    }

    case 'image': {
      const imageNode = node as ImageNode;
      const image = parseImage(imageNode.image);
      if (!image) return '';
      
      const alt = image.alt || sanitizeMediaAltText(imageNode.caption);
      const width = image.width ? ` width="${image.width}"` : '';
      const height = image.height ? ` height="${image.height}"` : '';
      const caption = imageNode.caption ? `<figcaption>${imageNode.caption}</figcaption>` : '';
      
      return `<figure><img src="${image.src}" alt="${alt}"${width}${height} loading="lazy" />${caption}</figure>`;
    }

    default:
      // 未知类型，尝试渲染子节点
      return renderChildren((node as { children?: BlockNode[] }).children);
  }
}

/** 渲染整个 Blocks 数组为 HTML */
export function renderBlocks(blocks: BlockNode[] | null | undefined): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map((block) => renderBlockNode(block)).join('');
}

/** 渲染 Blocks 并返回安全的 HTML（可用于 set:html） */
export function renderBlocksSafe(blocks: BlockNode[] | null | undefined): string {
  return renderBlocks(blocks);
}

/** 从 Blocks 中提取纯文本摘要（用于卡片预览） */
export function extractTextFromBlocks(blocks: BlockNode[] | null | undefined, maxLength: number = 150): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  function extractText(node: BlockNode): string {
    // 如果是文本节点，直接返回文本
    if (node.type === 'text') {
      const textNode = node as TextNode;
      return textNode.text || '';
    }
    
    // 如果有子节点，递归提取文本
    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
      return node.children.map(extractText).join('').trim();
    }
    
    return '';
  }
  
  // 遍历所有 block，提取文本，用空格连接
  const text = blocks
    .map((block) => extractText(block))
    .filter((t) => t.length > 0) // 过滤空字符串
    .join(' ')
    .trim();
  
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
