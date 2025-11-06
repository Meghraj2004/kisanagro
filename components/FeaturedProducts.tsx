'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  onEnquiry: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

function FeaturedProductsComponent({ onEnquiry, onAddToCart }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Optimize: Use indexed query and limit results immediately
      const featuredQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(10) // Get a few more to filter featured ones
      );
      
      const snapshot = await getDocs(featuredQuery);
      
      if (snapshot.docs.length === 0) {
        setProducts([]);
        return;
      }

      const allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      
      // Filter featured products or show latest if none
      const featuredProducts = allProducts.filter(product => product.featured === true);
      const finalProducts = featuredProducts.length > 0 
        ? featuredProducts.slice(0, 6)
        : allProducts.slice(0, 6);
      
      setProducts(finalProducts);
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);



  if (loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-gray-900 mb-4">Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center">
            <h2 className="heading-lg text-gray-900 mb-4">Featured Products</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 text-sm">⚠️ Error loading products: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-red-700 underline text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center">
            <h2 className="heading-lg text-gray-900 mb-4">Featured Products</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-700 text-sm">📦 No products found in the database.</p>
              <p className="text-yellow-600 text-xs mt-1">Add some products from the admin panel first.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-gray-900 mb-4">Featured Products</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our premium collection of fruit protection and packaging solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEnquiry={onEnquiry}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/products" className="btn btn-outline">
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
}

// Memoize the component for better performance
const FeaturedProducts = memo(FeaturedProductsComponent);

export default FeaturedProducts;