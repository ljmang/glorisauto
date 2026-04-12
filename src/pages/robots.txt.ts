import type { APIRoute } from 'astro';
import { getResolvedSiteUrl } from '@/utils/siteConfig';

export const GET: APIRoute = async () => {
  const siteUrl = await getResolvedSiteUrl();
  const body = [
    '# Gloris Auto robots.txt',
    'User-agent: *',
    'Allow: /',
    'Content-Signal: search=yes,ai-train=no',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
