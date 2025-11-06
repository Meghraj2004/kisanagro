import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

export async function GET() {
  const staticRoutes = [
    '',
    '/products',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const sitemap: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Add product pages (you can fetch from database if needed)
  // This is a placeholder - replace with actual product slugs from your database
  const productSlugs = ['premium-epe-foam-net', 'fruit-protection-net', 'agricultural-foam-net'];
  
  productSlugs.forEach((slug) => {
    sitemap.push({
      url: `${siteConfig.url}/products/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map((item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified instanceof Date ? item.lastModified.toISOString() : item.lastModified}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`)
  .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}