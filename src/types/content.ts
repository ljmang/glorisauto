/**
 * Strapi 内容类型定义
 * 对应各个 Content Type 的数据结构
 */

import type { StrapiMedia, StrapiContent } from './strapi';
import type { BlockNode, NewsItem } from './blocks';

/** Home 页面内容类型 */
export interface HomeAttributes {
  heroTitle: string;
  heroDescription: string;
  heroButton: string;
  heroButtonLink: string;
  heroMedia: StrapiMedia | StrapiMedia[] | null;
  aboutGlorisTitle?: string;
  aboutGlorisTitleH1: string;
  aboutGlorisTitleH2: string;
  aboutGlorisDescription: string;
  aboutGlorisCover: StrapiMedia | null;
  glorisNewsTitle?: string;
  productsTitle?: string;
  insightsTitle?: string;
  downloadFilesTitle?: string;
  glorisNews?: NewsItem[];
  products?: unknown[];
  insights?: unknown[];
  downloadFiles?: unknown[];
}

export type HomeContent = StrapiContent<HomeAttributes>;

/** Product 产品类型 */
export interface ProductAttributes {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images?: StrapiMedia | StrapiMedia[];
  category?: unknown;
  price?: number;
  specifications?: Record<string, unknown>;
}

export type ProductContent = StrapiContent<ProductAttributes>;

/** Category 分类类型 */
export interface CategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  image?: StrapiMedia | null;
}

export type CategoryContent = StrapiContent<CategoryAttributes>;

/** Insight Category 洞察分类类型 */
export interface InsightCategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}

export type InsightCategoryContent = StrapiContent<InsightCategoryAttributes>;

/** Insight 洞察/文章类型 */
export interface InsightAttributes {
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  content?: string;
  coverImage?: StrapiMedia | null;
  cover?: StrapiMedia | StrapiMedia[] | null;
  category?: unknown;
  insight_category?: InsightCategoryAttributes | null;
  publishedAt?: string;
}

export type InsightContent = StrapiContent<InsightAttributes>;

/**
 * Top Brand 顶级品牌类型（与 Strapi admin schema 一致）
 * 后端无 name/title，用 heroTitle、slug 等
 */
export interface TopBrandAttributes {
  slug: string;
  heroTitle?: string;
  heroMedia?: StrapiMedia | StrapiMedia[] | null;
  heroSubtitle?: string;
  heroButton?: string;
  heroButtonUrl?: string;
  name?: string;
  description?: string;
}

export type TopBrandContent = StrapiContent<TopBrandAttributes>;

/**
 * Top Brand 详情页所需字段（与后端 top-brand schema + populate 一致）
 * advantages 为组件 share.list-image：title, cover, content, url
 * about 为品牌介绍区（后端字段 aboutTItle 为拼写保留）
 */
export interface TopBrandDetailAttributes extends TopBrandAttributes {
  heroMedia?: StrapiMedia | StrapiMedia[] | null;
  heroTitle?: string;
  heroSubtitle?: string;
  heroButton?: string;
  heroButtonUrl?: string;
  aboutTItle?: string;
  aboutSubtitle?: string;
  aboutContent?: BlockNode[];
  aboutCover?: StrapiMedia | { url?: string } | null;
  aboutButton?: string;
  aboutButtonUrl?: string;
  advantages?: {
    title?: string;
    cover?: StrapiMedia | { url?: string } | null;
    content?: BlockNode[];
    url?: string;
  }[];
  /** 关联产品（后端 relation oneToMany，mappedBy: top_brand） */
  products?: ProductAttributes[];
  help_centers?: {
    title?: string;
    slug?: string;
    content?: BlockNode[];
    help_category?: { slug?: string };
  }[];
}

/** About Us 相关类型 */
export interface AboutUsAttributes {
  title: string;
  content?: string;
  coverImage?: StrapiMedia | null;
}

export type AboutUsContent = StrapiContent<AboutUsAttributes>;

export interface BrandStoryAttributes extends AboutUsAttributes {
  subtitle?: string;
}

export type BrandStoryContent = StrapiContent<BrandStoryAttributes>;

/** Contact Us 联系表单类型 */
export interface ContactUsAttributes {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export type ContactUsContent = StrapiContent<ContactUsAttributes>;

/** Download File 下载文件类型 */
export interface DownloadFileAttributes {
  title: string;
  description?: string;
  file?: StrapiMedia | null;
  category?: unknown;
  downloadCount?: number;
}

export type DownloadFileContent = StrapiContent<DownloadFileAttributes>;

/** Support 单类型：module 为 repeatable 组件 list-module */
export interface SupportModuleItem {
  title?: string;
  slug?: string;
  sort?: number;
  url?: string;
  cover?: StrapiMedia | null;
}

export interface SupportAttributes {
  title?: string;
  slug?: string;
  module?: SupportModuleItem[];
}

export type SupportContent = StrapiContent<SupportAttributes>;

/** Help Category 帮助分类类型 */
export interface HelpCategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}

export type HelpCategoryContent = StrapiContent<HelpCategoryAttributes>;

/** Help Center 帮助文章类型 */
export interface HelpCenterAttributes {
  title: string;
  slug: string;
  description?: string;
  content?: BlockNode[];
  sort?: number;
  recommend?: boolean;
  help_category?: HelpCategoryAttributes | null;
}

export type HelpCenterContent = StrapiContent<HelpCenterAttributes>;
