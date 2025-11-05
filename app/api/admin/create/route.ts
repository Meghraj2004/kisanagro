import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Check if Firebase Admin is available
    if (!adminAuth || !adminDb) {
      console.error('❌ Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const { email, password } = await request.json();

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: true,
    });

    // Add admin document to Firestore
    await adminDb.collection('admins').doc(email).set({
      uid: userRecord.uid,
      email,
      role: 'admin',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      uid: userRecord.uid,
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
