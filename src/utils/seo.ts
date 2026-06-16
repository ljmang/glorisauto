import {
  defaultLocale,
  supportedLocales,
  localeLanguageTag,
  type Locale,
} from '@/i18n/config';
import type { SeoPageAttributes, SiteSeoAttributes } from '@/types/content';
import type { StrapiLinkItem, StrapiSeo } from '@/types/strapi';
import { toHref } from './navigationData';
import { getMediaUrlFromField } from './strapiApi';

export type SeoPageType = 'website' | 'collection' | 'about' | 'contact' | 'article' | 'product';

export interface BreadcrumbMetaItem {
  label: string;
  href?: string;
}

export interface JsonLdNode {
  [key: string]: unknown;
}

export interface ResolveSeoMetaOptions {
  title?: string;
  description?: string;
  image?: unknown;
  seo?: StrapiSeo | null;
  seoPage?: SeoPageAttributes | null;
  siteSeo?: SiteSeoAttributes | null;
  locale: Locale;
  pathname: string;
  currentOrigin?: string;
  pageType?: SeoPageType;
  breadcrumbs?: BreadcrumbMetaItem[];
  extraJsonLd?: JsonLdNode | JsonLdNode[] | null;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
}

export interface ResolvedSeoMeta {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  viewport: string;
  canonicalUrl: string;
  imageUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: 'article' | 'website';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  siteUrl: string;
  alternates: Array<{ hrefLang: string; href: string }>;
  jsonLd: JsonLdNode[];
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const path = pathname.split('?')[0]?.split('#')[0] ?? '/';
  const ensured = path.startsWith('/') ? path : `/${path}`;
  if (ensured.length > 1 && ensured.endsWith('/')) {
    return ensured.slice(0, -1);
  }
  return ensured;
}

function stripLocalePrefix(pathname: string): string {
  const localePattern = new RegExp(
    `^/(?:${supportedLocales.map((locale) => escapeRegex(locale)).join('|')})(?=/|$)`,
    'i'
  );
  const normalized = normalizePath(pathname).replace(localePattern, '');
  return normalized || '/';
}

function normalizeSiteUrl(siteUrl: string | undefined, fallbackOrigin: string): string {
  const candidate = firstNonEmpty(siteUrl, fallbackOrigin);
  return candidate.replace(/\/$/, '');
}

function toAbsoluteUrl(siteUrl: string, targetPath: string): string {
  if (/^https?:\/\//i.test(targetPath)) return targetPath;
  return new URL(targetPath.startsWith('/') ? targetPath : `/${targetPath}`, `${siteUrl}/`).toString();
}

function normalizeCanonicalUrl(siteUrl: string, targetPath: string): string {
  const absoluteUrl = toAbsoluteUrl(siteUrl, targetPath);

  try {
    const url = new URL(absoluteUrl);
    const siteOrigin = new URL(siteUrl).origin;

    if (url.origin !== siteOrigin || url.pathname === '/' || url.pathname.endsWith('/')) {
      return url.toString();
    }

    const lastSegment = url.pathname.split('/').pop() ?? '';
    if (lastSegment.includes('.')) {
      return url.toString();
    }

    url.pathname = `${url.pathname}/`;
    return url.toString();
  } catch {
    return absoluteUrl;
  }
}

function resolveCanonicalUrl(siteUrl: string, pathname: string, canonicalURL?: string | null): string {
  const explicitCanonical = firstNonEmpty(canonicalURL ?? undefined);
  if (explicitCanonical) {
    return normalizeCanonicalUrl(siteUrl, explicitCanonical);
  }
  return normalizeCanonicalUrl(siteUrl, normalizePath(pathname));
}

function localeToLanguageTag(locale: Locale): string {
  return localeLanguageTag[locale];
}

function resolveImageUrl(...fields: Array<unknown>): string {
  for (const field of fields) {
    const url = getMediaUrlFromField(field);
    if (url) return url;
  }
  return '';
}

function resolveOgType(pageType?: SeoPageType): 'article' | 'website' {
  return pageType === 'article' ? 'article' : 'website';
}

function normalizeTwitterCard(
  value: string | null | undefined,
  hasImage: boolean
): 'summary' | 'summary_large_image' {
  if (value === 'summary' || value === 'summary_large_image') return value;
  return hasImage ? 'summary_large_image' : 'summary';
}

function compactValue(value: unknown): unknown {
  if (value == null) return undefined;

  if (Array.isArray(value)) {
    const compacted = value
      .map((item) => compactValue(item))
      .filter((item) => item !== undefined);
    return compacted.length > 0 ? compacted : undefined;
  }

  if (typeof value === 'object') {
    const compactedEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, compactValue(item)] as const)
      .filter(([, item]) => item !== undefined);
    return compactedEntries.length > 0 ? Object.fromEntries(compactedEntries) : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  return value;
}

