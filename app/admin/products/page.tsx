'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, deleteDoc, doc, orderBy, query, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useClientSideEmail } from '@/lib/hooks/useClientSideEmail';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';
import { Product } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiPackage } from 'react-icons/fi';

export default function AdminProductsPage() {
  const { user, loading, isAdmin } = useAdminAuth();
  const clientEmail = useClientSideEmail(user);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('=== FETCHING PRODUCTS ===');
      console.log('Database instance:', db);
      console.log('User:', user);
      console.log('Is Admin:', isAdmin);
      
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        console.log('Query created:', q);
        
        const snapshot = await getDocs(q);
        console.log('Snapshot received:', snapshot);
        console.log('Number of documents:', snapshot.docs.length);
        
        const productsData = snapshot.docs.map((doc) => {
          console.log('Document:', doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          };
        }) as Product[];
        
        console.log('Products data:', productsData);
        setProducts(productsData);
      } catch (error: any) {
        console.error('=== ERROR FETCHING PRODUCTS ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleting(productId);
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter((p) => p.id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Admin Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                Products Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1" suppressHydrationWarning>
                {clientEmail || 'Admin'}
              </p>
            </div>
            
            {/* Mobile Navigation Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-primary-600 text-sm">
                  Dashboard
                </Link>
                <Link href="/admin/inquiries" className="text-gray-600 hover:text-primary-600 text-sm">
                  Inquiries
                </Link>
                <Link href="/" className="text-gray-600 hover:text-primary-600 text-sm">
                  View Website
                </Link>
              </div>
              
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2"
              >
                <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Links */}
          <div className="flex sm:hidden items-center gap-4 mt-3 pt-3 border-t border-gray-200">
            <Link href="/admin/dashboard" className="text-xs text-gray-600 hover:text-primary-600">
              Dashboard
            </Link>
            <Link href="/admin/inquiries" className="text-xs text-gray-600 hover:text-primary-600">
              Inquiries
            </Link>
            <Link href="/" className="text-xs text-gray-600 hover:text-primary-600">
              View Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        {/* Mobile-Optimized Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            All Products ({products.length})
          </h2>
          <Link 
            href="/admin/products/new" 
            className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FiPlus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Products List */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first product.</p>
            <Link href="/admin/products/new" className="btn btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] ? (
                      product.images[0].startsWith('data:') ? (
                        // Base64 image
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // URL image
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                        {product.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {product.category}
                        </span>
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                        {product.priceRange && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            ₹{product.priceRange.min} - ₹{product.priceRange.max}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-1">
                        {product.description}
                      </p>
                    </div>

                    {/* Product Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1">
                        {product.features.slice(0, 2).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                        {product.features.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            +{product.features.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <div className="flex gap-2 flex-1">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="btn btn-secondary flex-1 sm:flex-none text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 py-2"
                        >
                          <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="btn btn-outline flex-1 sm:flex-none text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 text-red-600 border-red-600 hover:bg-red-50 py-2"
                        >
                          <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          {deleting === product.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs sm:text-sm text-primary-600 hover:underline text-center sm:text-left py-2 sm:py-0 sm:self-center"
                      >
                        View on Website →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
