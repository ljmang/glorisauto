import { defaultLocale, supportedLocales, type Locale } from '@/i18n/config';
import type { SeoPageAttributes, SiteSeoAttributes, StrapiResponse } from '@/types';
import { fetchApiWithLocaleFallback, api } from './strapiApi';

export const DEFAULT_SITE_URL = 'https://www.glorisauto.com';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSeoPagePath(pathname: string): string {
  const path = pathname.split('?')[0]?.split('#')[0] ?? '/';
  const ensured = path.startsWith('/') ? path : `/${path}`;
  const localePattern = new RegExp(
    `^/(?:${supportedLocales.map((locale) => escapeRegex(locale)).join('|')})(?=/|$)`,
    'i'
  );
  const unlocalized = ensured.replace(localePattern, '');
  if (unlocalized.length > 1 && unlocalized.endsWith('/')) {
    return unlocalized.slice(0, -1);
  }
  return unlocalized || '/';
}

export function normalizeSiteUrl(siteUrl?: string | null): string {
  const trimmed = typeof siteUrl === 'string' ? siteUrl.trim() : '';
  if (!trimmed) return DEFAULT_SITE_URL;

  try {
    return new URL(trimmed).toString().replace(/\/$/, '');
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString().replace(/\/$/, '');
    } catch {
      return DEFAULT_SITE_URL;
    }
  }
}

export async function fetchSiteSeo(locale: Locale = defaultLocale): Promise<SiteSeoAttributes | null> {
  try {
    const response = await fetchApiWithLocaleFallback<StrapiResponse<SiteSeoAttributes>>(api.siteSeo, {
      locale,
      populate: {
        defaultShareImage: true,
        companyLogo: true,
        sameAsLinks: true,
        productsCollectionPage: true,
        helpCenterCollectionPage: true,
        insightsCollectionPage: true,
      },
    });
    return response?.data ?? null;
  } catch (error) {
    console.error('[siteConfig] failed to load site seo:', error);
    return null;
  }
}

export async function fetchSeoPage(
  locale: Locale,
  pathname: string
): Promise<SeoPageAttributes | null> {
  const path = normalizeSeoPagePath(pathname);

  try {
    const response = await fetchApiWithLocaleFallback<{ data?: SeoPageAttributes[] }>(api.seoPages, {
      locale,
      filters: {
        path: {
          $eq: path,
        },
      },
      sort: ['publishedAt:desc'],
      pagination: {
        pageSize: 1,
      },
      populate: {
        seo: {
          populate: {
            metaImage: true,
            ogImage: true,
            twitterImage: true,
          },
        },
      },
    });

    return response?.data?.[0] ?? null;
  } catch (error) {
    console.error('[siteConfig] failed to load seo page:', error);
    return null;
  }
}

export async function getResolvedSiteUrl(locale: Locale = defaultLocale): Promise<string> {
  const siteSeo = await fetchSiteSeo(locale);
  return normalizeSiteUrl(siteSeo?.siteUrl);
}
