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

/** v5 媒体：对象带 url，或数组取首项 */
export function getMediaUrlFromField(field: unknown): string {
  if (field == null) return '';
  const target = Array.isArray(field) ? field[0] : field;
  if (target == null) return '';
  const r = target as Record<string, unknown>;
  const url = typeof r?.url === 'string' ? r.url : '';
  return getMediaUrlBase(url);
}

const VIDEO_MIME_PREFIX = 'video/';
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

function isVideoMedia(record: Record<string, unknown>): boolean {
  const mime = record?.mime as string | undefined;
  if (typeof mime === 'string' && mime.startsWith(VIDEO_MIME_PREFIX)) return true;
  const url = (record?.url as string) ?? '';
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}

/** 从单一 heroMedia 字段解析出 { type, src, poster? }，图片或视频均由该字段上传 */
export function parseHeroMedia(field: unknown): { type: 'image' | 'video'; src: string; poster?: string } | null {
  if (field == null) return null;
  const target = Array.isArray(field) ? field[0] : field;
  if (target == null) return null;
  const r = target as Record<string, unknown>;
  const url = typeof r?.url === 'string' ? r.url : '';
  const src = getMediaUrlBase(url);
  if (!src) return null;
  const type = isVideoMedia(r) ? 'video' : 'image';
  return { type, src };
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
  const url = typeof img?.url === 'string' ? img.url : '';
  const src = getMediaUrlBase(url);
  if (!src) return null;
  
  // alt 文本优先级：alternativeText > caption > name > ''
  const alt = 
    (typeof img?.alternativeText === 'string' && img.alternativeText) ||
    (typeof img?.caption === 'string' && img.caption) ||
    (typeof img?.name === 'string' && img.name) ||
    '';
  
  return {
    src,
    alt,
    width: typeof img?.width === 'number' ? img.width : undefined,
    height: typeof img?.height === 'number' ? img.height : undefined,
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
  aboutUs: 'about-uses',
  brandStory: 'brand-stories',
  becomeDealer: 'become-dealers',
  contactUs: 'contact-uses',
  products: 'products',
  categories: 'categories',
  topBrands: 'top-brands',
  brandHome: 'brand-home',
  insights: 'insights',
  insightCategories: 'insight-categories',
  helpCenters: 'help-centers',
  helpCategories: 'help-categories',
  downloadFiles: 'download-files',
  trainings: 'trainings',
  productionBases: 'production-bases',
  navigations: 'navigations',
  fileCategories: 'flie-categories',
  support: 'support',
} as const;

export function byId(collection: string, id: string | number): string {
  return `${collection}/${id}`;
}
