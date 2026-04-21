/**
 * Strapi 接口统一入口
 * - api：接口路径常量
 * - fetchApi、fetchApiWithLocaleFallback、getStrapiUrl、getMediaUrl
 */

import { defaultLocale } from '@/i18n/config';
import { getMediaUrl as getMediaUrlBase } from './strapi';
import { fetchApi as fetchApiBase, type FetchApiOptions } from './strapi';

export { getStrapiUrl, getMediaUrl, fetchApi } from './strapi';
export type { FetchApiOptions } from './strapi';

/** 当该 locale 返回无数据时，用默认语言再请求一次 */
export async function fetchApiWithLocaleFallback<T = unknown>(
  path: string,
  options: FetchApiOptions = {}
): Promise<T> {
  const result = (await fetchApiBase(path, options)) as { data?: unknown };
  const data = result?.data;
  const hasData = data != null && (Array.isArray(data) ? data.length > 0 : true);
  if (hasData || !options.locale || options.locale === defaultLocale) {
    return result as T;
  }
  return fetchApiBase(path, { ...options, locale: defaultLocale }) as Promise<T>;
}

function appendMediaVersion(url: string, version?: string): string {
  if (!url || !version) return url;

  try {
    const target = new URL(url);
    target.searchParams.set('v', version);
    return target.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(version)}`;
  }
}

/** v5 媒体：对象带 url，或数组取首项 */
export function getMediaUrlFromField(field: unknown): string {
  if (field == null) return '';
  const target = Array.isArray(field) ? field[0] : field;
  if (target == null) return '';
  const r = target as Record<string, unknown>;
  const url = typeof r?.url === 'string' ? r.url : '';
  const version =
    (typeof r?.updatedAt === 'string' && r.updatedAt) ||
    (typeof r?.createdAt === 'string' && r.createdAt) ||
    undefined;
  return appendMediaVersion(getMediaUrlBase(url), version);
}

const IMAGE_MIME_PREFIX = 'image/';
const VIDEO_MIME_PREFIX = 'video/';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

function getMediaVersion(record: Record<string, unknown>): string | undefined {
  return (
    (typeof record?.updatedAt === 'string' && record.updatedAt) ||
    (typeof record?.createdAt === 'string' && record.createdAt) ||
    undefined
  );
}

function getMediaAltText(record: Record<string, unknown>): string {
  return (
    (typeof record?.alternativeText === 'string' && record.alternativeText) ||
    (typeof record?.caption === 'string' && record.caption) ||
    (typeof record?.name === 'string' && record.name) ||
    ''
  );
}

function getMediaDimensions(record: Record<string, unknown>): { width?: number; height?: number } {
  return {
    width: typeof record?.width === 'number' ? record.width : undefined,
    height: typeof record?.height === 'number' ? record.height : undefined,
  };
}

function resolveMediaSrc(record: Record<string, unknown>): string {
  const url = typeof record?.url === 'string' ? record.url : '';
  return appendMediaVersion(getMediaUrlBase(url), getMediaVersion(record));
}

function hasExtension(url: string, extensions: string[]): boolean {
  const lower = url.toLowerCase();
  return extensions.some((ext) => lower.includes(ext));
}

function detectMediaType(record: Record<string, unknown>): 'image' | 'video' | null {
  const mime = record?.mime as string | undefined;
  if (typeof mime === 'string' && mime.startsWith(VIDEO_MIME_PREFIX)) return 'video';
  if (typeof mime === 'string' && mime.startsWith(IMAGE_MIME_PREFIX)) return 'image';

  const url = (record?.url as string) ?? '';
  if (hasExtension(url, VIDEO_EXTENSIONS)) return 'video';
  if (hasExtension(url, IMAGE_EXTENSIONS)) return 'image';

  if (typeof record?.width === 'number' || typeof record?.height === 'number') return 'image';
  return null;
}

function resolveVideoPoster(record: Record<string, unknown>): string | undefined {
  const previewUrl = (record as { previewUrl?: unknown }).previewUrl;
  if (typeof previewUrl === 'string' && previewUrl) {
    return appendMediaVersion(getMediaUrlBase(previewUrl), getMediaVersion(record));
  }

  const formats = record?.formats;
  if (!formats || typeof formats !== 'object') return undefined;

  const candidates = ['thumbnail', 'small', 'medium', 'large'];
  for (const key of candidates) {
    const format = (formats as Record<string, unknown>)[key];
    if (!format || typeof format !== 'object') continue;
    const formatUrl = (format as { url?: unknown }).url;
    if (typeof formatUrl === 'string' && formatUrl) {
      return appendMediaVersion(getMediaUrlBase(formatUrl), getMediaVersion(record));
    }
  }

  return undefined;
}

export interface ParsedMediaItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
  width?: number;
  height?: number;
  name?: string;
  poster?: string;
}

export function parseMedia(field: unknown): ParsedMediaItem | null {
  if (field == null) return null;
  const target = Array.isArray(field) ? field[0] : field;
  if (target == null) return null;

  const record = target as Record<string, unknown>;
  const type = detectMediaType(record);
  const src = resolveMediaSrc(record);
  if (!type || !src) return null;

  const { width, height } = getMediaDimensions(record);

  return {
    type,
    src,
    alt: getMediaAltText(record),
    width,
    height,
    name: typeof record?.name === 'string' ? record.name : undefined,
    poster: type === 'video' ? resolveVideoPoster(record) : undefined,
  };
}

export function parseMediaItems(field: unknown): ParsedMediaItem[] {
  if (field == null) return [];

  if (Array.isArray(field)) {
    return field
      .map((item) => parseMedia(item))
      .filter((item): item is ParsedMediaItem => item !== null);
  }

  const single = parseMedia(field);
  return single ? [single] : [];
}

/** 从单一 heroMedia 字段解析出 { type, src, poster? }，图片或视频均由该字段上传 */
export function parseHeroMedia(field: unknown): { type: 'image' | 'video'; src: string; poster?: string } | null {
  const media = parseMedia(field);
  if (!media) return null;
  return {
    type: media.type,
    src: media.src,
    poster: media.poster,
  };
}

/** Strapi 图片对象类型 */
export interface StrapiImage {
  id?: number;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  name?: string;
  mime?: string;
  ext?: string;
  formats?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** 解析图片字段，返回图片信息对象（用于 img 标签） */
export function parseImage(field: unknown): {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  name?: string;
} | null {
  if (field == null) return null;
  
  // 处理数组：取第一项
  const target = Array.isArray(field) ? field[0] : field;
  if (target == null) return null;
  
  const img = target as StrapiImage;
  if (detectMediaType(img as Record<string, unknown>) !== 'image') return null;

  const src = resolveMediaSrc(img as Record<string, unknown>);
  if (!src) return null;
  
  const { width, height } = getMediaDimensions(img as Record<string, unknown>);
  
  return {
    src,
    alt: getMediaAltText(img as Record<string, unknown>),
    width,
    height,
    name: typeof img?.name === 'string' ? img.name : undefined,
  };
}

/** 解析图片字段，仅返回 URL 字符串（简单场景） */
export function parseImageUrl(field: unknown): string {
  const parsed = parseImage(field);
  return parsed?.src ?? '';
}

/** 解析多张图片字段，返回图片数组（用于图片列表、轮播图等） */
export function parseImages(field: unknown): Array<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  name?: string;
}> {
  if (field == null) return [];
  
  // 如果是数组，处理每一项
  if (Array.isArray(field)) {
    return field
      .map((item) => parseImage(item))
      .filter((img): img is NonNullable<typeof img> => img !== null);
  }
  
  // 如果是单个对象，转换为数组
  const single = parseImage(field);
  return single ? [single] : [];
}

/** 解析多张图片字段，仅返回 URL 字符串数组（简单场景） */
export function parseImageUrls(field: unknown): string[] {
  return parseImages(field).map((img) => img.src);
}

export const api = {
  home: 'home',
  aboutUs: 'about-us',
  brandStory: 'brand-story',
  becomeDealer: 'become-dealer',
  contactUs: 'contact-uses',
  products: 'products',
  categories: 'categories',
  topBrands: 'top-brands',
  brandHome: 'brand-home',
  insights: 'insights',
  insightCategories: 'insight-categories',
  helpCenters: 'help-centers',
  helpCategories: 'help-categories',
  seoPages: 'seo-pages',
  downloadFiles: 'download-files',
  trainings: 'trainings',
  productionBases: 'production-bases',
  navigation: 'navigation',
  fileCategories: 'flie-categories',
  support: 'support',
  siteSeo: 'site-seo',
} as const;

export function byId(collection: string, id: string | number): string {
  return `${collection}/${id}`;
}
