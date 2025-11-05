import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/config';

export async function GET() {
  try {
    // For now, generate sitemap without dynamic products to avoid Firebase dependency during build
    // TODO: Add product URLs when Firebase is properly configured in production
    let products: any[] = [];
    
    // Only attempt to fetch products if we have Firebase configuration
    try {
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        products = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
      }
    } catch (error) {
      console.warn('Firebase not available for sitemap generation:', error);
      // Continue with empty products array
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteConfig.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteConfig.url}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteConfig.url}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteConfig.url}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ${products.map((product: any) => `
  <url>
    <loc>${siteConfig.url}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