function toJsonLdNode(value: unknown): JsonLdNode | null {
  const compacted = compactValue(value);
  if (compacted && typeof compacted === 'object' && !Array.isArray(compacted)) {
    return compacted as JsonLdNode;
  }
  return null;
}

function normalizeSameAsLinks(items: StrapiLinkItem[] | undefined): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => firstNonEmpty(item?.url ?? undefined))
    .filter(Boolean);
}

function buildPublisher(siteSeo: SiteSeoAttributes | null | undefined, siteUrl: string): JsonLdNode | null {
  const name = firstNonEmpty(siteSeo?.companyName, siteSeo?.siteName);
  if (!name) return null;

  const logoUrl = resolveImageUrl(siteSeo?.companyLogo);
  return toJsonLdNode({
    '@type': 'Organization',
    name,
    url: siteUrl,
    logo: logoUrl
      ? {
          '@type': 'ImageObject',
          url: logoUrl,
        }
      : undefined,
  });
}

function buildOrganizationSchema(siteSeo: SiteSeoAttributes | null | undefined, siteUrl: string): JsonLdNode | null {
  const name = firstNonEmpty(siteSeo?.companyName, siteSeo?.siteName);
  if (!name) return null;

  const logoUrl = resolveImageUrl(siteSeo?.companyLogo);
  const sameAs = normalizeSameAsLinks(siteSeo?.sameAsLinks);

  return toJsonLdNode({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: siteUrl,
    logo: logoUrl
      ? {
          '@type': 'ImageObject',
          url: logoUrl,
        }
      : undefined,
    email: firstNonEmpty(siteSeo?.contactEmail),
    telephone: firstNonEmpty(siteSeo?.contactPhone),
    address: firstNonEmpty(siteSeo?.address),
    sameAs,
  });
}

