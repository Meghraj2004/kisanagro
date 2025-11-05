'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';
import { FiPhone, FiMail, FiPackage, FiShield, FiTruck, FiAward } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import EnquiryModal from '@/components/EnquiryModal';
import FeaturedProducts from '@/components/FeaturedProducts';
import InquiryCartFloating from '@/components/InquiryCartFloating';
import { Product } from '@/types';
import { siteConfig } from '@/lib/config';

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const handleEnquiry = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 section-padding">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="heading-xl text-gray-900 mb-6">
                Premium Agriculture
                <span className="text-gradient"> Fruit Foam Nets</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Protect your fruits with our high-quality foam nets. Leading manufacturer and supplier of protective packaging solutions for agriculture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn btn-primary">
                  View Products
                </Link>
                <a href={`tel:${siteConfig.phone}`} className="btn btn-outline">
                  <FiPhone className="mr-2" />
                  Contact Us
                </a>
              </div>
            </div>
            <div className="relative h-96 animate-slide-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl rotate-6"></div>
              <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <FiPackage className="w-32 h-32 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <h2 className="heading-lg text-center text-gray-900 mb-12">
            Why Choose KisanAgro?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FiShield,
                title: 'Premium Quality',
                description: 'Top-grade materials for maximum fruit protection',
              },
              {
                icon: FiTruck,
                title: 'Fast Delivery',
                description: 'Quick and reliable delivery across India',
              },
              {
                icon: FiAward,
                title: 'Trusted Brand',
                description: 'Years of experience in agriculture packaging',
              },
              {
                icon: FiPackage,
                title: 'Custom Solutions',
                description: 'Tailored packaging for your specific needs',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:border-primary-500 border-2 border-transparent transition-all"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts onEnquiry={handleEnquiry} />

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-500 text-white">
        <div className="container text-center">
          <h2 className="heading-lg mb-6">Ready to Protect Your Fruits?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get in touch with us today for premium quality fruit foam nets and custom packaging solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="btn bg-white text-primary-600 hover:bg-gray-100"
            >
              <FiMail className="mr-2" />
              Send Inquiry
            </button>
            <a href={`tel:${siteConfig.phone}`} className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600">
              <FiPhone className="mr-2" />
              Call Now
            </a>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
