export const siteConfig = {
  name: 'KisanAgro',
  title: 'KisanAgro - Premium Agriculture Fruit Foam Net Manufacturer & Supplier',
  description: 'Leading manufacturer and supplier of high-quality agriculture fruit foam nets and protective packaging solutions. Protect your fruits during transport and storage with our premium foam nets.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kisanagro.com',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Your Business Address, City, State, PIN',
  phone: process.env.ADMIN_PHONE || '9421612110',
  email: process.env.ADMIN_EMAIL || 'megharaj2004.ai@gmail.com',
  keywords: [
    'agriculture fruit foam net',
    'fruit foam net manufacturer',
    'fruit protection net',
    'foam net supplier',
    'agriculture packaging',
    'fruit packaging material',
    'protective foam net',
    'fruit net India',
    'EPE foam net',
    'fruit safety net',
  ],
  categories: [
    'Fruit Foam Nets',
    'Protective Packaging',
    'EPE Foam Products',
    'Agricultural Nets',
    'Custom Solutions',
  ],
  ogImage: '/og-image.jpg',
  twitterHandle: '@kisanagro',
};

export const navigationLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const adminLinks = [
  { name: 'Products', href: '/admin/products', icon: 'FiPackage' },
  { name: 'Inquiries', href: '/admin/inquiries', icon: 'FiMail' },
  { name: 'Profile', href: '/admin/profile', icon: 'FiUser' },
];
