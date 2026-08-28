import { toHref } from './navigationData';
import type { HelpCenterAttributes, ProductAttributes } from '@/types/content';

export interface HelpProductCategoryOption {
  slug: string;
  name: string;
  count: number;
  sort?: number;
}

export interface HelpProductCategoryArticle {
  title: string;
  description: string;
  href: string;
  productCategorySlugs: string[];
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
 * Products use a two-level category tree. FAQ filters should always use the
 * root category so child product categories roll up into one stable option.
 */
export function getTopLevelProductCategory(product: ProductAttributes): HelpProductCategoryOption | null {
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

export function getHelpProductCategories(article: HelpCenterAttributes): HelpProductCategoryOption[] {
  const products = [
    ...(Array.isArray(article.related_products) ? article.related_products : []),
    ...(Array.isArray(article.products) ? article.products : []),
  ] as ProductAttributes[];
  const categories = new Map<string, HelpProductCategoryOption>();

  for (const product of products) {
    const category = getTopLevelProductCategory(product);
    if (category && !categories.has(category.slug)) {
      categories.set(category.slug, category);
    }
  }

  return Array.from(categories.values());
}

export function buildHelpProductCategoryOptions(
  articles: HelpCenterAttributes[],
  locale = 'en'
): HelpProductCategoryOption[] {
  const options = new Map<string, HelpProductCategoryOption>();

  for (const article of articles) {
    for (const category of getHelpProductCategories(article)) {
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

export function buildHelpProductCategoryArticles(
  articles: HelpCenterAttributes[],
  locale: string
): HelpProductCategoryArticle[] {
  return articles
    .map((article) => {
      const categorySlug = article.help_category?.slug ?? '';
      const articleSlug = article.slug ?? '';
      const title = article.title?.trim() ?? '';

      if (!categorySlug || !articleSlug || !title) return null;

      return {
        title,
        description: article.quickAnswer?.trim() || article.description?.trim() || '',
        href: toHref(`/help/${categorySlug}/${articleSlug}`, locale),
        productCategorySlugs: getHelpProductCategories(article).map((category) => category.slug),
      };
    })
    .filter((article): article is HelpProductCategoryArticle => article !== null);
}
