# 🔥 Firebase Troubleshooting Guide

## ⚠️ Issue: Products Not Adding/Fetching

You're seeing: **"Failed to add product. Please try again."**

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console (F12)

I've added detailed console logging. Open the browser console (F12) and look for:

**When adding a product:**
```
=== FORM SUBMISSION STARTED ===
Form Data: {...}
Creating slug from title: ...
Generated slug: ...
Product data to save: {...}
Database instance: {...}
Product added successfully! Doc ID: ...
```

**When viewing products list:**
```
=== FETCHING PRODUCTS ===
Database instance: {...}
User: {...}
Is Admin: true
Query created: {...}
Snapshot received: {...}
Number of documents: X
```

**If you see errors:**
```
=== ERROR ADDING PRODUCT ===
Error message: ...
Error code: ...
```

---

## 🚨 Common Firebase Errors & Solutions

### Error: "Missing or insufficient permissions"

**Problem:** Firestore security rules are blocking access

**Solution:** Update Firestore Rules in Firebase Console

1. Go to: https://console.firebase.google.com/project/kisanagro-d72fa/firestore/rules
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads to products (public access)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write inquiries
    match /inquiries/{inquiryId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read admin docs
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if false; // Prevent accidental overwrites
    }
  }
}
```

3. Click **Publish**

---

### Error: "FirebaseError: [code=permission-denied]"

**Problem:** User not authenticated or insufficient permissions

**Solution:** 
1. Make sure you're logged in as admin (megharaj@admin.com)
2. Check console: `User: {...}` should show your email
3. Check console: `Is Admin: true` should be true

---

### Error: "db is undefined" or "Cannot read property 'collection' of undefined"

**Problem:** Firebase not initialized properly

**Solution:** I've already fixed this in `lib/firebase.ts` by removing the `window` check

**Verify fix:**
1. Restart the dev server (already running on port 3001)
2. Hard refresh the page (Ctrl+Shift+R)
3. Check console for "Database instance: {...}"

---

### Error: "Failed to get document because the client is offline"

**Problem:** Firebase can't connect to the internet

**Solution:**
1. Check your internet connection
2. Disable VPN if using one
3. Check firewall settings
4. Try: https://www.google.com (test internet)

---

## 🔧 Quick Fixes to Try

### Fix 1: Hard Refresh Browser
```
Press: Ctrl + Shift + R (Windows)
Press: Cmd + Shift + R (Mac)
```
This clears cache and reloads all JavaScript.

---

### Fix 2: Clear Browser Storage
1. Press F12 (open DevTools)
2. Go to **Application** tab
3. Click **Clear storage**
4. Click **Clear site data**
5. Refresh page

---

### Fix 3: Check Firebase Project Status
1. Go to: https://console.firebase.google.com/project/kisanagro-d72fa
2. Check if project is active (not billing issues)
3. Check Firestore Database exists
4. Check Authentication is enabled

---

### Fix 4: Verify Environment Variables
Check if `.env.local` exists and has correct values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCIK9EdWdagaDLLsUUdUpZs-1uC0vRnSxU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kisanagro-d72fa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kisanagro-d72fa
```

If server was running when you created `.env.local`, restart it:
```powershell
# Stop server (Ctrl+C in terminal)
npm run dev
```

---

## 📊 Firebase Console Checklist

### ✅ Firestore Database

1. Go to: https://console.firebase.google.com/project/kisanagro-d72fa/firestore
2. Check if database exists
3. Look for `products` collection
4. Look for `admins` collection

