import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Only initialize Firebase Admin if not in build time and credentials are available
let adminAuth: any = null;
let adminDb: any = null;

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    // Use FIREBASE_PROJECT_ID first, fallback to NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    // Check if required credentials are available
    const hasCredentials = 
      projectId &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY;

    console.log('🔧 Firebase Admin Debug:', {
      projectId: !!projectId,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0
    });

    if (hasCredentials && !getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      adminAuth = getAuth();
      adminDb = getFirestore();
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.warn('⚠️ Firebase Admin not initialized - missing credentials or already initialized');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    // Skip initialization during build time
  }
}

export { adminAuth, adminDb };
