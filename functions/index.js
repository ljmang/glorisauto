import { redirectToVisitorHome } from '../src/i18n/visitorLocale.ts';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.pathname !== '/' || (request.method !== 'GET' && request.method !== 'HEAD')) {
    return context.next();
  }
  return redirectToVisitorHome(request, url);
}
