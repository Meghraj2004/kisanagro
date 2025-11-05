import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendInquiryEmail } from '@/lib/email';
import { sanitizeInput, validateEmail, validatePhone } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is available
    if (!adminDb) {
      console.error('❌ Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }
    const body = await request.json();
    console.log('📧 Email Inquiry API - Received body:', JSON.stringify(body, null, 2));
    const { name, email, phone, city, message, productId, productTitle, fruitName, size, quantity, products, selectedProducts } = body;

    // Validate inputs
    if (!name || !email || !phone || !city) {
      console.error('❌ Missing required fields:', { name: !!name, email: !!email, phone: !!phone, city: !!city });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Create inquiry object
    const inquiry = {
      name: sanitizeInput(name),
      email: email.toLowerCase(),
      phone,
      city: sanitizeInput(city),
      message: sanitizeInput(message || ''),
      // Legacy single product fields (for backward compatibility)
      productId: productId || null,
      productTitle: productTitle || null,
      fruitName: sanitizeInput(fruitName || ''),
      size: sanitizeInput(size || ''),
      quantity: sanitizeInput(quantity || ''),
      // Multiple products support (new format from both modals)
      selectedProducts: selectedProducts ? selectedProducts.map((p: any) => ({
        productId: p.productId,
        productTitle: sanitizeInput(p.productTitle || ''),
        category: sanitizeInput(p.category || ''),
        fruitName: sanitizeInput(p.fruitName || ''),
        size: sanitizeInput(p.size || ''),
        quantity: sanitizeInput(p.quantity || ''),
        price: p.price || null,
      })) : null,
      // Legacy multiple products support (old format)
      products: products ? products.map((p: any) => ({
        productId: p.productId,
        productTitle: sanitizeInput(p.productTitle),
        fruitName: sanitizeInput(p.fruitName),
        size: sanitizeInput(p.size),
        quantity: sanitizeInput(p.quantity),
      })) : null,
      createdAt: new Date(), // Use regular Date for Admin SDK
      notifiedEmail: false,
      notifiedWhatsapp: false,
      status: 'new' as const,
    };

    // Save to Firestore using Admin SDK (bypasses security rules)
    console.log('💾 Attempting to save inquiry to Firestore using Admin SDK...');
    const docRef = await adminDb.collection('inquiries').add(inquiry);
    console.log('✅ Inquiry saved to Firestore:', docRef.id);

    // Send email notification
    const inquiryForEmail: any = {
      ...inquiry,
      id: docRef.id,
      createdAt: new Date(),
    };
    
    let emailSent = false;
    try {
      console.log('Attempting to send email notification...');
      emailSent = await sendInquiryEmail(inquiryForEmail);
      if (emailSent) {
        console.log('Email sent successfully');
        // Update the document to mark email as sent
        inquiry.notifiedEmail = true;
      } else {
        console.warn('Email sending returned false');
      }
    } catch (emailError: any) {
      console.error('Email sending error:', {
        message: emailError.message,
        stack: emailError.stack,
      });
      // Don't fail the whole request if email fails
    }

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        emailSent,
        message: emailSent 
          ? 'Inquiry submitted successfully! Email notification sent.' 
          : 'Inquiry submitted successfully! Email notification failed but your inquiry was saved.'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creating inquiry:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create inquiry';
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Please check Firestore security rules.';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'Authentication required but user is not authenticated.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message,
        code: error.code || 'unknown'
      },
      { status: 500 }
    );
  }
}
