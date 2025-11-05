'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useClientSideEmail } from '@/lib/hooks/useClientSideEmail';
import { Product } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiPackage } from 'react-icons/fi';

export default function AdminProductsPage() {
  const { user, loading, isAdmin } = useAdminAuth();
  const clientEmail = useClientSideEmail(user);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
              <p className="text-sm text-gray-600 mt-1" suppressHydrationWarning>
                {clientEmail || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/admin/inquiries" className="text-gray-600 hover:text-primary-600">
                Inquiries
              </Link>
              <Link href="/" className="text-gray-600 hover:text-primary-600">
                View Website
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            All Products ({products.length})
          </h2>
          <Link href="/admin/products/new" className="btn btn-primary flex items-center gap-2">
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
          <div className="grid gap-6">
            {products.map((product) => (
              <div key={product.id} className="card p-6">
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Category: {product.category}
                        </p>
                        <p className="text-gray-700 line-clamp-2">{product.description}</p>
                      </div>
                    </div>

                    {/* Product Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="btn btn-outline text-sm flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        {deleting === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-sm text-primary-600 hover:underline"
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
