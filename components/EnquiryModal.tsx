'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { FiX, FiPlus, FiMinus, FiPackage } from 'react-icons/fi';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/utils';

interface ProductSelection {
  productId: string;
  productTitle: string;
  category: string;
  fruitName: string;
  size: string;
  quantity: string;
  price?: string;
}

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export default function EnquiryModal({ isOpen, onClose, product }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
  });
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch all products for selection
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products: Product[] = [];
      productsSnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      setAllProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Initialize with single product if provided
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (product) {
        const initialSelection: ProductSelection = {
          productId: product.id || '',
          productTitle: product.title || '',
          category: product.category || '',
          fruitName: '',
          size: '',
          quantity: '',
          price: ''
        };
        setSelectedProducts([initialSelection]);
      } else {
        setSelectedProducts([]);
      }
    }
  }, [isOpen, product]);

  const addProduct = () => {
    const newSelection: ProductSelection = {
      productId: '',
      productTitle: '',
      category: '',
      fruitName: '',
      size: '',
      quantity: '',
      price: ''
    };
    setSelectedProducts([...selectedProducts, newSelection]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductSelection, value: string) => {
    const updatedSelections = [...selectedProducts];
    updatedSelections[index] = { ...updatedSelections[index], [field]: value };

    // Auto-populate fields when product is selected
    if (field === 'productId' && value) {
      const selectedProduct = allProducts.find(p => p.id === value);
      if (selectedProduct) {
        updatedSelections[index].productTitle = selectedProduct.title || '';
        updatedSelections[index].category = selectedProduct.category || '';
        updatedSelections[index].fruitName = '';
        updatedSelections[index].size = '';
        updatedSelections[index].price = '';
      }
    }

    // Auto-populate price when size is selected
    if (field === 'size' && value) {
      const selectedProduct = allProducts.find(p => p.id === updatedSelections[index].productId);
      if (selectedProduct?.sizeOptions) {
        const sizeOption = selectedProduct.sizeOptions.find(opt => opt.size === value);
        if (sizeOption?.price) {
          updatedSelections[index].price = sizeOption.price;
        }
      }
    }

    setSelectedProducts(updatedSelections);
  };

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

    // Validate each selected product
    for (let i = 0; i < selectedProducts.length; i++) {
      const selection = selectedProducts[i];
      if (!selection.productId) {
        setError(`Please select a product for item ${i + 1}`);
        return;
      }
      if (!selection.fruitName) {
        setError(`Please select fruit type for item ${i + 1}`);
        return;
      }
      if (!selection.size) {
        setError(`Please select size for item ${i + 1}`);
        return;
      }
      if (!selection.quantity) {
        setError(`Please enter quantity for item ${i + 1}`);
        return;
      }
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
          selectedProducts,
          // For backward compatibility
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

      console.log('Inquiry submitted successfully:', data);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', email: '', phone: '', city: '', message: '' });
        setSelectedProducts([]);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Send Inquiry
          </h2>
          {product && (
            <p className="text-gray-600 mb-4">for {product.title}</p>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-semibold">Inquiry sent successfully!</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-primary-600">👤</span> Your Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name *"
                        required
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email *"
                        required
                        className="input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone *"
                        required
                        className="input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City *"
                        required
                        className="input"
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
                      <span className="text-primary-600">🛍️</span> Product Selection
                    </h3>
                    <button
                      type="button"
                      onClick={addProduct}
                      className="btn btn-outline text-sm flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>

                  {selectedProducts.length === 0 && (
                    <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <FiPackage className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">No products selected. Click "Add Product" to start.</p>
                    </div>
                  )}

                  {selectedProducts.map((selection, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 text-sm">Product {index + 1}</h4>
                        {selectedProducts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Product and Fruit in same row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <select
                              required
                              className="input text-sm"
                              value={selection.productId}
                              onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                            >
                              <option value="">Select Product</option>
                              {allProducts.map((prod) => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            {selection.productId ? (
                              <select
                                required
                                className="input text-sm"
                                value={selection.fruitName}
                                onChange={(e) => updateProduct(index, 'fruitName', e.target.value)}
                              >
                                <option value="">Select Fruit</option>
                                {allProducts
                                  .find(p => p.id === selection.productId)
                                  ?.sizeOptions?.map((option, optIndex) => (
                                    <option key={optIndex} value={option.fruits}>
                                      {option.fruits}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                required
                                className="input text-sm"
                                placeholder="Fruit type"
                                value={selection.fruitName}
                                onChange={(e) => updateProduct(index, 'fruitName', e.target.value)}
                              />
                            )}
                          </div>
                        </div>

                        {/* Size and Quantity in same row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            {selection.productId ? (
                              <select
                                required
                                className="input text-sm"
                                value={selection.size}
                                onChange={(e) => updateProduct(index, 'size', e.target.value)}
                              >
                                <option value="">Select Size</option>
                                {allProducts
                                  .find(p => p.id === selection.productId)
                                  ?.sizeOptions?.filter(opt => !selection.fruitName || opt.fruits === selection.fruitName)
                                  .map((option, optIndex) => (
                                    <option key={optIndex} value={option.size}>
                                      {option.size} {option.price && `- ₹${option.price}`}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                required
                                className="input text-sm"
                                placeholder="Size"
                                value={selection.size}
                                onChange={(e) => updateProduct(index, 'size', e.target.value)}
                              />
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              required
                              className="input text-sm"
                              placeholder="Quantity"
                              value={selection.quantity}
                              onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Price Display */}
                        {selection.price && (
                          <div className="text-sm text-primary-600 font-medium">
                            Price: ₹{selection.price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Notes */}
                <div>
                  <textarea
                    placeholder="Additional Notes (Optional)"
                    rows={3}
                    className="input"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || selectedProducts.length === 0}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : `Send Inquiry (${selectedProducts.length} ${selectedProducts.length === 1 ? 'product' : 'products'})`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
