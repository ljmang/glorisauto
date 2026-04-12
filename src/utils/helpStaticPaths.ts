import { supportedLocales, type Locale } from '@/i18n/config';
import type { HelpCategoryAttributes, HelpCenterAttributes } from '@/types/content';
import { api, fetchApi } from '@/utils/strapiApi';

interface CategoryPath {
  params: {
    locale: Locale;
    category: string;
  };
}

interface ArticlePath {
  params: {
    locale: Locale;
    category: string;
    slug: string;
  };
}

async function fetchHelpCategories(locale: Locale): Promise<HelpCategoryAttributes[]> {
  const response = await fetchApi<{ data?: HelpCategoryAttributes[] }>(api.helpCategories, {
    locale,
    pagination: { pageSize: 100 },
  });

  return Array.isArray(response?.data) ? response.data : [];
}

async function fetchHelpArticles(locale: Locale): Promise<HelpCenterAttributes[]> {
  const response = await fetchApi<{ data?: HelpCenterAttributes[] }>(api.helpCenters, {
    locale,
    populate: { help_category: true },
    pagination: { pageSize: 500 },
  });

  return Array.isArray(response?.data) ? response.data : [];
}

export async function getHelpCategoryStaticPaths(): Promise<CategoryPath[]> {
  const paths = await Promise.all(
    supportedLocales.map(async (locale) => {
      const [categories, articles] = await Promise.all([
        fetchHelpCategories(locale),
        fetchHelpArticles(locale),
      ]);

      const activeCategorySlugs = new Set(
        articles
          .map((article) => article.help_category?.slug)
          .filter((slug): slug is string => Boolean(slug))
      );

      return categories
        .map((category) => category.slug)
        .filter((slug): slug is string => Boolean(slug) && activeCategorySlugs.has(slug))
        .map((category) => ({
          params: {
            locale,
            category,
          },
        }));
    })
  );

  return paths.flat();
}

export async function getHelpArticleStaticPaths(): Promise<ArticlePath[]> {
  const paths = await Promise.all(
    supportedLocales.map(async (locale) => {
      const articles = await fetchHelpArticles(locale);

      return articles
        .map((article) => ({
          category: article.help_category?.slug ?? '',
          slug: article.slug ?? '',
        }))
        .filter(({ category, slug }) => Boolean(category) && Boolean(slug))
        .map(({ category, slug }) => ({
          params: {
            locale,
            category,
            slug,
          },
        }));
    })
  );

  return paths.flat();
}
