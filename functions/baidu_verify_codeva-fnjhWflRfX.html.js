const VERIFICATION_TOKEN = '43c5c361edcae189df3066566c381c6b';

export function onRequest({ request }) {
  const headers = new Headers({
    'Cache-Control': 'public, max-age=3600',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });

  if (request.method === 'HEAD') {
    return new Response(null, { headers });
  }

  if (request.method !== 'GET') {
    headers.set('Allow', 'GET, HEAD');
    return new Response('Method Not Allowed', { status: 405, headers });
  }

  return new Response(VERIFICATION_TOKEN, { headers });
}
