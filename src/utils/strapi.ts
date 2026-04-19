/**
 * Strapi API 请求封装
 * 仅服务端/构建时使用（Astro getStaticPaths、页面顶层 await）
 */

/** 前端 locale → Strapi 后台 locale，须与 Settings → Internationalization 中一致 */
const STRAPI_LOCALE_MAP: Record<string, string> = {
  'en': 'en',
  'zh-cn': 'zh-cn',
  'ja': 'ja',
};

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toStrapiLocale(locale: string | undefined): string | undefined {
  if (!locale) return undefined;
  return STRAPI_LOCALE_MAP[locale] ?? locale;
}

const getBase = (): string => {
  if (
    import.meta.env.SSR &&
    typeof process !== 'undefined' &&
    typeof process.env.STRAPI_INTERNAL_URL === 'string' &&
    process.env.STRAPI_INTERNAL_URL
  ) {
    return process.env.STRAPI_INTERNAL_URL.replace(/\/$/, '');
  }

  if (
    import.meta.env.SSR &&
    typeof process !== 'undefined' &&
    typeof process.env.STRAPI_BUILD_URL === 'string' &&
    process.env.STRAPI_BUILD_URL
  ) {
    return process.env.STRAPI_BUILD_URL.replace(/\/$/, '');
  }

  const url = import.meta.env.PUBLIC_STRAPI_URL;
  if (!url || typeof url !== 'string') {
    throw new Error('PUBLIC_STRAPI_URL is not set');
  }
  return url.replace(/\/$/, '');
};

const getFetchTimeoutMs = (): number => {
  const raw = import.meta.env.STRAPI_FETCH_TIMEOUT_MS;
  const value = Number(raw);
  if (Number.isFinite(value) && value > 0) return value;
  return 30000;
};

const getRetryCount = (): number => {
  if (
    import.meta.env.SSR &&
    typeof process !== 'undefined' &&
    typeof process.env.STRAPI_FETCH_RETRIES === 'string'
  ) {
    const runtimeValue = Number(process.env.STRAPI_FETCH_RETRIES);
    if (Number.isFinite(runtimeValue) && runtimeValue >= 0) return runtimeValue;
  }

  const raw = import.meta.env.STRAPI_FETCH_RETRIES;
  const value = Number(raw);
  if (Number.isFinite(value) && value >= 0) return value;
  return import.meta.env.PROD ? 3 : 1;
};

const getCacheTtlMs = (): number => {
  if (
    import.meta.env.SSR &&
    typeof process !== 'undefined' &&
    typeof process.env.STRAPI_CACHE_TTL_MS === 'string'
  ) {
    const runtimeValue = Number(process.env.STRAPI_CACHE_TTL_MS);
    if (Number.isFinite(runtimeValue) && runtimeValue >= 0) return runtimeValue;
  }

  const raw = import.meta.env.STRAPI_CACHE_TTL_MS;
  const value = Number(raw);
  if (Number.isFinite(value) && value >= 0) return value;
  return import.meta.env.PROD ? 60000 : 0;
};

function getCachedValue<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCachedValue<T>(key: string, value: T): void {
  const ttl = getCacheTtlMs();
  if (ttl <= 0) return;
  responseCache.set(key, {
    expiresAt: Date.now() + ttl,
    value,
  });
}

/** API 根地址，例如 https://admin.glorisauto.com/api */
export function getStrapiUrl(): string {
  return `${getBase()}/api`;
}

/** 媒体文件完整 URL：若已是完整 URL 则返回，否则拼上 R2 域名 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = 'https://assets.glorisauto.com';
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

export type PopulateValue = string | number | boolean | Record<string, PopulateValue>;
export interface FetchApiOptions {
  locale?: string;
  populate?: Record<string, PopulateValue> | string;
  filters?: Record<string, unknown>;
  pagination?: { page?: number; pageSize?: number };
  sort?: string | string[];
  headers?: Record<string, string>;
}

/**
 * 请求 Strapi REST API
 * 404 时不抛错，返回 { data: null }，由调用方做回退或空状态。
 */
