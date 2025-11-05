'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, InquiryProduct } from '@/types';

interface SelectedProduct {
  product: Product;
  selectedSizes: {
    size: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
  }[];
}

interface InquiryCartContextType {
  selectedProducts: SelectedProduct[];
  addProduct: (product: Product, size: string, quantity: number, unit: string, pricePerUnit: number) => void;
  removeProduct: (productId: string) => void;
  updateProductQuantity: (productId: string, sizeIndex: number, quantity: number) => void;
  removeProductSize: (productId: string, sizeIndex: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getFormattedProducts: () => InquiryProduct[];
}

const InquiryCartContext = createContext<InquiryCartContextType | undefined>(undefined);

export const useInquiryCart = () => {
  const context = useContext(InquiryCartContext);
  if (!context) {
    throw new Error('useInquiryCart must be used within InquiryCartProvider');
  }
  return context;
};

interface InquiryCartProviderProps {
  children: React.ReactNode;
}

export const InquiryCartProvider: React.FC<InquiryCartProviderProps> = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const addProduct = useCallback((product: Product, size: string, quantity: number, unit: string, pricePerUnit: number) => {
    setSelectedProducts(prev => {
      const existingProductIndex = prev.findIndex(p => p.product.id === product.id);
      
      if (existingProductIndex >= 0) {
        // Product exists, check if size already added
        const existingProduct = prev[existingProductIndex];
        const existingSizeIndex = existingProduct.selectedSizes.findIndex(s => s.size === size);
        
        if (existingSizeIndex >= 0) {
          // Size exists, update quantity
          const updated = [...prev];
          updated[existingProductIndex].selectedSizes[existingSizeIndex].quantity += quantity;
          return updated;
        } else {
          // Size doesn't exist, add new size
          const updated = [...prev];
          updated[existingProductIndex].selectedSizes.push({
            size,
            quantity,
            unit,
            pricePerUnit
          });
          return updated;
        }
      } else {
        // New product
        return [...prev, {
          product,
          selectedSizes: [{
            size,
            quantity,
            unit,
            pricePerUnit
          }]
        }];
      }
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.product.id !== productId));
  }, []);

  const updateProductQuantity = useCallback((productId: string, sizeIndex: number, quantity: number) => {
    if (quantity <= 0) return;
    
    setSelectedProducts(prev => {
      const updated = [...prev];
      const productIndex = updated.findIndex(p => p.product.id === productId);
      
      if (productIndex >= 0 && updated[productIndex].selectedSizes[sizeIndex]) {
        updated[productIndex].selectedSizes[sizeIndex].quantity = quantity;
      }
      
      return updated;
    });
  }, []);

  const removeProductSize = useCallback((productId: string, sizeIndex: number) => {
    setSelectedProducts(prev => {
      const updated = [...prev];
      const productIndex = updated.findIndex(p => p.product.id === productId);
      
      if (productIndex >= 0) {
        updated[productIndex].selectedSizes.splice(sizeIndex, 1);
        
        // If no sizes left, remove the product entirely
        if (updated[productIndex].selectedSizes.length === 0) {
          updated.splice(productIndex, 1);
        }
      }
      
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return selectedProducts.reduce((total, product) => {
      return total + product.selectedSizes.reduce((sum, size) => sum + size.quantity, 0);
    }, 0);
  }, [selectedProducts]);

  const getFormattedProducts = useCallback((): InquiryProduct[] => {
    return selectedProducts.map(item => ({
      productId: item.product.id,
      productTitle: item.product.title,
      selectedSizes: item.selectedSizes.map(size => ({
        size: size.size,
        quantity: size.quantity,
        unit: size.unit,
      }))
    }));
  }, [selectedProducts]);

  const value: InquiryCartContextType = {
    selectedProducts,
    addProduct,
    removeProduct,
    updateProductQuantity,
    removeProductSize,
    clearCart,
    getTotalItems,
    getFormattedProducts
  };

  return (
    <InquiryCartContext.Provider value={value}>
      {children}
    </InquiryCartContext.Provider>
  );
};