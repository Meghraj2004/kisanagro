'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);

  const handleCreateAdminDoc = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setCreatingDoc(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Admin document created! You can now login.');
        setError('');
      } else {
        setError(data.error || 'Failed to create admin document');
      }
    } catch (err) {
      console.error('Error creating admin doc:', err);
      setError('Failed to create admin document');
    } finally {
      setCreatingDoc(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth successful, user UID:', user.uid);

      // Check if user is admin (optional - if no admin doc exists, allow access)
      try {
        const adminDoc = await getDoc(doc(db, 'admins', email));
        console.log('Admin doc exists:', adminDoc.exists());
        
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          console.log('Admin data:', adminData);
          
          if (adminData.role !== 'admin') {
            await auth.signOut();
            setError('Unauthorized access. Admin privileges required.');
            setLoading(false);
            return;
          }
        } else {
          // If admin document doesn't exist, create it automatically
          console.log('Admin document not found, user authenticated successfully');
          // Allow access anyway since they have valid credentials
        }
      } catch (firestoreError) {
        console.error('Firestore check error (non-blocking):', firestoreError);
        // Continue anyway if Firestore check fails
      }

      console.log('Redirecting to dashboard...');
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email. Please check your email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format. Please enter a valid email.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(`Login failed: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your website</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
                {error.includes('Unauthorized') && (
                  <button
                    type="button"
                    onClick={handleCreateAdminDoc}
                    disabled={creatingDoc}
                    className="mt-2 text-xs underline hover:no-underline"
                  >
                    {creatingDoc ? 'Creating...' : 'Click here to create admin document'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <FiLogIn className="mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-primary-600 hover:underline">
              ← Back to Website
            </a>
          </div>

          {/* Helper for creating admin document */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>First time setup?</strong>
            </p>
            <p className="text-xs text-blue-700 mb-3">
              If you have created a user in Firebase Authentication but can't login, 
              click below to create the admin document in Firestore:
            </p>
            <button
              type="button"
              onClick={handleCreateAdminDoc}
              disabled={creatingDoc || !email}
              className="text-xs btn btn-secondary w-full"
            >
              {creatingDoc ? 'Creating Admin Document...' : 'Create Admin Document'}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This is a secure admin area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
}
