import { Metadata } from 'next';
import { siteConfig } from './config';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  path?: string;
}

export const generateMetadata = ({
  title,
  description,
  keywords,
  ogImage,
  path = '',
}: GenerateMetadataProps = {}): Metadata => {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const metaDescription = description || siteConfig.description;
  const metaKeywords = keywords || siteConfig.keywords;
  const metaImage = ogImage || siteConfig.ogImage;
  const url = `${siteConfig.url}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage || '',
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage || ''],
      creator: siteConfig.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
};

export const generateProductSchema = (product: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'INR',
      url: `${siteConfig.url}/products/${product.slug}`,
    },
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
  };
};

export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '0', // Add your coordinates
      longitude: '0',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };
};
