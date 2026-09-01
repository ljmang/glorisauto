import { toHref } from './navigationData';
import { parseImage, resolveImageAltText } from './strapiApi';
import { type Locale, localeDateTag } from '@/i18n/config';
import type { InsightAttributes, InsightCategoryAttributes, ProductAttributes } from '@/types/content';

export interface InsightProductCategoryOption {
  slug: string;
  name: string;
  count: number;
  sort?: number;
}

export interface InsightCardItem {
  id?: number | string;
  title: string;
  description?: string;
  excerpt?: string;
  href: string;
  publishedDate?: string;
  publishedAt?: string;
  coverSrc?: string;
  coverAlt?: string;
  coverWidth?: number;
  coverHeight?: number;
  categoryName?: string;
  categorySlug?: string;
  productCategorySlugs: string[];
  sort?: number;
}

type CategoryShape = {
  slug?: string;
  name?: string;
  sort?: number;
  parent?: CategoryRelation;
};
type CategoryRelation = CategoryShape | { data?: CategoryShape | null } | null | undefined;
type ProductRelation = ProductAttributes & { category?: CategoryRelation };

function unwrapRelation<T>(value: T | { data?: T | null } | null | undefined): T | null {
  if (!value) return null;
  if (typeof value === 'object' && 'data' in value) {
    return (value as { data?: T | null }).data ?? null;
  }
  return value as T;
}

/**
 * Extract root product category for an insight product relation.
 */
export function getTopLevelProductCategory(product: ProductAttributes): InsightProductCategoryOption | null {
  const category = unwrapRelation<CategoryShape>((product as ProductRelation).category);
  if (!category?.slug) return null;

  const parent = unwrapRelation<CategoryShape>(category.parent);
  const root = parent?.slug ? parent : category;
  const name = typeof root.name === 'string' ? root.name.trim() : '';

  if (!root.slug || !name) return null;

  return {
    slug: root.slug,
    name,
    count: 0,
    sort: root.sort,
  };
}

export function getInsightProductCategories(insight: InsightAttributes): InsightProductCategoryOption[] {
  const products = (Array.isArray(insight.products) ? insight.products : []) as ProductAttributes[];
  const categories = new Map<string, InsightProductCategoryOption>();

  for (const product of products) {
    const category = getTopLevelProductCategory(product);
    if (category && !categories.has(category.slug)) {
      categories.set(category.slug, category);
    }
  }

  return Array.from(categories.values());
}

export function buildInsightProductCategoryOptions(
  insights: InsightAttributes[],
  locale = 'en'
): InsightProductCategoryOption[] {
  const options = new Map<string, InsightProductCategoryOption>();

  for (const insight of insights) {
    for (const category of getInsightProductCategories(insight)) {
      const existing = options.get(category.slug);
      if (existing) {
        existing.count += 1;
        continue;
      }

      options.set(category.slug, { ...category, count: 1 });
    }
  }

  return Array.from(options.values()).sort((a, b) => {
    const sortDifference = (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER);
    return sortDifference || a.name.localeCompare(b.name, locale);
  });
}

export function buildInsightCardItems(
  insights: InsightAttributes[],
  locale: Locale
): InsightCardItem[] {
  return insights
    .map((insight) => {
      const title = insight.title?.trim() ?? '';
      if (!title || !insight.slug) return null;

      const category = insight.insight_category && typeof insight.insight_category === 'object' && 'slug' in insight.insight_category
        ? (insight.insight_category as InsightCategoryAttributes)
        : null;
      const categorySlug = category?.slug ?? '';
      const categoryName = category?.name ?? '';

      const href = categorySlug
        ? toHref(`/about/insights/${categorySlug}/${insight.slug}`, locale)
        : toHref(`/about/insights/${insight.slug}`, locale);

      const coverImage = parseImage(insight.cover || (insight as { coverImage?: unknown }).coverImage);
      const coverAlt = resolveImageAltText(insight.coverAlt, coverImage?.alt, title);

      const publishedDate = insight.publishedAt
        ? new Date(insight.publishedAt).toLocaleDateString(localeDateTag[locale], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '';

      const productCategories = getInsightProductCategories(insight);

      return {
        id: insight.id,
        title,
        description: insight.description?.trim() || '',
        excerpt: insight.excerpt?.trim() || '',
        href,
        publishedDate,
        publishedAt: insight.publishedAt,
        coverSrc: coverImage?.src,
        coverAlt,
        coverWidth: coverImage?.width,
        coverHeight: coverImage?.height,
        categoryName,
        categorySlug,
        productCategorySlugs: productCategories.map((c) => c.slug),
        sort: insight.sort,
      };
    })
    .filter((item): item is InsightCardItem => item !== null);
}
