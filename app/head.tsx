export default function Head() {
  return (
    <>
      {/* Enhanced SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#16a34a" />
      <meta name="msapplication-TileColor" content="#16a34a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="KisanAgro" />
      
      {/* Geo Location Tags */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <meta name="geo.placename" content="India" />
      
      {/* Business Information */}
      <meta name="classification" content="Agriculture, Manufacturing, Business" />
      <meta name="category" content="Agriculture Equipment, Packaging Solutions" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      
      {/* Link Tags */}
      <link rel="canonical" href="https://kisanagro.com" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/logo1.png" />
      <link rel="icon" type="image/png" href="/logo1.png" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Structured Data for Local Business */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "KisanAgro",
            "description": "Leading manufacturer and supplier of premium fruit foam nets and agricultural packaging solutions in India",
            "url": "https://kisanagro.com",
            "telephone": "9421612110",
            "email": "megharaj2004.ai@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN",
              "addressRegion": "India"
            },
            "priceRange": "$$",
            "servedCuisine": "Agricultural Products",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Fruit Foam Nets & Agricultural Packaging",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Premium Fruit Foam Net",
                    "description": "High-quality EPE foam nets for fruit protection"
                  }
                }
              ]
            },
            "areaServed": {
              "@type": "Country",
              "name": "India"
            },
            "sameAs": [
              "https://kisanagro.com"
            ]
          })
        }}
      />
    </>
  )
}