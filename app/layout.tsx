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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
