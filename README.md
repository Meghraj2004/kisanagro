# KisanAgro - Agriculture Fruit Foam Net Website

A professional, production-ready Next.js website for KisanAgro, featuring Firebase backend, admin dashboard, and SEO optimization.

## 🚀 Features

### Frontend
- **Next.js 14** with TypeScript and App Router
- **Responsive Design** with Tailwind CSS
- **SEO Optimized** (Meta tags, Open Graph, JSON-LD schema, sitemap)
- **Product Catalog** with dynamic routing
- **Image Optimization** with Next/Image
- **Mobile-First Design**
- **Inquiry System** with email & WhatsApp integration

### Admin System ⭐ NEW
- **🔐 Secure Authentication** (Firebase Auth)
- **📊 Admin Dashboard** with real-time statistics
- **📦 Product Management** (Full CRUD operations)
- **🖼️ Image Upload** to Firebase Storage
- **📧 Inquiry Management** with status tracking
- **✉️ Email Notifications** (Nodemailer)
- **💬 WhatsApp Integration** for customer contact
- **🔄 Real-time Updates** with Firestore

### Backend
- **Firebase Firestore** for database
- **Firebase Storage** for images
- **Firebase Authentication** for admin access
- **Nodemailer** for email notifications
- **API Routes** for server-side operations

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Gmail account for SMTP (optional)

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd KisanAgro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase credentials (already provided):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCIK9EdWdagaDLLsUUdUpZs-1uC0vRnSxU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kisanagro-d72fa.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kisanagro-d72fa
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kisanagro-d72fa.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=738291298639
NEXT_PUBLIC_FIREBASE_APP_ID=1:738291298639:web:4ebaf8af7a17c7a4a4153a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-RYEYL6438N

ADMIN_EMAIL=megharajdandgavhal2004@gmail.com
ADMIN_PHONE=9421612110

# SMTP for email notifications (configure later)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Firebase Setup

#### a. Firestore Database
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Deploy rules:
```bash
firebase deploy --only firestore:rules
```

#### b. Storage
1. Go to Firebase Console → Storage
2. Deploy storage rules:
```bash
firebase deploy --only storage
```

#### c. Authentication (IMPORTANT for Admin Access)
1. Enable Email/Password authentication in Firebase Console
2. Create admin user:
   - **Email**: `megharaj@admin.com`
   - **Password**: `Megh@2004`

#### d. Create Admin Document (Required)
In Firestore, create a document in `admins` collection:
- **Collection**: `admins`
- **Document ID**: `megharaj@admin.com` (exact email)
- **Fields**:
  - `email`: `megharaj@admin.com` (string)
  - `role`: `admin` (string)
  - `createdAt`: (timestamp - use server timestamp)

**📖 Detailed Setup Guide**: See `ADMIN_SETUP.md` for step-by-step instructions

### 5. SMTP Setup (Optional - for email notifications)

To enable email notifications for inquiries:

1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env.local`:
```env
SMTP_USER=megharajdandgavhal2004@gmail.com
SMTP_PASS=your_16_digit_app_password
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Access Admin Panel
After setting up admin user (see step 4c above):
1. Click **"Admin"** button in header, or
2. Go to: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
3. Login with:
   - **Email**: `megharaj@admin.com`
   - **Password**: `Megh@2004`

### Production Build
```bash
npm run build
npm start
```

## 🎯 Admin Features

### Admin Dashboard (`/admin/dashboard`)
- Real-time statistics (products, inquiries)
- Quick actions
- Navigation to all admin sections

### Products Management (`/admin/products`)
- ✅ Create: Add new products with images
- ✅ Read: View all products
- ✅ Update: Edit product details
- ✅ Delete: Remove products
- 📸 Upload multiple images to Firebase Storage
- 🏷️ Auto-generate SEO-friendly slugs

### Inquiries Management (`/admin/inquiries`)
- 📧 View all customer inquiries
- 🔍 Filter by status (New/Contacted/Resolved)
- 📱 Direct contact via email/phone/WhatsApp
- ✅ Update inquiry status
- 🗑️ Delete old inquiries

