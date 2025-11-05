'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  onEnquiry: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function FeaturedProducts({ onEnquiry, onAddToCart }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('🔍 Fetching all products...');
        
        // Fetch all products and filter client-side to avoid index issues
        const allProductsQuery = query(
          collection(db, 'products'),
          limit(20) // Get more to ensure we have enough featured ones
        );
        
        const allSnapshot = await getDocs(allProductsQuery);
        console.log(`📊 Found ${allSnapshot.docs.length} total products`);
        
        if (allSnapshot.docs.length === 0) {
          console.log('⚠️ No products in database at all!');
          setProducts([]);
          return;
        }

        const allProducts = allSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`Product: ${data.title}, featured: ${data.featured}, id: ${doc.id}`);
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
        }) as Product[];
        
        // Filter featured products client-side
        const featuredProducts = allProducts.filter(product => product.featured === true);
        console.log(`✨ Found ${featuredProducts.length} featured products out of ${allProducts.length} total`);
        
        let finalProducts: Product[] = [];
        
        if (featuredProducts.length > 0) {
          // Sort by creation date and take first 6
          finalProducts = featuredProducts
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 6);
          console.log(`🎯 Showing ${finalProducts.length} featured products`);
        } else {
          console.log('⚠️ No featured products found, showing latest products...');
          // Show latest products if no featured ones
          finalProducts = allProducts
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 6);
          console.log(`🎯 Showing ${finalProducts.length} latest products`);
        }
        
        setProducts(finalProducts);
        
        console.log(`� Displaying ${products.length} products`);
      } catch (error: any) {
        console.error('❌ Error fetching products:', error);
        setError(error.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);



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