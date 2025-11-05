# 🔐 ADMIN SETUP GUIDE - KisanAgro

## Quick Setup (5 Minutes)

### Step 1: Create Admin User in Firebase Console

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Select project: `kisanagro-d72fa`

2. **Add Authentication User**
   - Click on **Authentication** (left sidebar)
   - Click **Users** tab
   - Click **Add User** button
   - Enter:
     - **Email**: `megharaj@admin.com`
     - **Password**: `Megh@2004`
   - Click **Add User**

3. **Create Admin Record in Firestore**
   - Click on **Firestore Database** (left sidebar)
   - Click **Start Collection**
   - Collection ID: `admins`
   - Document ID: `megharaj@admin.com` (IMPORTANT: Use exact email)
   - Add these fields:
     ```
     Field Name    | Type      | Value
     --------------|-----------|------------------
     email         | string    | megharaj@admin.com
     role          | string    | admin
     createdAt     | timestamp | (click "Use server timestamp")
     ```
   - Click **Save**

### Step 2: Login to Admin Dashboard

1. **Start Development Server** (if not already running)
   ```powershell
   npm run dev
   ```

2. **Access Admin Login**
   - Open: http://localhost:3000
   - Click **"Admin"** button in header (or go to http://localhost:3000/admin/login)

3. **Login with Credentials**
   - **Email**: `megharaj@admin.com`
   - **Password**: `Megh@2004`
   - Click **Sign In**

4. **You're In!** 🎉
   - You'll be redirected to the admin dashboard
   - Start managing products and inquiries!

---

## 📱 Admin Features

### 1. Dashboard (`/admin/dashboard`)
- View statistics (products, inquiries)
- Quick actions to add products
- Overview of pending inquiries

### 2. Products Management (`/admin/products`)
- **View All Products**: See all your products in a list
- **Add New Product**: 
  - Click "Add New Product"
  - Fill in title, category, description
  - Add product features
  - Upload images (stored in Firebase Storage)
  - Save product
- **Edit Product**: Click "Edit" on any product
- **Delete Product**: Click "Delete" on any product

### 3. Inquiries Management (`/admin/inquiries`)
- **View All Inquiries**: See customer inquiries
- **Filter by Status**: New, Contacted, Resolved
- **Contact Info**: Email and phone with direct links
- **WhatsApp Integration**: Click to open WhatsApp chat
- **Update Status**: Mark as Contacted or Resolved
- **Delete Inquiry**: Remove old inquiries

---

## 🔒 Security Features

### Authentication
- ✅ Firebase Authentication integration
- ✅ Protected admin routes
- ✅ Session management
- ✅ Auto-redirect to login if not authenticated

### Authorization
- ✅ Admin role verification in Firestore
- ✅ Only users with `role: "admin"` can access dashboard
- ✅ Non-admin users are automatically signed out

### Data Protection
- ✅ Firestore security rules (configured)
- ✅ Storage security rules (configured)
- ✅ API route protection

---

## 📧 Email Notifications

### Setup SMTP (Optional)

To enable email notifications when customers submit inquiries:

1. **Update `.env.local`**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

2. **Generate Gmail App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" (enter "KisanAgro")
   - Copy the generated password
   - Paste into `SMTP_PASS` in `.env.local`

3. **Restart Dev Server**:
   ```powershell
   npm run dev
   ```

4. **Test**: Submit an inquiry on the website - you'll receive an email!

---

## 🖼️ Image Upload

### Automatic Firebase Storage Upload
- Images are automatically uploaded to Firebase Storage
- Secure URLs are generated
- Images are optimized by Next.js
- First image becomes the main product image

### Supported Formats
- JPEG/JPG
- PNG
- WebP
- GIF

### Best Practices
- Use high-quality images (at least 800x800px)
- Keep file sizes under 2MB
- Upload multiple angles of products

---

## 🚀 How to Use Admin Panel

### Adding Your First Product

1. **Login to Admin**: http://localhost:3000/admin/login
2. **Go to Dashboard**: Click "Dashboard"
3. **Click "Add New Product"**
4. **Fill in Product Details**:
   - Title: "Premium EPE Foam Net Roll"
   - Category: "Fruit Foam Nets"
   - Description: "High-quality EPE foam net for protecting fruits..."
   - Features: 
     - "Lightweight and durable"
     - "Water-resistant material"
     - "Perfect for all fruit types"
5. **Upload Images**:
   - Click "Upload Images"
   - Select 2-3 product images
   - Wait for upload (you'll see "Images uploaded successfully!")
6. **Click "Save Product"**
7. **Done!** Product is now live on your website

### Managing Inquiries

1. **Go to Inquiries**: http://localhost:3000/admin/inquiries
2. **View New Inquiries**: Click "New" tab
3. **Contact Customer**:
   - Click email link to send email
   - Click phone to call
   - Click "WhatsApp" to chat
4. **Update Status**: Click "Mark as Contacted"
5. **After Resolved**: Click "Mark as Resolved"

---

## 🎯 Admin Credentials

**Email**: `megharaj@admin.com`  
**Password**: `Megh@2004`

**Important**: Keep these credentials secure! In production:
1. Use a strong, unique password
2. Enable 2FA in Firebase Console
3. Don't share credentials

---

## 🔧 Troubleshooting

### Can't Login?
1. Verify email in Firebase Auth: `megharaj@admin.com`
2. Check Firestore document ID matches email exactly
3. Check `role` field is set to `"admin"`
4. Try signing out: http://localhost:3000/admin/login (it auto-signs out)

### Images Not Uploading?
1. Check Firebase Storage rules are configured
2. Verify `.env.local` has correct Firebase credentials
3. Check browser console for errors
4. Make sure images are under 5MB

### Email Not Sending?
1. Check `SMTP_USER` and `SMTP_PASS` in `.env.local`
2. Use Gmail App Password (not your regular password)
3. Check `lib/email.ts` configuration
4. Restart dev server after changing env variables

---

## 📱 Access Points

- **Website**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Products Management**: http://localhost:3000/admin/products
- **Inquiries Management**: http://localhost:3000/admin/inquiries

---

## 🎉 You're Ready!

Your admin system is fully configured with:
- ✅ Secure authentication
- ✅ Product CRUD operations
- ✅ Image upload to Firebase Storage
- ✅ Inquiry management
- ✅ Email notifications
- ✅ WhatsApp integration
- ✅ Real-time database updates

**Login now and start managing your website!** 🚀

---

**Need Help?**
- Check Firebase Console for errors
- Review browser console (F12) for logs
- Check `README.md` for more documentation
