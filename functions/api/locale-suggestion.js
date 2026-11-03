const COUNTRY_LOCALE = {
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

export function onRequest({ request }) {
  const country = (
    request.cf?.country || request.headers.get('CF-IPCountry') || ''
  ).toUpperCase();
  const locale = COUNTRY_LOCALE[country] || null;

  return new Response(JSON.stringify({ locale }), {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
