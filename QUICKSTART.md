# 🚀 Quick Start Guide - KisanAgro

## First Time Setup (5 minutes)

### 1️⃣ Install Dependencies
```powershell
npm install
```

### 2️⃣ Start Development Server
```powershell
npm run dev
```

Open browser: **http://localhost:3000**

---

## ⚡ That's It! Your website is running!

### What you'll see:
- ✅ Homepage with hero section
- ✅ Product catalog (empty until you add products)
- ✅ About page
- ✅ Contact page with form
- ✅ Admin login at `/admin/login`

---

## 🔐 Admin Access Setup

### Create Admin Account:

1. **Go to Firebase Console** → Authentication
2. **Enable** Email/Password provider
3. **Add user**:
   - Email: `megharajdandgavhal2004@gmail.com`
   - Password: (create a strong password)

4. **Go to Firestore Database**
5. **Create collection**: `admins`
6. **Add document**:
   - Document ID: `megharajdandgavhal2004@gmail.com`
   - Fields:
     ```
     email: "megharajdandgavhal2004@gmail.com"
     phone: "9421612110"
     role: "admin"
     createdAt: [current timestamp]
     ```

7. **Login**: http://localhost:3000/admin/login

---

## 📦 Add Your First Product

### Option 1: Via Firestore Console
1. Go to Firestore → Create collection `products`
2. Add document with auto-ID:
```json
{
  "title": "Premium EPE Foam Net",
  "slug": "premium-epe-foam-net",
  "category": "Fruit Foam Nets",
  "images": ["https://via.placeholder.com/400"],
  "description": "High-quality EPE foam net for maximum fruit protection during transport and storage.",
  "features": [
    "Lightweight and durable",
    "Water-resistant material",
    "Shock absorption",
    "Reusable and eco-friendly"
  ],
  "metaTitle": "Premium EPE Foam Net - Fruit Protection | KisanAgro",
  "metaDescription": "Buy premium quality EPE foam nets for fruit protection. Lightweight, durable, and water-resistant packaging solution.",
  "metaKeywords": ["foam net", "fruit protection", "EPE foam"],
  "createdAt": "2024-11-04T00:00:00.000Z",
  "updatedAt": "2024-11-04T00:00:00.000Z"
}
```

### Option 2: Via Admin Panel (Once implemented)
- Login to admin
- Go to Products Management
- Click "Add Product"
- Fill form and upload images

---

## 📧 Enable Email Notifications (Optional)

1. **Get Gmail App Password**:
   - Enable 2FA on Gmail
   - Go to: https://myaccount.google.com/apppasswords
   - Create app password

2. **Update `.env.local`**:
```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

3. **Restart dev server**

---

## 🌐 Test Inquiry System

1. Go to homepage
2. Click "Send Inquiry" or "Enquiry" on any product
3. Fill form and submit
4. Check:
   - Firestore `inquiries` collection (should have new entry)
   - Your email (if SMTP configured)
   - WhatsApp link works

---

## 🏗️ Build for Production

```powershell
npm run build
```

This will create optimized production build.

---

## 🚀 Deploy to Firebase

1. **Install Firebase CLI**:
```powershell
npm install -g firebase-tools
```

2. **Login**:
```powershell
firebase login
```

3. **Initialize** (skip if already done):
```powershell
firebase init hosting
```

4. **Build and Deploy**:
```powershell
npm run build
npx next export
firebase deploy --only hosting
```

Your site will be live at: `https://kisanagro-d72fa.web.app`

---

## 📱 Key Features to Test

### Public Site:
- ✅ Homepage loads
- ✅ Products page works
- ✅ Product detail page (once you add products)
- ✅ Contact form submits
- ✅ WhatsApp button works
- ✅ Call button triggers phone dialer
- ✅ Mobile responsive

### Admin:
- ✅ Login works
- ✅ Protected routes require authentication
- ✅ Can view dashboard (once UI created)

---

## 🐛 Troubleshooting

### "Cannot find module" errors
**Solution**: Run `npm install`

### Firebase not connecting
**Solution**: Check `.env.local` has correct Firebase config

### Admin login fails
**Solution**: Ensure admin document exists in Firestore with correct structure

### Port 3000 already in use
**Solution**: 
```powershell
npx kill-port 3000
# OR
npm run dev -- -p 3001
```

---

## 📞 Need Help?

- Email: megharajdandgavhal2004@gmail.com
- Phone: +91 9421612110

---

## ✅ Next Steps

1. [ ] Add real products via Firestore
2. [ ] Upload product images to Firebase Storage
3. [ ] Test inquiry system end-to-end
4. [ ] Configure SMTP for email notifications
5. [ ] Customize content (About page, Homepage)
6. [ ] Add your business logo
7. [ ] Update Google Maps location in Contact page
8. [ ] Test on mobile devices
9. [ ] Run production build
10. [ ] Deploy to Firebase Hosting

---

**🎉 Happy Building!**
