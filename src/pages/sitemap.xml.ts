import type { APIRoute } from 'astro';
import { getResolvedSiteUrl } from '@/utils/siteConfig';
import { buildSitemapEntries, renderSitemapXml } from '@/utils/sitemap';

export const GET: APIRoute = async () => {
  const siteUrl = await getResolvedSiteUrl();
  const entries = await buildSitemapEntries(siteUrl);
  const xml = renderSitemapXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
