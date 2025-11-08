'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import { FiX, FiPlus, FiMinus, FiPackage } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

interface ProductSelection {
  productId: string;
  productTitle: string;
  category: string;
  fruitName: string;
  size: string;
  quantity: string;
  price?: string;
}

interface WhatsAppInquiryModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppInquiryModal({ product, isOpen, onClose }: WhatsAppInquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    additionalNotes: '',
  });
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch all products when modal opens
  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      fetchProducts();
    }
  }, [isOpen]);

  // Initialize with single product if provided
  useEffect(() => {
    if (product && selectedProducts.length === 0) {
      const initialSelection: ProductSelection = {
        productId: product.id,
        productTitle: product.title,
        category: product.category,
        fruitName: product.sizeOptions?.[0]?.fruits || '',
        size: product.sizeOptions?.[0]?.size || '',
        quantity: '',
        price: product.sizeOptions?.[0]?.price || '',
      };
      setSelectedProducts([initialSelection]);
    }
  }, [product]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const products: Product[] = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      setAllProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!isOpen) return null;

  const addProduct = () => {
    const newSelection: ProductSelection = {
      productId: '',
      productTitle: '',
      category: '',
      fruitName: '',
      size: '',
      quantity: '',
      price: '',
    };
    setSelectedProducts([...selectedProducts, newSelection]);
  };

  const removeProduct = (index: number) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updated);
  };

  const updateProduct = (index: number, field: keyof ProductSelection, value: string) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };

    // If product is changed, update related fields
    if (field === 'productId') {
      const selectedProduct = allProducts.find(p => p.id === value);
      if (selectedProduct) {
        updated[index].productTitle = selectedProduct.title;
        updated[index].category = selectedProduct.category;
        updated[index].fruitName = selectedProduct.sizeOptions?.[0]?.fruits || '';
        updated[index].size = selectedProduct.sizeOptions?.[0]?.size || '';
        updated[index].price = selectedProduct.sizeOptions?.[0]?.price || '';
      }
    }

    // If fruit type is changed, update size options
    if (field === 'fruitName') {
      const selectedProduct = allProducts.find(p => p.id === updated[index].productId);
      const matchingOption = selectedProduct?.sizeOptions?.find(opt => opt.fruits === value);
      if (matchingOption) {
        updated[index].size = matchingOption.size;
        updated[index].price = matchingOption.price || '';
      }
    }

    setSelectedProducts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    // Professional message format for WhatsApp Business
    let message = `🌟 *PRODUCT INQUIRY - KISANAGRO* 🌟

🙋‍♂️ *Customer Information:*
👤 Name: *${formData.name}*
📱 Phone: *${formData.phone}*

📦 *Products Required:*`;

    selectedProducts.forEach((selection, index) => {
      message += `

${index + 1}️⃣ *${selection.productTitle}*
    📏 Size: ${selection.size}
    🔢 Quantity: ${selection.quantity}`;
      if (selection.price) {
        message += `
    💰 Price: ₹${selection.price}`;
      }
    });

    if (formData.additionalNotes) {
      message += `

📝 *Special Requirements:*
${formData.additionalNotes}`;
    }

    message += `

━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *Please provide:*
💰 Best pricing for bulk orders
📦 Product availability & delivery time
🚛 Shipping charges to my location

⏰ *Inquiry Date:* ${new Date().toLocaleDateString('en-IN')}

🔥 *Looking forward to your best quotation!*
Thank you! 🙏`;

    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || '7249261176';
    
    // For WhatsApp Business compatibility, try different formats
    const formattedPhone = adminPhone.startsWith('91') ? adminPhone : `91${adminPhone}`;
    
    try {
      const encodedMessage = encodeURIComponent(message.trim());
      let whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      
      // If URL is too long, use shorter message
      if (whatsappUrl.length > 2000) {
        const shortMessage = `Hi! I'm ${formData.name} (${formData.phone}). Interested in ${selectedProducts.length} product(s). Please contact me.`;
        whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(shortMessage)}`;
      }
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      // Fallback: Open WhatsApp without message
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      additionalNotes: '',
    });
    setSelectedProducts([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaWhatsapp className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">WhatsApp Inquiry</h2>
                <p className="text-green-100 text-sm">Send your requirements directly</p>
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

        {/* Header Info */}
        {product && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex items-center gap-4">
              {product.images[0] && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary-200">
                  {product.images[0].startsWith('data:') ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{product.title}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                {product.priceRange && (
                  <p className="text-sm font-medium text-primary-600 mt-1">
                    ₹{product.priceRange.min} – ₹{product.priceRange.max}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
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
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <FiPackage className="w-8 h-8 mx-auto mb-2" />
                <p>No products selected. Click "Add Product" to start.</p>
              </div>
            )}

            {selectedProducts.map((selection, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      required
                      className="input text-sm"
                      value={selection.productId}
                      onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {allProducts.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.title} - {prod.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fruit Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fruit Type *
                    </label>
                    {selection.productId ? (
                      <select
                        required
                        className="input text-sm"
                        value={selection.fruitName}
                        onChange={(e) => updateProduct(index, 'fruitName', e.target.value)}
                      >
                        <option value="">Select Fruit Type</option>
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
                        placeholder="e.g., Guava"
                        value={selection.fruitName}
                        onChange={(e) => updateProduct(index, 'fruitName', e.target.value)}
                      />
                    )}
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size *
                    </label>
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
                        placeholder="e.g., 40x80x180 mm"
                        value={selection.size}
                        onChange={(e) => updateProduct(index, 'size', e.target.value)}
                      />
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      required
                      className="input text-sm"
                      placeholder="e.g., 10,000 pieces"
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
            ))}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              className="input"
              placeholder="Any special requirements or questions..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedProducts.length === 0}
              className="btn bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaWhatsapp className="w-5 h-5" />
              Send Inquiry ({selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'})
            </button>
          </div>

          {/* Info Note */}
          <p className="text-xs text-center text-gray-500 pt-2">
            🔒 Your information will be sent securely via WhatsApp
          </p>
        </form>
      </div>
    </div>
  );
}
