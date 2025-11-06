'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import EnquiryModal from '@/components/EnquiryModal';
import { generateMetadata } from '@/lib/metadata';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const PRODUCTS_PER_PAGE = 12; // Optimize: Load in batches

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      let q = query(
        collection(db, 'products'), 
        orderBy('createdAt', 'desc'),
        limit(PRODUCTS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, 'products'), 
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(PRODUCTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      }
      
      const productsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...productsData]);
      } else {
        setProducts(productsData);
      }
      
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEnquiry = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchProducts(true);
    }
  }, [fetchProducts, hasMore, loadingMore]);

  const filteredProducts = useMemo(() => {
    return filter === 'all' 
      ? products 
      : products.filter(p => p.category === filter);
  }, [products, filter]);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-300 h-48"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-gray-300 rounded flex-1"></div>
                <div className="h-8 bg-gray-300 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <>
        <section className="bg-gradient-to-br from-primary-50 to-white py-16">
          <div className="container">
            <h1 className="heading-lg text-center text-gray-900 mb-4">
              Our Products
            </h1>
            <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto">
              Browse our comprehensive range of premium fruit foam nets and packaging solutions
            </p>
          </div>
        </section>
        <section className="container section-padding">
          <LoadingSkeleton />
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="container">
          <h1 className="heading-lg text-center text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-center text-gray-600 text-lg max-w-2xl mx-auto">
            Browse our comprehensive range of premium fruit foam nets and packaging solutions
          </p>
        </div>
      </section>

      <section className="container section-padding">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Products' : category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEnquiry={handleEnquiry}
                />
              ))}
            </div>
            
            {/* Load More Section */}
            {(hasMore || loadingMore) && filter === 'all' && (
              <div className="text-center mt-12">
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-gray-600">Loading more products...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-outline"
                  >
                    Load More Products
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <EnquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </>
  );
}
