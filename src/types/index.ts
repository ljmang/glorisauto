/**
 * 类型定义统一导出
 * 方便在项目中导入使用
 */

// Strapi 基础类型
export type {
  StrapiMedia,
  StrapiSeo,
  StrapiLinkItem,
  StrapiResponse,
  StrapiItem,
  StrapiContent,
} from './strapi';

// 内容类型
export type {
  HomeAttributes,
  HomeContent,
  SiteSeoAttributes,
  SiteSeoContent,
  ProductAttributes,
  ProductContent,
  CategoryAttributes,
  CategoryContent,
  InsightAttributes,
  InsightContent,
  TopBrandAttributes,
  TopBrandContent,
  AboutUsAttributes,
  AboutUsContent,
  BrandStoryAttributes,
  BrandStoryContent,
  ContactUsAttributes,
  ContactUsContent,
  DownloadFileAttributes,
  DownloadFileContent,
  SupportAttributes,
  SupportContent,
  SupportModuleItem,
  HelpCategoryAttributes,
  HelpCategoryContent,
  HelpCenterAttributes,
  HelpCenterContent,
} from './content';

// Blocks 类型
export type {
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
  NewsItem,
} from './blocks';
