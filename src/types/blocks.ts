/**
 * Strapi Rich Text (Blocks) 类型定义
 * 用于处理 Strapi Blocks 编辑器的内容
 */

import type { StrapiMedia } from './strapi';

/** Blocks 节点的基础类型 */
export interface BlockNode {
  type: string;
  children?: BlockNode[];
  [key: string]: unknown;
}

/** 文本节点 */
export interface TextNode extends BlockNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

/** 标题节点 */
export interface HeadingNode extends BlockNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: BlockNode[];
}

/** 段落节点 */
export interface ParagraphNode extends BlockNode {
  type: 'paragraph';
  children: BlockNode[];
}

/** 列表节点 */
export interface ListNode extends BlockNode {
  type: 'list';
  format: 'ordered' | 'unordered';
  children: BlockNode[];
}

/** 列表项节点 */
export interface ListItemNode extends BlockNode {
  type: 'list-item';
  children: BlockNode[];
}

/** 链接节点 */
export interface LinkNode extends BlockNode {
  type: 'link';
  url: string;
  children: BlockNode[];
  newTab?: boolean;
}

/** 引用节点 */
export interface QuoteNode extends BlockNode {
  type: 'quote';
  children: BlockNode[];
}

/** 代码节点 */
export interface CodeNode extends BlockNode {
  type: 'code';
  children: BlockNode[];
  language?: string;
}

/** 图片节点 */
export interface ImageNode extends BlockNode {
  type: 'image';
  image: StrapiMedia;
  caption?: string;
}

/** 新闻项类型（glorisNews 中的每一项） */
export interface NewsItem {
  id?: number;
  documentId?: string;
  title: string;
  cover: StrapiMedia | null; // 封面图
  content: BlockNode[]; // Rich Text (Blocks)
  url: string; // 跳转链接
  [key: string]: unknown;
}
