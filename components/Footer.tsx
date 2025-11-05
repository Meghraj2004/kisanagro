'use client';

import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { siteConfig, navigationLinks } from '@/lib/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-heading font-bold mb-4">
              {siteConfig.name}
            </h3>
            <p className="text-sm mb-4">
              Leading manufacturer and supplier of high-quality agriculture fruit foam nets and protective packaging solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Facebook">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Twitter">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Instagram">
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {siteConfig.categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link href="/products" className="hover:text-primary-400 transition-colors">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span className="text-sm">{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="w-5 h-5" />
                <a href={`tel:${siteConfig.phone}`} className="hover:text-primary-400 transition-colors">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="w-5 h-5" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-primary-400 transition-colors text-sm">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>
            © {currentYear} {siteConfig.name}. All rights reserved. |{' '}
            <Link href="/admin/login" className="hover:text-primary-400 transition-colors">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
