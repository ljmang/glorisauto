import { supportedLocales, type Locale } from '@/i18n/config';
import type {
  CategoryAttributes,
  HelpCategoryAttributes,
  HelpCenterAttributes,
  InsightAttributes,
  InsightCategoryAttributes,
  ProductAttributes,
  TopBrandAttributes,
} from '@/types/content';
import { fetchApi, api } from './strapiApi';
import { toHref } from './navigationData';

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

type AddEntry = (path: string | undefined, lastmod?: string | null) => void;

type CategoryRecord = CategoryAttributes & { updatedAt?: string; publishedAt?: string };
type ProductRecord = ProductAttributes & {
  updatedAt?: string;
  publishedAt?: string;
  category?: { slug?: string } | null;
};
type HelpCategoryRecord = HelpCategoryAttributes & { updatedAt?: string; publishedAt?: string };
type HelpArticleRecord = HelpCenterAttributes & {
  updatedAt?: string;
  publishedAt?: string;
  help_category?: { slug?: string } | null;
};
type InsightCategoryRecord = InsightCategoryAttributes & { updatedAt?: string; publishedAt?: string };
type InsightRecord = InsightAttributes & {
  updatedAt?: string;
  publishedAt?: string;
  insight_category?: { slug?: string } | null;
};
type TopBrandRecord = TopBrandAttributes & { updatedAt?: string; publishedAt?: string };
type FileCategoryRecord = { slug?: string; updatedAt?: string; publishedAt?: string };

const STATIC_PAGE_PATHS = [
  '/',
  '/about',
  '/about/dealer',
  '/about/brand-story',
  '/about/insights',
  '/help',
  '/products',
  '/support',
  '/support/customer-service',
  '/support/download',
  '/support/training',
  '/top-brands',
  '/privacy-policy',
  '/cookie-preferences',
] as const;

function toAbsoluteUrl(siteUrl: string, path: string): string {
  return new URL(path.startsWith('/') ? path : `/${path}`, `${siteUrl}/`).toString();
}

function toIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}

async function collectLocaleEntries(locale: Locale, addEntry: AddEntry): Promise<void> {
  for (const path of STATIC_PAGE_PATHS) {
    addEntry(toHref(path, locale));
  }

  const [
    categoriesRes,
    productsRes,
    helpCategoriesRes,
    helpArticlesRes,
    insightCategoriesRes,
    insightsRes,
    topBrandsRes,
    fileCategoriesRes,
  ] = await Promise.all([
    fetchApi<{ data?: CategoryRecord[] }>(api.categories, {
      locale,
      pagination: { pageSize: 200 },
    }),
    fetchApi<{ data?: ProductRecord[] }>(api.products, {
      locale,
      populate: { category: true },
      pagination: { pageSize: 500 },
    }),
    fetchApi<{ data?: HelpCategoryRecord[] }>(api.helpCategories, {
      locale,
      pagination: { pageSize: 200 },
    }),
    fetchApi<{ data?: HelpArticleRecord[] }>(api.helpCenters, {
      locale,
      populate: { help_category: true },
      pagination: { pageSize: 500 },
    }),
    fetchApi<{ data?: InsightCategoryRecord[] }>(api.insightCategories, {
      locale,
      pagination: { pageSize: 200 },
    }),
    fetchApi<{ data?: InsightRecord[] }>(api.insights, {
      locale,
      populate: { insight_category: true },
      pagination: { pageSize: 500 },
    }),
    fetchApi<{ data?: TopBrandRecord[] }>(api.topBrands, {
      locale,
      pagination: { pageSize: 200 },
    }),
    fetchApi<{ data?: FileCategoryRecord[] }>(api.fileCategories, {
      locale,
      pagination: { pageSize: 200 },
    }),
  ]);

  for (const category of categoriesRes?.data ?? []) {
    if (!category?.slug) continue;
    addEntry(toHref(`/products/${category.slug}`, locale), category.updatedAt ?? category.publishedAt);
  }

  for (const product of productsRes?.data ?? []) {
    const categorySlug = product?.category?.slug ?? '';
    if (!product?.slug || !categorySlug) continue;
    addEntry(
      toHref(`/products/${categorySlug}/${product.slug}`, locale),
      product.updatedAt ?? product.publishedAt
    );
  }

  for (const category of helpCategoriesRes?.data ?? []) {
    if (!category?.slug) continue;
    addEntry(toHref(`/help/${category.slug}`, locale), category.updatedAt ?? category.publishedAt);
  }

  for (const article of helpArticlesRes?.data ?? []) {
    const categorySlug = article?.help_category?.slug ?? '';
    if (!article?.slug || !categorySlug) continue;
    addEntry(
      toHref(`/help/${categorySlug}/${article.slug}`, locale),
      article.updatedAt ?? article.publishedAt
    );
  }

  for (const category of insightCategoriesRes?.data ?? []) {
    if (!category?.slug) continue;
    addEntry(toHref(`/about/insights/${category.slug}`, locale), category.updatedAt ?? category.publishedAt);
  }

  for (const article of insightsRes?.data ?? []) {
    const categorySlug = article?.insight_category?.slug ?? '';
    if (!article?.slug || !categorySlug) continue;
    addEntry(
      toHref(`/about/insights/${categorySlug}/${article.slug}`, locale),
      article.updatedAt ?? article.publishedAt
    );
  }

  for (const brand of topBrandsRes?.data ?? []) {
    if (!brand?.slug) continue;
    addEntry(toHref(`/top-brands/${brand.slug}`, locale), brand.updatedAt ?? brand.publishedAt);
  }

  for (const category of fileCategoriesRes?.data ?? []) {
    if (!category?.slug) continue;
    addEntry(toHref(`/support/download/${category.slug}`, locale), category.updatedAt ?? category.publishedAt);
  }
}

export async function buildSitemapEntries(siteUrl: string): Promise<SitemapEntry[]> {
  const entries = new Map<string, SitemapEntry>();

  const addEntry: AddEntry = (path, lastmod) => {
    if (!path) return;

    const loc = toAbsoluteUrl(siteUrl, path);
    const normalizedLastmod = toIsoDate(lastmod);
    const existing = entries.get(loc);

    if (!existing) {
      entries.set(loc, normalizedLastmod ? { loc, lastmod: normalizedLastmod } : { loc });
      return;
    }

    if (normalizedLastmod && (!existing.lastmod || normalizedLastmod > existing.lastmod)) {
      entries.set(loc, { ...existing, lastmod: normalizedLastmod });
    }
  };

  await Promise.all(supportedLocales.map((locale) => collectLocaleEntries(locale, addEntry)));

  return [...entries.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderSitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
  ].join('\n');
}
