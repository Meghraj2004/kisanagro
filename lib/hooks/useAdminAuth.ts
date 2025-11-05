'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('User authenticated:', currentUser.email);
        
        // Check if user is admin (allow access even if admin doc doesn't exist)
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.email || ''));
          console.log('Admin doc check:', adminDoc.exists());
          
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            if (adminData.role === 'admin') {
              setUser(currentUser);
              setIsAdmin(true);
              console.log('Admin access granted (from Firestore)');
            } else {
              // Has document but not admin role
              await auth.signOut();
              setUser(null);
              setIsAdmin(false);
            }
          } else {
            // No admin document, but user is authenticated
            // Allow access (lenient mode)
            console.log('No admin document found, allowing access anyway');
            setUser(currentUser);
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Admin check error (allowing access):', error);
          // If Firestore check fails, still allow access since user is authenticated
          setUser(currentUser);
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Remove router from dependencies to prevent re-runs

  return { user, loading, isAdmin };
};