function buildPageSchema(options: {
  pageType?: SeoPageType;
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  locale: Locale;
  siteSeo?: SiteSeoAttributes | null;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
}): JsonLdNode[] {
  const pageType = options.pageType;
  const language = localeToLanguageTag(options.locale);
  const siteOrigin = new URL(options.canonicalUrl).origin;
  const publisher = buildPublisher(options.siteSeo, siteOrigin);
  const siteName = firstNonEmpty(options.siteSeo?.siteName, options.siteSeo?.companyName, options.title);
  const companyName = firstNonEmpty(options.siteSeo?.companyName, options.siteSeo?.siteName);

  if (!pageType) return [];

  if (pageType === 'website') {
    const webSite = toJsonLdNode({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: options.canonicalUrl,
      inLanguage: language,
    });
    return [webSite, buildOrganizationSchema(options.siteSeo, siteOrigin)].filter(
      (item): item is JsonLdNode => item != null
    );
  }

  if (pageType === 'collection') {
    const collectionPage = toJsonLdNode({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: options.title,
      description: options.description,
      url: options.canonicalUrl,
      inLanguage: language,
      image: options.imageUrl || undefined,
    });
    return collectionPage ? [collectionPage] : [];
  }

  if (pageType === 'about') {
    const aboutPage = toJsonLdNode({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: options.title,
      description: options.description,
      url: options.canonicalUrl,
      inLanguage: language,
      image: options.imageUrl || undefined,
      mainEntity: companyName
        ? {
            '@type': 'Organization',
            name: companyName,
          }
        : undefined,
    });
    return aboutPage ? [aboutPage] : [];
  }

  if (pageType === 'contact') {
    const contactPage = toJsonLdNode({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: options.title,
      description: options.description,
      url: options.canonicalUrl,
      inLanguage: language,
      image: options.imageUrl || undefined,
      mainEntity: companyName
        ? {
            '@type': 'Organization',
            name: companyName,
            email: firstNonEmpty(options.siteSeo?.contactEmail),
            telephone: firstNonEmpty(options.siteSeo?.contactPhone),
          }
        : undefined,
    });
    return contactPage ? [contactPage] : [];
  }

  if (pageType === 'article') {
    const articleSchema = toJsonLdNode({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: options.title,
      description: options.description,
      url: options.canonicalUrl,
      inLanguage: language,
      image: options.imageUrl || undefined,
      datePublished: firstNonEmpty(options.publishedTime),
      dateModified: firstNonEmpty(options.modifiedTime, options.publishedTime),
      author: firstNonEmpty(options.authorName)
        ? {
            '@type': 'Person',
            name: firstNonEmpty(options.authorName),
          }
        : undefined,
      publisher,
    });
    return articleSchema ? [articleSchema] : [];
  }

  if (pageType === 'product') {
    // Product rich results require offers, reviews, or ratings. Our B2B inquiry
    // pages do not expose that data yet, so avoid emitting invalid Product JSON-LD.
    return [];
  }

  return [];
}

function buildBreadcrumbSchema(
  siteUrl: string,
  canonicalUrl: string,
  locale: Locale,
  breadcrumbs: BreadcrumbMetaItem[] | undefined
): JsonLdNode | null {
  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) return null;

  const itemListElement = breadcrumbs.map((item, index) => {
    const href = firstNonEmpty(item.href);
    const itemUrl = href ? toAbsoluteUrl(siteUrl, /^https?:\/\//i.test(href) ? href : toHref(href, locale)) : canonicalUrl;
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: itemUrl,
    };
  });

  return toJsonLdNode({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  });
}

