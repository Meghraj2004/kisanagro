'use client';

import { useState } from 'react';
import { FiShoppingCart, FiX, FiMinus, FiPlus, FiTrash2, FiMail, FiMessageCircle } from 'react-icons/fi';
import { useInquiryCart } from '@/contexts/InquiryCartContext';

interface InquiryCartFloatingProps {
  onEmailInquiry: () => void;
  onWhatsAppInquiry: () => void;
}

export default function InquiryCartFloating({ onEmailInquiry, onWhatsAppInquiry }: InquiryCartFloatingProps) {
  const { selectedProducts, getTotalItems, updateProductQuantity, removeProductSize, removeProduct } = useInquiryCart();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = getTotalItems();

  if (totalItems === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105"
        >
          <FiShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </button>
      </div>

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Selected Products</h2>
                <p className="text-sm text-gray-600">{totalItems} items selected</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {selectedProducts.map((item, productIndex) => (
                  <div key={item.product.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Product Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                        <p className="text-sm text-gray-600">{item.product.category}</p>
                      </div>
                      <button
                        onClick={() => removeProduct(item.product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selected Sizes */}
                    <div className="space-y-3">
                      {item.selectedSizes.map((size, sizeIndex) => (
                        <div key={sizeIndex} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{size.size}</p>
                            <p className="text-sm text-gray-600">₹{size.pricePerUnit.toFixed(2)} {size.unit}</p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => {
                                  if (size.quantity > 1) {
                                    updateProductQuantity(item.product.id, sizeIndex, size.quantity - 1);
                                  }
                                }}
                                className="p-2 hover:bg-gray-100"
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-2 min-w-[3rem] text-center">{size.quantity}</span>
                              <button
                                onClick={() => updateProductQuantity(item.product.id, sizeIndex, size.quantity + 1)}
                                className="p-2 hover:bg-gray-100"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeProductSize(item.product.id, sizeIndex)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onEmailInquiry();
                  }}
                  className="btn btn-outline flex items-center justify-center"
                >
                  <FiMail className="w-4 h-4 mr-2" />
                  Email Inquiry
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onWhatsAppInquiry();
                  }}
                  className="btn btn-primary flex items-center justify-center"
                >
                  <FiMessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}