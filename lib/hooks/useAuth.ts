'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', user.email!));
        if (adminDoc.exists() && adminDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const requireAuth = (adminOnly = false) => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
        return false;
      }
      if (adminOnly && !isAdmin) {
        router.push('/');
        return false;
      }
    }
    return true;
  };

  return { user, isAdmin, loading, requireAuth };
}
