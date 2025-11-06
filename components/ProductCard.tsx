'use client';

import { useState, memo } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMail, FiShoppingCart, FiPackage } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import WhatsAppInquiryModal from './WhatsAppInquiryModal';

interface ProductCardProps {
  product: Product;
  onEnquiry: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

function ProductCardComponent({ product, onEnquiry, onAddToCart }: ProductCardProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${process.env.NEXT_PUBLIC_ADMIN_PHONE || '9421612110'}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
          {product.images[0] ? (
            product.images[0].startsWith('data:') ? (
              // Base64 image
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              // URL image
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                quality={75}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <FiPackage className="w-12 h-12" />
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        
        {/* Pricing */}
        <div className="mb-3">
          {product.priceRange ? (
            <p className="text-lg font-bold text-primary-600">
              ₹{product.priceRange.min} – ₹{product.priceRange.max}
            </p>
          ) : product.sizeOptions && product.sizeOptions.length > 0 ? (
            <p className="text-lg font-bold text-primary-600">
              ₹{Math.min(...product.sizeOptions.map(s => parseFloat(s.price) || 0))} – ₹{Math.max(...product.sizeOptions.map(s => parseFloat(s.price) || 0))}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Price on inquiry</p>
          )}
        </div>
        
        {/* Size Options Preview */}
        {product.sizeOptions && product.sizeOptions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Available sizes:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizeOptions.slice(0, 2).map((option, index) => (
                <span key={index} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full border">
                  {option.size}
                </span>
              ))}
              {product.sizeOptions.length > 2 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  +{product.sizeOptions.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {product.description || 'Are you looking for an efficient and reliable solution for...'}
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary Inquiry Button */}
          <button
            onClick={() => onEnquiry(product)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <FiMail className="w-4 h-4" />
            Inquiry
          </button>
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCall}
              className="flex-1 border border-green-500 text-green-600 hover:bg-green-50 font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <FiPhone className="w-4 h-4" />
              Call
            </button>
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-md transition-colors duration-200 flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-4 h-4" />
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

// Memoize the component for better performance
const ProductCard = memo(ProductCardComponent);

export default ProductCard;
