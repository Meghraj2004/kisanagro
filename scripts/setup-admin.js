/**
 * Admin Setup Script
 * 
 * This script creates the admin user in Firebase.
 * Run this once to set up your admin credentials.
 * 
 * Usage:
 * 1. Make sure your Firebase project is configured
 * 2. Run: node scripts/setup-admin.js
 * 3. Or use the API endpoint: POST /api/admin/create
 */

const ADMIN_EMAIL = 'megharaj@admin.com';
const ADMIN_PASSWORD = 'Megh@2004';

console.log('Admin Setup Instructions:');
console.log('========================');
console.log('');
console.log('Option 1: Using Firebase Console (Recommended)');
console.log('-----------------------------------------------');
console.log('1. Go to Firebase Console: https://console.firebase.google.com');
console.log(`2. Select your project: kisanagro-d72fa`);
console.log('3. Go to Authentication > Users');
console.log('4. Click "Add User"');
console.log(`5. Email: ${ADMIN_EMAIL}`);
console.log(`6. Password: ${ADMIN_PASSWORD}`);
console.log('7. Go to Firestore Database');
console.log('8. Create collection "admins"');
console.log(`9. Create document with ID: ${ADMIN_EMAIL}`);
console.log('10. Add fields:');
console.log('    - role: "admin" (string)');
console.log('    - email: "megharaj@admin.com" (string)');
console.log('    - createdAt: (timestamp) - use server timestamp');
console.log('');
console.log('Option 2: Using API Endpoint');
console.log('----------------------------');
console.log('Run this cURL command (requires Firebase Admin SDK setup):');
console.log('');
console.log(`curl -X POST http://localhost:3000/api/admin/create \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"email":"${ADMIN_EMAIL}","password":"${ADMIN_PASSWORD}"}'`);
console.log('');
console.log('Admin Credentials:');
console.log('------------------');
console.log(`Email: ${ADMIN_EMAIL}`);
console.log(`Password: ${ADMIN_PASSWORD}`);
console.log('');
console.log('After setup, login at: http://localhost:3000/admin/login');
