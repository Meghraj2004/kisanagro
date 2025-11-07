'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import Image from 'next/image';
import { FiPhone, FiMail, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import EnquiryModal from '@/components/EnquiryModal';
import WhatsAppInquiryModal from '@/components/WhatsAppInquiryModal';
import { generateProductSchema } from '@/lib/metadata';
import { siteConfig } from '@/lib/config';
import PhoneSelector from '@/components/PhoneSelector';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const q = query(collection(db, 'products'), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setProduct({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container section-padding">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section-padding">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <a href="/products" className="btn btn-primary">Back to Products</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductSchema(product)) }}
      />

      <section className="container section-padding">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative h-96 mb-4 rounded-xl overflow-hidden bg-gray-100">
              {product.images[selectedImage] ? (
                product.images[selectedImage].startsWith('data:') ? (
                  // Base64 image
                  <img
                    src={product.images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // URL image
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                  >
                    {image.startsWith('data:') ? (
                      <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <Image src={image} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-primary-600 font-medium mb-2">{product.category}</p>
            <h1 className="heading-lg text-gray-900 mb-4">{product.title}</h1>
            
            {/* Pricing */}
            {product.priceRange && (
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{product.priceRange.min} – ₹{product.priceRange.max}
                </p>
                {product.minQuantity && (
                  <p className="text-sm text-gray-600 mt-1">
                    Min. Quantity ({product.minQuantity})
                  </p>
                )}
              </div>
            )}

            <p className="text-gray-700 text-lg mb-6">{product.description}</p>

            {/* Size Options Table */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="mb-6 overflow-hidden border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 p-4 bg-gray-50 border-b">
                  CHOOSE SIZE:
                </h3>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fruits</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Choose Size</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {product.sizeOptions.map((option, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{option.fruits}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{option.size}</td>
                        <td className="px-4 py-3 text-sm text-primary-600 font-semibold">
                          {option.price ? `₹${option.price}` : 'Contact for Price'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setWhatsappModalOpen(true)} 
                className="btn bg-green-600 hover:bg-green-700 text-white text-lg py-4"
              >
                <FaWhatsapp className="mr-2 w-6 h-6" />
                Send Inquiry on WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setModalOpen(true)} 
                  className="btn btn-outline"
                >
                  <FiMail className="mr-2" />
                  Email Inquiry
                </button>
                <PhoneSelector buttonStyle="outline">
                  <FiPhone className="mr-2" />
                  Call Now
                </PhoneSelector>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
      />

      <WhatsAppInquiryModal
        product={product}
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
      />
    </>
  );
}
