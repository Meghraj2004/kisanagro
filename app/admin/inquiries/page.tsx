'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { FiMail, FiPhone, FiMessageSquare, FiCheck, FiTrash2, FiLogOut, FiExternalLink } from 'react-icons/fi';
import PhoneSelector from '@/components/PhoneSelector';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  productName?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: Date;
}

export default function AdminInquiriesPage() {
  const { user, loading, isAdmin } = useAdminAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'resolved'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const inquiriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Inquiry[];
        setInquiries(inquiriesData);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoadingInquiries(false);
      }
    };

    if (isAdmin) {
      fetchInquiries();
    }
  }, [isAdmin]);

  const handleStatusUpdate = async (id: string, status: 'contacted' | 'resolved') => {
    setUpdating(id);
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
      setInquiries(inquiries.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setInquiries(inquiries.filter((inq) => inq.id !== id));
      alert('Inquiry deleted successfully!');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry.');
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
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
                Inquiries Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 suppress-hydration-warning">
                {user?.email || 'Admin'}
              </p>
            </div>
            
            {/* Mobile Navigation Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-gray-600 hover:text-primary-600 text-sm">
                  Dashboard
                </Link>
                <Link href="/admin/products" className="text-gray-600 hover:text-primary-600 text-sm">
                  Products
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
            <Link href="/admin/products" className="text-xs text-gray-600 hover:text-primary-600">
              Products
            </Link>
            <Link href="/" className="text-xs text-gray-600 hover:text-primary-600">
              View Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 sm:py-8 max-w-7xl mx-auto">
        {/* Mobile-Responsive Filter Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            All ({inquiries.length})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
              filter === 'new'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            New ({inquiries.filter((i) => i.status === 'new').length})
          </button>
          <button
            onClick={() => setFilter('contacted')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
              filter === 'contacted'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Contacted ({inquiries.filter((i) => i.status === 'contacted').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
              filter === 'resolved'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Resolved ({inquiries.filter((i) => i.status === 'resolved').length})
          </button>
        </div>

        {/* Inquiries List */}
        {loadingInquiries ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Inquiries</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No inquiries yet.'
                : `No ${filter} inquiries at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="card p-4 sm:p-6">
                {/* Header Section - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        {inquiry.name}
                      </h3>
                      <span
                        className={`self-start px-2 py-1 sm:px-3 rounded-full text-xs font-medium border ${getStatusColor(
                          inquiry.status
                        )}`}
                      >
                        {inquiry.status.toUpperCase()}
                      </span>
                    </div>
                    {inquiry.productName && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        Product: <span className="font-medium">{inquiry.productName}</span>
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500">
                      {inquiry.createdAt.toLocaleDateString()} at{' '}
                      {inquiry.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Contact Info - Mobile Stacked */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 text-gray-700 min-w-0">
                    <FiMail className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
                    <a 
                      href={`mailto:${inquiry.email}`} 
                      className="hover:underline text-xs sm:text-sm truncate"
                    >
                      {inquiry.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiPhone className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
                    <div className="flex items-center gap-2 min-w-0">
                      <a 
                        href={`tel:${inquiry.phone}`} 
                        className="hover:underline text-xs sm:text-sm truncate"
                      >
                        {inquiry.phone}
                      </a>
                      <a
                        href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline flex items-center gap-1 text-xs sm:text-sm flex-shrink-0"
                      >
                        <FiExternalLink className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Message - Mobile Optimized */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Message:</p>
                  <p className="text-xs sm:text-sm text-gray-900 leading-relaxed">{inquiry.message}</p>
                </div>

                {/* Actions - Mobile Stacked */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {inquiry.status === 'new' && (
                    <button
                      onClick={() => handleStatusUpdate(inquiry.id, 'contacted')}
                      disabled={updating === inquiry.id}
                      className="btn btn-primary text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2"
                    >
                      <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      {updating === inquiry.id ? 'Updating...' : 'Mark as Contacted'}
                    </button>
                  )}
                  {inquiry.status === 'contacted' && (
                    <button
                      onClick={() => handleStatusUpdate(inquiry.id, 'resolved')}
                      disabled={updating === inquiry.id}
                      className="btn btn-primary text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2"
                    >
                      <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      {updating === inquiry.id ? 'Updating...' : 'Mark as Resolved'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    className="btn btn-outline text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 text-red-600 border-red-600 hover:bg-red-50 py-2 sm:py-2"
                  >
                    <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