export function resolveSeoMeta(options: ResolveSeoMetaOptions): ResolvedSeoMeta {
  const fallbackOrigin = firstNonEmpty(options.currentOrigin, 'http://localhost');

  const siteUrl = normalizeSiteUrl(options.siteSeo?.siteUrl, fallbackOrigin);
  const imageUrl = resolveImageUrl(
    options.seo?.ogImage,
    options.seo?.twitterImage,
    options.seo?.metaImage,
    options.seoPage?.seo?.ogImage,
    options.seoPage?.seo?.twitterImage,
    options.seoPage?.seo?.metaImage,
    options.image,
    options.siteSeo?.defaultShareImage
  );
  const rawTitle = firstNonEmpty(
    options.seo?.metaTitle,
    options.seoPage?.seo?.metaTitle,
    options.title,
    options.seoPage?.title,
    options.siteSeo?.defaultTitle,
    options.siteSeo?.siteName,
    options.siteSeo?.companyName,
    'Gloris Auto'
  );
  const titleTemplate = firstNonEmpty(options.siteSeo?.titleTemplate);
  const templateTitle = firstNonEmpty(options.title, options.seoPage?.title);
  const explicitMetaTitle = firstNonEmpty(options.seo?.metaTitle, options.seoPage?.seo?.metaTitle);
  const title =
    explicitMetaTitle || !templateTitle || !titleTemplate.includes('%s')
      ? rawTitle
      : titleTemplate.replace('%s', templateTitle);
  const description = firstNonEmpty(
    options.seo?.metaDescription,
    options.seoPage?.seo?.metaDescription,
    options.description,
    options.siteSeo?.defaultDescription
  );
  const keywords = firstNonEmpty(
    options.seo?.metaKeywords,
    options.seo?.keywords,
    options.seoPage?.seo?.metaKeywords,
    options.seoPage?.seo?.keywords
  );
  const hideFromSearch =
    typeof options.seo?.hideFromSearch === 'boolean'
      ? options.seo.hideFromSearch
      : typeof options.seoPage?.seo?.hideFromSearch === 'boolean'
        ? options.seoPage.seo.hideFromSearch
        : false;
  const robots = hideFromSearch
    ? 'noindex,nofollow'
    : firstNonEmpty(
        options.seo?.metaRobots,
        options.seoPage?.seo?.metaRobots,
        options.siteSeo?.defaultRobots,
        'index,follow'
      );
  const viewport = firstNonEmpty(
    options.seo?.metaViewport,
    options.seoPage?.seo?.metaViewport,
    'width=device-width, initial-scale=1.0'
  );
  const canonicalUrl = resolveCanonicalUrl(
    siteUrl,
    options.pathname,
    options.seo?.canonicalURL || options.seoPage?.seo?.canonicalURL
  );
  const ogTitle = firstNonEmpty(options.seo?.ogTitle, options.seoPage?.seo?.ogTitle, title);
  const ogDescription = firstNonEmpty(
    options.seo?.ogDescription,
    options.seoPage?.seo?.ogDescription,
    description
  );
  const twitterTitle = firstNonEmpty(
    options.seo?.twitterTitle,
    options.seoPage?.seo?.twitterTitle,
    ogTitle
  );
  const twitterDescription = firstNonEmpty(
    options.seo?.twitterDescription,
    options.seoPage?.seo?.twitterDescription,
    ogDescription
  );
  const twitterCard = normalizeTwitterCard(
    options.seo?.twitterCard || options.seoPage?.seo?.twitterCard,
    Boolean(imageUrl)
  );
  const unlocalizedPath = stripLocalePrefix(options.pathname);
  const alternates = supportedLocales.map((locale) => ({
    hrefLang: localeToLanguageTag(locale),
    href: toAbsoluteUrl(siteUrl, toHref(unlocalizedPath, locale)),
  }));
  alternates.push({
    hrefLang: 'x-default',
    href: toAbsoluteUrl(siteUrl, toHref(unlocalizedPath, defaultLocale)),
  });

  const baseJsonLd = buildPageSchema({
    pageType: options.pageType,
    title,
    description,
    canonicalUrl,
    imageUrl,
    locale: options.locale,
    siteSeo: options.siteSeo,
    publishedTime: options.publishedTime,
    modifiedTime: options.modifiedTime,
    authorName: options.authorName,
  });
  const breadcrumbJsonLd = buildBreadcrumbSchema(siteUrl, canonicalUrl, options.locale, options.breadcrumbs);
  const extraJsonLdItems = Array.isArray(options.extraJsonLd)
    ? options.extraJsonLd
    : options.extraJsonLd
      ? [options.extraJsonLd]
      : [];
  const jsonLd = [...baseJsonLd, ...(breadcrumbJsonLd ? [breadcrumbJsonLd] : []), ...extraJsonLdItems]
    .map((item) => toJsonLdNode(item))
    .filter((item): item is JsonLdNode => item != null);

  return {
    title,
    description,
    keywords,
    robots,
    viewport,
    canonicalUrl,
    imageUrl,
    ogTitle,
    ogDescription,
    ogImage: imageUrl,
    ogType: resolveOgType(options.pageType),
    twitterTitle,
    twitterDescription,
    twitterImage: imageUrl,
    twitterCard,
    siteUrl,
    alternates,
    jsonLd,
  };
}