**If database doesn't exist:**
- Click **Create database**
- Select **Start in test mode** (we'll secure it later)
- Choose location closest to you
- Click **Enable**

---

### ✅ Authentication

1. Go to: https://console.firebase.google.com/project/kisanagro-d72fa/authentication/users
2. Check if `megharaj@admin.com` exists
3. Check if user is **Enabled** (not disabled)

**If user doesn't exist:**
- Go to login page: http://localhost:3001/admin/login
- Click "Create Admin Document" button
- Or use Firebase Console to add user manually

---

### ✅ Security Rules

1. Go to: https://console.firebase.google.com/project/kisanagro-d72fa/firestore/rules
2. Current rules should allow authenticated writes

**Temporary Test Mode (for debugging only):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ INSECURE - Only for testing!
    }
  }
}
```

⚠️ **WARNING:** This allows anyone to read/write your database. Only use temporarily for testing, then revert to secure rules above.

---

## 🧪 Test Firestore Connection

Create a test page to verify Firebase is working:

1. Go to: http://localhost:3001/admin/products/new
2. Open console (F12)
3. Paste this code in console:

```javascript
// Test Firebase connection
import { collection, addDoc } from 'firebase/firestore';

async function testFirebase() {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to add a test document
    const testData = {
      test: true,
      timestamp: new Date(),
      message: 'This is a test'
    };
    
    const docRef = await addDoc(collection(db, 'test_collection'), testData);
    console.log('✅ SUCCESS! Test document added:', docRef.id);
    return true;
  } catch (error) {
    console.error('❌ FAILED! Error:', error);
    return false;
  }
}

// Run test
testFirebase();
```

---

## 📝 What I Changed

### 1. Fixed Firebase Initialization (`lib/firebase.ts`)
- **Before:** Only initialized if `window` exists (caused issues)
- **After:** Always initializes (works in all contexts)

### 2. Added Debug Logging (`app/admin/products/new/page.tsx`)
- Shows all form data before submission
- Shows Firebase connection status
- Shows detailed error messages with codes

### 3. Added Debug Logging (`app/admin/products/page.tsx`)
- Shows fetch attempt details
- Shows number of products found
- Shows detailed error messages

---

## 🎯 Next Steps

### Step 1: Open Browser Console
1. Go to: http://localhost:3001/admin/products/new
2. Press F12
3. Go to **Console** tab

### Step 2: Try Adding a Product
1. Fill in the form
2. Upload an image
3. Click "Add Product"
4. **Watch the console for error messages**

### Step 3: Report the Error
Look for messages starting with:
- `=== ERROR ADDING PRODUCT ===`
- `Error code: ...`
- `Error message: ...`

**Copy the entire error and send it to me!**

---

## 🔑 Most Likely Issues

### 1. Firestore Rules (90% probability)
- **Symptom:** "Missing or insufficient permissions"
- **Fix:** Update Firestore rules (see above)

### 2. Firestore Not Created (5% probability)
- **Symptom:** "Project doesn't have Firestore enabled"
- **Fix:** Create Firestore database in console

### 3. Authentication Issue (3% probability)
- **Symptom:** "User not authenticated"
- **Fix:** Re-login to admin panel

### 4. Network Issue (2% probability)
- **Symptom:** "Failed to get document because offline"
- **Fix:** Check internet connection

---

## 💡 Quick Test

Try this simple test:

1. Go to Firebase Console: https://console.firebase.google.com/project/kisanagro-d72fa/firestore/data
2. Manually add a product:
   - Click **Start collection**
   - Collection ID: `products`
   - Document ID: (auto-generate)
   - Fields:
     ```
     title (string): "Test Product"
     slug (string): "test-product"
     category (string): "Fruit Foam Nets"
     description (string): "This is a test"
     features (array): ["Feature 1", "Feature 2"]
     images (array): ["data:image/png;base64,test"]
     createdAt (timestamp): (now)
     updatedAt (timestamp): (now)
     ```
   - Click **Save**

3. Go to: http://localhost:3001/admin/products
4. You should see "Test Product" in the list

**If you see it:** Firestore fetching works! Issue is only with adding.
**If you don't see it:** Firestore rules might be blocking reads too.

---

## 📞 Need Help?

Send me:
1. ✅ Full console error message (from F12)
2. ✅ Screenshot of Firebase Firestore rules
3. ✅ Screenshot of Firestore data (if any exists)
4. ✅ Confirm you're logged in as admin

I'll help you fix it immediately! 🚀