export async function fetchApi<T = unknown>(
  path: string,
  options: FetchApiOptions = {}
): Promise<T> {
  const { locale, populate, filters, pagination, sort, headers: customHeaders = {} } = options;
  const base = getStrapiUrl();
  const pathClean = path.replace(/^\//, '');
  const url = new URL(`${base}/${pathClean}`);

  const strapiLocale = toStrapiLocale(locale);
  if (strapiLocale) url.searchParams.set('locale', strapiLocale);
  if (pagination?.pageSize != null) url.searchParams.set('pagination[pageSize]', String(pagination.pageSize));
  if (pagination?.page != null) url.searchParams.set('pagination[page]', String(pagination.page));
  if (sort) {
    if (Array.isArray(sort)) {
      sort.forEach((value, index) => {
        url.searchParams.set(`sort[${index}]`, value);
      });
    } else {
      url.searchParams.set('sort', sort);
    }
  }
  if (populate) {
    if (typeof populate === 'string') {
      url.searchParams.set('populate', populate);
    } else {
      // 递归处理嵌套的 populate 对象
      // Strapi v5 使用 qs 库解析嵌套对象
      // 对于组件：populate[componentName][on][componentType][populate][field]=true
      function setPopulateParams(obj: Record<string, unknown>, prefix: string = 'populate'): void {
        Object.entries(obj).forEach(([key, value]) => {
          if (value === true) {
            // true 表示 populate 该字段
            url.searchParams.set(`${prefix}[${key}]`, 'true');
          } else if (value === '*') {
            // * 表示 populate 所有关联
            url.searchParams.set(`${prefix}[${key}]`, '*');
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // 检查是否是 'on' 结构（用于组件类型）
            if ('on' in value) {
              // 处理组件类型：{ on: { 'component.type': { populate: {...} } } }
              const onObj = (value as { on: Record<string, unknown> }).on;
              Object.entries(onObj).forEach(([componentType, componentPopulate]) => {
                if (typeof componentPopulate === 'object' && componentPopulate !== null) {
                  setPopulateParams(
                    componentPopulate as Record<string, unknown>,
                    `${prefix}[${key}][on][${componentType}]`
                  );
                }
              });
            } else if ('populate' in value) {
              // 嵌套的 populate 对象：{ populate: '*' } 或 { populate: {...} }
              const populateValue = (value as { populate: unknown }).populate;
              if (populateValue === '*') {
                url.searchParams.set(`${prefix}[${key}][populate]`, '*');
              } else if (typeof populateValue === 'object' && populateValue !== null) {
                setPopulateParams(populateValue as Record<string, unknown>, `${prefix}[${key}][populate]`);
              }
            } else {
              // 普通的嵌套对象，递归处理
              setPopulateParams(value as Record<string, unknown>, `${prefix}[${key}]`);
            }
          } else {
            url.searchParams.set(`${prefix}[${key}]`, String(value));
          }
        });
      }
      setPopulateParams(populate);
    }
  }
  if (filters && Object.keys(filters).length > 0) {
    function setFilterParams(obj: Record<string, unknown>, prefix: string): void {
      Object.entries(obj).forEach(([key, value]) => {
        const paramKey = `${prefix}[${key}]`;
        if (Array.isArray(value)) {
          value.forEach((v, i) => {
            if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
              setFilterParams(v as Record<string, unknown>, `${paramKey}[${i}]`);
            } else {
              url.searchParams.set(`${paramKey}[${i}]`, String(v));
            }
          });
        } else if (value !== null && typeof value === 'object') {
          setFilterParams(value as Record<string, unknown>, paramKey);
        } else {
          url.searchParams.set(paramKey, String(value));
        }
      });
    }
    setFilterParams(filters as Record<string, unknown>, 'filters');
  }

  const requestKey = url.toString();
  const cached = getCachedValue<T>(requestKey);
  if (cached !== null) {
    return cached;
  }

  const existingRequest = inFlightRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const requestPromise = (async (): Promise<T> => {
    const timeoutMs = getFetchTimeoutMs();
    const maxRetries = getRetryCount();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(requestKey, {
          headers: { Accept: 'application/json', ...customHeaders },
          signal: controller.signal,
        });

        const contentType = res.headers.get('content-type') || '';
        let body: T;

        if (!contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Strapi API ${res.status}: Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
        }

        try {
          body = (await res.json()) as T;
        } catch (err) {
          const text = await res.text();
          throw new Error(`Strapi API ${res.status}: Failed to parse JSON response. Response: ${text.substring(0, 200)}`);
        }

        if (!res.ok) {
          if (res.status === 404) {
            setCachedValue(requestKey, body);
            return body;
          }

          if (res.status >= 500 && attempt < maxRetries) {
            await sleep(500 * (attempt + 1));
            continue;
          }

          throw new Error(`Strapi API ${res.status}: ${res.statusText} - ${JSON.stringify(body)}`);
        }

        setCachedValue(requestKey, body);
        return body;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = new Error(`Strapi API timeout after ${timeoutMs}ms: ${requestKey}`);
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }

        if (attempt >= maxRetries) {
          throw lastError;
        }

        await sleep(500 * (attempt + 1));
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError ?? new Error(`Strapi API request failed: ${requestKey}`);
  })();

  inFlightRequests.set(requestKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(requestKey);
  }
}
