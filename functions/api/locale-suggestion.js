import { getCountryLocale } from '../../src/i18n/visitorLocale.ts';

export function onRequest({ request }) {
  return new Response(JSON.stringify({ locale: getCountryLocale(request) }), {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
