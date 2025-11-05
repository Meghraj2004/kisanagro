'use client';

import { useState } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMail, FiShoppingCart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import WhatsAppInquiryModal from './WhatsAppInquiryModal';

interface ProductCardProps {
  product: Product;
  onEnquiry: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onEnquiry, onAddToCart }: ProductCardProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${process.env.NEXT_PUBLIC_ADMIN_PHONE || '9421612110'}`;
  };

  return (
    <div className="card group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {product.images[0] ? (
            product.images[0].startsWith('data:') ? (
              // Base64 image
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              // URL image
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">{product.category}</p>
        
        {/* Pricing */}
        {product.priceRange && (
          <p className="text-lg font-bold text-primary-600 mb-2">
            ₹{product.priceRange.min} – ₹{product.priceRange.max}
          </p>
        )}
        
        {/* Size Options Preview */}
        {product.sizeOptions && product.sizeOptions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Available sizes:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizeOptions.slice(0, 3).map((option, index) => (
                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {option.size}
                  {option.price && ` - ₹${option.price}`}
                </span>
              ))}
              {product.sizeOptions.length > 3 && (
                <span className="text-xs text-gray-500">+{product.sizeOptions.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex flex-col gap-2">
          {/* Primary Action - Add to Cart if available */}
          {onAddToCart ? (
            <button
              onClick={() => onAddToCart(product)}
              className="btn btn-primary w-full text-sm"
            >
              <FiShoppingCart className="w-4 h-4 mr-2" />
              Add to Inquiry
            </button>
          ) : (
            <button
              onClick={() => onEnquiry(product)}
              className="btn btn-primary w-full text-sm"
            >
              <FiMail className="w-4 h-4 mr-2" />
              Enquiry
            </button>
          )}
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCall}
              className="btn btn-outline flex-1 text-sm"
            >
              <FiPhone className="w-4 h-4 mr-2" />
              Call
            </button>
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="btn bg-green-500 text-white hover:bg-green-600 text-sm"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Inquiry Modal */}
      <WhatsAppInquiryModal 
        product={product}
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </div>
  );
}
