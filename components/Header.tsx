'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX, FiPhone } from 'react-icons/fi';
import { navigationLinks, siteConfig } from '@/lib/config';
import PhoneSelector from '@/components/PhoneSelector';
import logo from '../public/logo.png';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10  flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400">
              <img
                src={logo.src}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xl font-heading font-bold text-gray-900">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <PhoneSelector customButtonClass="btn btn-primary flex items-center gap-2">
              <FiPhone className="w-4 h-4" />
              Call Now
            </PhoneSelector>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4">
              <PhoneSelector customButtonClass="btn btn-primary w-full flex items-center justify-center gap-2">
                <FiPhone className="w-4 h-4" />
                Call Now
              </PhoneSelector>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
