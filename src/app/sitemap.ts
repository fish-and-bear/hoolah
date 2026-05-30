import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE = 'https://hoolah.hapinas.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ['', '/about', '/rules', '/archive'];
  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
