/**
 * Strapi 内容类型定义
 * 对应各个 Content Type 的数据结构
 */

import type { StrapiMedia, StrapiContent, StrapiLinkItem, StrapiSeo } from './strapi';
import type { BlockNode, NewsItem } from './blocks';

export type InsightDisplayMode = 'manual' | 'latest';

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
  aboutGlorisLinkLabel?: string;
  aboutGlorisLink?: string;
  glorisNewsTitle?: string;
  productsTitle?: string;
  productsLinkLabel?: string;
  productsLink?: string;
  insightsTitle?: string;
  insightsMode?: InsightDisplayMode;
  insightsCount?: number;
  insightsLinkLabel?: string;
  insightsLink?: string;
  downloadFilesTitle?: string;
  downloadFilesLinkLabel?: string;
  downloadFilesLink?: string;
  glorisNews?: NewsItem[];
  products?: unknown[];
  insights?: InsightAttributes[];
  downloadFiles?: unknown[];
  seo?: StrapiSeo | null;
}

export type HomeContent = StrapiContent<HomeAttributes>;

export interface SiteSeoAttributes {
  siteName?: string;
  siteUrl?: string;
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  defaultShareImage?: StrapiMedia | null;
  defaultRobots?: string;
  companyName?: string;
  companyLogo?: StrapiMedia | null;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  sameAsLinks?: StrapiLinkItem[];
  defaultLocale?: string;
  supportedLocales?: string[] | null;
  googleVerification?: string;
  bingVerification?: string;
  productsCollectionPage?: CollectionPageCopyFields | null;
  helpCenterCollectionPage?: CollectionPageCopyFields | null;
  insightsCollectionPage?: CollectionPageCopyFields | null;
}

export type SiteSeoContent = StrapiContent<SiteSeoAttributes>;

export interface CollectionPageCopyFields {
  heading?: string;
  seoTitle?: string;
  seoDescription?: string;
  intro?: string;
}

export interface SeoPageAttributes {
  title: string;
  path: string;
  seo?: StrapiSeo | null;
}

export type SeoPageContent = StrapiContent<SeoPageAttributes>;

/** Product 产品类型 */
export interface ProductAttributes {
  name: string;
  slug: string;
  cover?: StrapiMedia | null;
  description?: string;
  productFeatures?: string;
  shortDescription?: string;
  images?: StrapiMedia | StrapiMedia[];
  category?: unknown;
  price?: number;
  sort?: number | null;
  specifications?: Record<string, unknown>;
  seo?: StrapiSeo | null;
}

export type ProductContent = StrapiContent<ProductAttributes>;

/** Category 分类类型 */
export interface CategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  image?: StrapiMedia | null;
  parent?: {
    id?: number;
    slug?: string;
    name?: string;
  } | null;
  sort?: number;
  seo?: StrapiSeo | null;
}

export type CategoryContent = StrapiContent<CategoryAttributes>;

/** Insight Category 洞察分类类型 */
export interface InsightCategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
  seo?: StrapiSeo | null;
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
  updatedAt?: string;
  seo?: StrapiSeo | null;
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
  seo?: StrapiSeo | null;
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

/** About Us 相关类型（与 Strapi about-us 单类型一致） */
export interface AboutUsAttributes {
  title: string;
  subTitle?: string;
  description?: string;
  storyLinkLabel?: string;
  storyLink?: string;
  heroMedia?: StrapiMedia | StrapiMedia[] | null;
  content?: string;
  coverImage?: StrapiMedia | null;
  insightsMode?: InsightDisplayMode;
  insightsCount?: number;
  /** 关联的 insights 文章 */
  insights?: InsightAttributes[];
  /** 关于我们底部最新文章数量 */
  latestInsightsCount?: number;
  latestInsightsTitle?: string;
  latestInsightsLinkLabel?: string;
  latestInsightsLink?: string;
  /** Google 地图链接 */
  googleMaps?: string | null;
  mapLinkLabel?: string;
  mapEmbedTitle?: string;
  /** 联系我们区块 */
  contactGlorisTitle?: string;
  messageTitle?: string;
  messageDescription?: string;
  messageButton?: string;
  messageButtonLink?: string;
  phoneTitle?: string;
  phoneDescription?: string;
  phoneNumber?: string;
  phoneEmail?: string;
  addressTitle?: string;
  addressDescription?: string;
  seo?: StrapiSeo | null;
}

export type AboutUsContent = StrapiContent<AboutUsAttributes>;

export interface BrandStoryAttributes extends AboutUsAttributes {
  subtitle?: string;
}

export type BrandStoryContent = StrapiContent<BrandStoryAttributes>;

/** Become Dealer 成为经销商单类型（Strapi become-dealer） */
export interface BecomeDealerFocusItem {
  id?: number;
  title?: string;
  content?: BlockNode[];
  url?: string | null;
  /** 资质卡片图片 */
  cover?: StrapiMedia | StrapiMedia[] | null;
}

export interface BecomeDealerAttributes {
  title?: string;
  heroMedia?: StrapiMedia | StrapiMedia[] | null;
  joinUsTitle?: string;
  yourName?: string;
  yourEmail?: string;
  country?: string;
  yourPhone?: string;
  message?: string;
  customerServiceTitle?: string;
  customerServicePhone?: string;
  customerServiceEmail?: string;
  customerServiceWhatsapp?: string;
  customerServiceChat?: string;
  addressTitle?: string;
  addressContent?: string;
  addressGoogleMaps?: string;
  addressGoogleMapsUrl?: string;
  advantagesTitle?: string;
  focus?: BecomeDealerFocusItem[];
  insights?: (InsightAttributes & { cover?: unknown })[];
  seo?: StrapiSeo | null;
}

export type BecomeDealerContent = StrapiContent<BecomeDealerAttributes>;

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
  seo?: StrapiSeo | null;
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
  seo?: StrapiSeo | null;
}

export type SupportContent = StrapiContent<SupportAttributes>;

/** Help Category 帮助分类类型 */
export interface HelpCategoryAttributes {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
  seo?: StrapiSeo | null;
}

export type HelpCategoryContent = StrapiContent<HelpCategoryAttributes>;

/** Help Center 帮助文章类型 */
export interface HelpCenterAttributes {
  title: string;
  slug: string;
  description?: string;
  contentMarkdown?: string;
  sort?: number;
  recommend?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  help_category?: HelpCategoryAttributes | null;
  products?: ProductAttributes[];
  seo?: StrapiSeo | null;
}

export type HelpCenterContent = StrapiContent<HelpCenterAttributes>;
