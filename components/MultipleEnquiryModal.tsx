'use client';

import { useState } from 'react';
import { FiX, FiPackage, FiMail } from 'react-icons/fi';
import { Product, ProductInquiryItem } from '@/types';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/utils';
import ProductSelectionModal from './ProductSelectionModal';

interface MultipleEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product;
}

export default function MultipleEnquiryModal({ 
  isOpen, 
  onClose, 
  initialProduct 
}: MultipleEnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<ProductInquiryItem[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initialize with single product if provided
  useState(() => {
    if (initialProduct && selectedProducts.length === 0) {
      const initialProductItem: ProductInquiryItem = {
        productId: initialProduct.id,
        productTitle: initialProduct.title,
        fruitName: initialProduct.sizeOptions?.[0]?.fruits || '',
        size: initialProduct.sizeOptions?.[0]?.size || '',
        quantity: '',
      };
      setSelectedProducts([initialProductItem]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    // Validate all products have required fields
    const incompleteProducts = selectedProducts.filter(p => !p.fruitName || !p.size || !p.quantity);
    if (incompleteProducts.length > 0) {
      setError('Please fill all fields for selected products');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: sanitizeInput(formData.name),
          city: sanitizeInput(formData.city),
          message: sanitizeInput(formData.message),
          products: selectedProducts, // Send multiple products
          // Legacy fields for backward compatibility (use first product if available)
          productId: selectedProducts[0]?.productId,
          productTitle: selectedProducts[0]?.productTitle,
          fruitName: selectedProducts[0]?.fruitName,
          size: selectedProducts[0]?.size,
          quantity: selectedProducts[0]?.quantity,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Inquiry submission failed:', data);
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      console.log('Multiple product inquiry submitted successfully:', data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ 
          name: '', 
          email: '', 
          phone: '', 
          city: '', 
          message: '' 
        });
        setSelectedProducts([]);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (products: ProductInquiryItem[]) => {
    setSelectedProducts(products);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-500 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiMail className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Send Inquiry</h2>
                    <p className="text-primary-100 text-sm">Multiple products inquiry</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 mx-6 mt-6 rounded-md">
                <p className="font-medium">✅ Inquiry sent successfully!</p>
                <p className="text-sm">We'll get back to you soon.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mx-6 mt-6 rounded-md">
                <p className="font-medium">❌ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-primary-600">👤</span> Your Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="input"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="input"
                      placeholder="e.g., 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-primary-600">🛍️</span> Selected Products
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowProductSelector(true)}
                    className="btn btn-outline text-sm py-2 px-3 flex items-center gap-2"
                  >
                    <FiPackage className="w-4 h-4" />
                    {selectedProducts.length === 0 ? 'Select Products' : 'Modify Selection'}
                  </button>
                </div>

                {selectedProducts.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">No products selected</p>
                    <button
                      type="button"
                      onClick={() => setShowProductSelector(true)}
                      className="btn btn-primary"
                    >
                      Select Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map((product, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.productTitle}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <p><span className="font-medium">Type:</span> {product.fruitName}</p>
                              <p><span className="font-medium">Size:</span> {product.size}</p>
                              <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-600">
                        {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  rows={4}
                  className="input"
                  placeholder="Any special requirements, questions, or additional information..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedProducts.length === 0}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMail className="w-4 h-4" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </div>

              {/* Info Note */}
              <p className="text-xs text-center text-gray-500 pt-2">
                🔒 Your information will be sent securely and handled with privacy
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        onConfirm={handleProductSelection}
        initialProducts={selectedProducts}
      />
    </>
  );
}