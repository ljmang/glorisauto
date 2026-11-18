import { defaultLocale, isValidLocale, type Locale } from './config.ts';

type VisitorRequest = Request & { cf?: { country?: string | null } };

const COUNTRY_LOCALE: Partial<Record<string, Locale>> = {
  CN: 'zh-cn',
  JP: 'ja',
  VN: 'vi',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  BO: 'es',
  CL: 'es',
  CO: 'es',
  CR: 'es',
  CU: 'es',
  DO: 'es',
  EC: 'es',
  SV: 'es',
  GT: 'es',
  HN: 'es',
  NI: 'es',
  PA: 'es',
  PY: 'es',
  PE: 'es',
  PR: 'es',
  UY: 'es',
  VE: 'es',
  AE: 'ar',
  BH: 'ar',
  DZ: 'ar',
  EG: 'ar',
  IQ: 'ar',
  JO: 'ar',
  KW: 'ar',
  LB: 'ar',
  LY: 'ar',
  MA: 'ar',
  OM: 'ar',
  PS: 'ar',
  QA: 'ar',
  SA: 'ar',
  SD: 'ar',
  SY: 'ar',
  TN: 'ar',
  YE: 'ar',
};

export function getCountryLocale(request: VisitorRequest): Locale | null {
  const country = (
    request.cf?.country || request.headers.get('CF-IPCountry') || ''
  ).toUpperCase();
  return COUNTRY_LOCALE[country] ?? null;
}

function getSavedLocale(cookieHeader: string | null): Locale | null {
  const match = cookieHeader?.match(/(?:^|;\s*)gloris_locale=([^;]+)/);
  if (!match) return null;

  try {
    const locale = decodeURIComponent(match[1]);
    return isValidLocale(locale) ? locale : null;
  } catch {
    return null;
  }
}

export function redirectToVisitorHome(request: VisitorRequest, url: URL): Response {
  const locale = getSavedLocale(request.headers.get('Cookie')) ?? getCountryLocale(request) ?? defaultLocale;
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${locale}/${url.search}`,
      'Cache-Control': 'private, no-store',
    },
  });
}
