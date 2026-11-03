const SUPPORTED_LOCALES = new Set(['en', 'zh-cn', 'ja', 'ar', 'es', 'vi']);

function getSavedLocale(cookieHeader) {
  const match = cookieHeader?.match(/(?:^|;\s*)gloris_locale=([^;]+)/);
  if (!match) return null;

  try {
    const locale = decodeURIComponent(match[1]);
    return SUPPORTED_LOCALES.has(locale) ? locale : null;
  } catch {
    return null;
  }
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return context.next();
  }

  const locale = getSavedLocale(request.headers.get('Cookie'));
  if (!locale) return context.next();

  const destination = new URL(request.url);
  destination.pathname = `/${locale}/`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
      'Cache-Control': 'private, no-store',
    },
  });
}
