import { supportedLocales } from '@/i18n/config';
import { api, fetchApi } from '@/utils/strapiApi';

interface InsightPublicationRecord {
  documentId?: string;
  publishedAt?: string | null;
}

interface InsightPublicationResponse {
  data?: InsightPublicationRecord[];
  meta?: {
    pagination?: {
      pageCount?: number;
    };
  };
}

const PAGE_SIZE = 100;
const CACHE_TTL_MS = 60_000;
let cachedPublicationDates: { expiresAt: number; value: Map<string, number> } | undefined;
let firstPublishedAtByDocumentIdPromise: Promise<Map<string, number>> | undefined;

// Localized versions can be published at different times; use one shared first-published date per document.
async function fetchPublishedInsightsForLocale(locale: string): Promise<InsightPublicationRecord[]> {
  const fetchPage = (page: number) =>
    fetchApi<InsightPublicationResponse>(api.insights, {
      locale,
      fields: ['documentId', 'publishedAt'],
      pagination: { page, pageSize: PAGE_SIZE },
    });

  const firstPage = await fetchPage(1);
  const records = [...(firstPage.data ?? [])];
  const pageCount = Math.max(1, firstPage.meta?.pagination?.pageCount ?? 1);

  if (pageCount > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, index) => fetchPage(index + 2))
    );
    for (const page of remainingPages) records.push(...(page.data ?? []));
  }

  return records;
}

export function getInsightFirstPublishedAtByDocumentId(): Promise<Map<string, number>> {
  if (cachedPublicationDates && cachedPublicationDates.expiresAt > Date.now()) {
    return Promise.resolve(cachedPublicationDates.value);
  }

  if (!firstPublishedAtByDocumentIdPromise) {
    firstPublishedAtByDocumentIdPromise = (async () => {
      const localeResults = await Promise.all(
        supportedLocales.map(async (locale) => {
          try {
            return await fetchPublishedInsightsForLocale(locale);
          } catch {
            return [];
          }
        })
      );

      const dates = new Map<string, number>();
      for (const record of localeResults.flat()) {
        if (!record.documentId || !record.publishedAt) continue;

        const timestamp = Date.parse(record.publishedAt);
        if (!Number.isFinite(timestamp)) continue;

        const existing = dates.get(record.documentId);
        if (existing === undefined || timestamp < existing) dates.set(record.documentId, timestamp);
      }

      cachedPublicationDates = { expiresAt: Date.now() + CACHE_TTL_MS, value: dates };
      return dates;
    })().finally(() => {
      firstPublishedAtByDocumentIdPromise = undefined;
    });
  }

  return firstPublishedAtByDocumentIdPromise;
}

export function sortInsightsByPublicationDate<T extends InsightPublicationRecord>(
  insights: readonly T[],
  firstPublishedAtByDocumentId: ReadonlyMap<string, number>
): T[] {
  const getTimestamp = (insight: T): number | undefined => {
    const canonicalDate = insight.documentId
      ? firstPublishedAtByDocumentId.get(insight.documentId)
      : undefined;
    const timestamp = canonicalDate ?? (insight.publishedAt ? Date.parse(insight.publishedAt) : NaN);
    return Number.isFinite(timestamp) ? timestamp : undefined;
  };

  return [...insights].sort((a, b) => {
    const aDate = getTimestamp(a);
    const bDate = getTimestamp(b);
    if (aDate !== undefined && bDate !== undefined && aDate !== bDate) return bDate - aDate;
    if (aDate !== undefined && bDate === undefined) return -1;
    if (aDate === undefined && bDate !== undefined) return 1;
    return (a.documentId ?? '').localeCompare(b.documentId ?? '');
  });
}