**📖 Complete Admin Guide**: See `ADMIN_COMPLETE.md`

## 📦 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```
- Select your project: `kisanagro-d72fa`
- Public directory: `out`
- Configure as single-page app: `No`
- Set up automatic builds: `No`

4. **Build for Production**
```bash
npm run build
npx next export
```

5. **Deploy**
```bash
firebase deploy --only hosting
```

### Custom Domain Setup

1. Go to Firebase Console → Hosting → Add custom domain
2. Follow instructions to verify domain ownership
3. Update DNS records in AWS Route53:
   - Add A records pointing to Firebase IPs
   - Add TXT record for verification

## 📁 Project Structure

```
KisanAgro/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── inquiries/    # Inquiry submission
│   │   └── sitemap/      # Dynamic sitemap
│   ├── products/          # Products pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── EnquiryModal.tsx
├── lib/                   # Utilities & configs
│   ├── firebase.ts        # Firebase client
│   ├── firebaseAdmin.ts   # Firebase admin
│   ├── config.ts          # Site configuration
│   ├── metadata.ts        # SEO metadata
│   ├── utils.ts           # Helper functions
│   └── email.ts           # Email service
├── types/                 # TypeScript types
├── styles/                # Global styles
├── public/                # Static assets
├── firebase.json          # Firebase config
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
└── package.json           # Dependencies
```

## 🔐 Security

- Firestore rules protect admin-only operations
- Input validation and sanitization on all forms
- CSRF protection via Next.js
- Environment variables for sensitive data
- Firebase Auth for admin authentication

## 📱 Features Breakdown

### Public Pages
- **Home**: Hero section, features, featured products, CTA
- **Products**: Category filtering, product cards with inquiry/call/WhatsApp
- **Product Detail**: Image gallery, features, inquiry form
- **About**: Company information
- **Contact**: Contact form, Google Maps integration

### Admin Dashboard (Protected)
- **Login**: Firebase Authentication
- **Products Management**: Add/Edit/Delete products, upload images
- **Inquiries**: View all inquiries in real-time
- **Profile**: Edit admin profile

### Inquiry System
- Form validation (client & server)
- Save to Firestore
- Email notification to admin
- WhatsApp link generation
- Success confirmation

## 🎨 Customization

### Update Site Configuration
Edit `lib/config.ts`:
```typescript
export const siteConfig = {
  name: 'KisanAgro',
  title: 'Your custom title',
  // ... other settings
};
```

### Update Colors
Edit `tailwind.config.ts` to change primary/secondary colors.

### Add Sample Products
Use the admin dashboard or manually add to Firestore:
```javascript
{
  title: "Product Name",
  slug: "product-name",
  category: "Fruit Foam Nets",
  images: ["url1", "url2"],
  description: "Product description",
  features: ["Feature 1", "Feature 2"],
  metaTitle: "SEO Title",
  metaDescription: "SEO Description",
  metaKeywords: ["keyword1", "keyword2"],
  createdAt: <timestamp>,
  updatedAt: <timestamp>
}
```

## 🔍 SEO Optimization

- Server-side rendering (SSR)
- Static site generation (SSG) for products
- Meta tags and Open Graph
- JSON-LD structured data
- Dynamic sitemap.xml
- robots.txt
- Image optimization with Next/Image
- Semantic HTML
- Mobile-responsive

## 🐛 Troubleshooting

### Firebase Connection Issues
- Check if `.env.local` variables are correct
- Ensure Firebase project is active
- Check browser console for errors

### Email Not Sending
- Verify SMTP credentials
- Check Gmail App Password is correct
- Ensure SMTP_USER and SMTP_PASS are set

### Build Errors
- Delete `.next` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📞 Support

For issues or questions:
- Email: megharajdandgavhal2004@gmail.com
- Phone: +91 9421612110

## 📄 License

Private - All rights reserved © 2024 KisanAgro

---

**Built with ❤️ using Next.js and Firebase**
