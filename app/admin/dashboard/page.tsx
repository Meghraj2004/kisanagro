'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useClientSideEmail } from '@/lib/hooks/useClientSideEmail';
import { FiPackage, FiMessageSquare, FiLogOut, FiPlus, FiTrendingUp, FiEdit, FiEye, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Inquiry, Product } from '@/types';

export default function AdminDashboard() {
  const { user, loading, isAdmin } = useAdminAuth();
  const clientEmail = useClientSideEmail(user);
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    inquiries: 0,
    pendingInquiries: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [loading, isAdmin, router]);



  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get products count and recent products
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(5));
        const productsSnapshot = await getDocs(productsQuery);
        const productsCount = productsSnapshot.size;
        const recentProds = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Product[];

        // Get all products count
        const allProductsSnapshot = await getDocs(collection(db, 'products'));
        
        // Get inquiries count and recent inquiries
        const inquiriesQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(5));
        const inquiriesSnapshot = await getDocs(inquiriesQuery);
        const recentInqs = inquiriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Inquiry[];

        // Get all inquiries count
        const allInquiriesSnapshot = await getDocs(collection(db, 'inquiries'));
        const inquiriesCount = allInquiriesSnapshot.size;

        // Get pending inquiries count
        const pendingCount = allInquiriesSnapshot.docs.filter(
          (doc) => doc.data().status === 'new'
        ).length;

        setStats({
          products: allProductsSnapshot.size,
          inquiries: inquiriesCount,
          pendingInquiries: pendingCount,
        });
        
        setRecentProducts(recentProds);
        setRecentInquiries(recentInqs);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-lg">K</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate" suppressHydrationWarning>
                    Welcome, {clientEmail || 'Admin'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                href="/"
                className="btn btn-outline text-xs sm:text-sm px-3 py-2"
              >
                <FiEye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Website</span>
                <span className="sm:hidden">Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs sm:text-sm px-3 py-2"
              >
                <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Products Card */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiPackage className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {loadingStats ? '...' : stats.products}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Total Products</h3>
            <p className="text-primary-100 text-xs sm:text-sm mb-3 sm:mb-4">Manage your product catalog</p>
            <Link
              href="/admin/products"
              className="inline-flex items-center text-xs sm:text-sm font-medium hover:underline"
            >
              <span className="hidden sm:inline">Manage Products</span>
              <span className="sm:hidden">Manage</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Inquiries Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiMessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {loadingStats ? '...' : stats.inquiries}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Total Inquiries</h3>
            <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">Customer inquiries received</p>
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center text-xs sm:text-sm font-medium hover:underline"
            >
              <span className="hidden sm:inline">View All Inquiries</span>
              <span className="sm:hidden">View All</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Pending Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiClock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                {loadingStats ? '...' : stats.pendingInquiries}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">Pending Action</h3>
            <p className="text-orange-100 text-xs sm:text-sm mb-3 sm:mb-4">Inquiries awaiting response</p>
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center text-xs sm:text-sm font-medium hover:underline"
            >
              <span className="hidden sm:inline">Review Now</span>
              <span className="sm:hidden">Review</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/admin/products/new"
              className="group relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-primary-200 hover:border-primary-400 transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Add Product</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Create a new product listing</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/products"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-blue-200 hover:border-blue-400 transition-all"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FiEdit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1">Manage Products</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Edit or delete products</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="hidden sm:inline">Recent Inquiries</span>
                  <span className="sm:hidden">Inquiries</span>
                </h2>
                <Link href="/admin/inquiries" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              {loadingStats ? (
                <p className="text-gray-500 text-center py-4 text-sm">Loading...</p>
              ) : recentInquiries.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No inquiries yet</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 ${
                        inquiry.status === 'new' ? 'bg-amber-100' : inquiry.status === 'contacted' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {inquiry.status === 'new' ? (
                          <FiAlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${inquiry.status === 'new' ? 'text-amber-600' : ''}`} />
                        ) : (
                          <FiCheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${inquiry.status === 'contacted' ? 'text-blue-600' : 'text-green-600'}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{inquiry.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{inquiry.email}</p>
                        {inquiry.productTitle && (
                          <p className="text-xs text-primary-600 mt-1 truncate">Product: {inquiry.productTitle}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        href="/admin/inquiries"
                        className="text-primary-600 hover:text-primary-700 flex-shrink-0 p-1"
                      >
                        <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  <span className="hidden sm:inline">Recent Products</span>
                  <span className="sm:hidden">Products</span>
                </h2>
                <Link href="/admin/products" className="text-xs sm:text-sm text-primary-600 hover:underline font-medium">
                  View All
                </Link>
              </div>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              {loadingStats ? (
                <p className="text-gray-500 text-center py-4 text-sm">Loading...</p>
              ) : recentProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No products yet</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md sm:rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        {product.images[0] ? (
                          product.images[0].startsWith('data:') ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{product.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{product.category}</p>
                        {product.priceRange && (
                          <p className="text-xs sm:text-sm text-primary-600 font-medium mt-1">
                            ₹{product.priceRange.min} – ₹{product.priceRange.max}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-primary-600 hover:text-primary-700 flex-shrink-0 p-1"
                      >
                        <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
