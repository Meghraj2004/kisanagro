import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import '../styles/globals.css';

export const metadata: Metadata = {
  ...generateMetadata(),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo1.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KisanAgro" />
        <link rel="apple-touch-icon" href="/logo1.png" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "KisanAgro",
              "alternateName": ["Kisan Agro", "KesanAgro"],
              "url": "https://kisanagro.com",
              "logo": "https://kisanagro.com/logo1.png",
              "description": "Leading manufacturer and supplier of premium fruit foam nets, agricultural packaging solutions, and protective fruit wrapping materials in India.",
              "foundingDate": "2020",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9421612110",
                "contactType": "Customer Service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://kisanagro.com"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Agricultural Packaging Products",
                "itemListElement": [
                  {
                    "@type": "OfferCatalog",
                    "name": "Fruit Foam Nets",
                    "description": "Premium quality fruit foam nets for protection during transport and storage"
                  },
                  {
                    "@type": "OfferCatalog", 
                    "name": "EPE Foam Products",
                    "description": "Eco-friendly EPE foam packaging solutions for agricultural products"
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
