/**
 * Strapi 通用类型定义
 * 用于所有 Strapi API 响应的基础类型
 */

/** Strapi 媒体文件类型 */
export interface StrapiMedia {
  id?: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  name?: string;
  mime?: string;
  ext?: string;
  size?: number;
  formats?: Record<string, unknown>;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface StrapiLinkItem {
  label?: string | null;
  url?: string | null;
}

export interface StrapiSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  keywords?: string | null;
  metaImage?: StrapiMedia | null;
  metaRobots?: string | null;
  canonicalURL?: string | null;
  metaViewport?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: StrapiMedia | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: StrapiMedia | null;
  twitterCard?: 'summary' | 'summary_large_image' | null;
  hideFromSearch?: boolean | null;
  focusKeyword?: string | null;
  schemaType?: string | null;
}

/** Strapi 标准响应结构 */
export interface StrapiResponse<T> {
  data: T | null;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/** Strapi 集合项（带 id 和文档元数据） */
export interface StrapiItem<T = Record<string, unknown>> {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale?: string;
  localizations?: Array<Partial<StrapiItem<T>>>;
  seo?: StrapiSeo | null;
}

/** 完整的 Strapi 内容项（包含属性和元数据） */
export type StrapiContent<T> = StrapiItem<T & Record<string, unknown>>;
