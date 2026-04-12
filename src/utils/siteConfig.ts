import { defaultLocale, type Locale } from '@/i18n/config';
import type { SiteSeoAttributes, StrapiResponse } from '@/types';
import { fetchApiWithLocaleFallback, api } from './strapiApi';

export const DEFAULT_SITE_URL = 'https://www.glorisauto.com';

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

export async function getResolvedSiteUrl(locale: Locale = defaultLocale): Promise<string> {
  const siteSeo = await fetchSiteSeo(locale);
  return normalizeSiteUrl(siteSeo?.siteUrl);
}
