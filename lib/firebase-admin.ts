import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Only initialize Firebase Admin if not in build time and credentials are available
let adminAuth: any = null;
let adminDb: any = null;

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    // Check if required credentials are available
    const hasCredentials = 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY;

    if (hasCredentials && !getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      adminAuth = getAuth();
      adminDb = getFirestore();
    }
  } catch (error) {
    console.warn('Firebase Admin initialization skipped:', error);
    // Skip initialization during build time
  }
}

export { adminAuth, adminDb };
