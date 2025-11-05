# 🚀 QUICK START - Admin System

## ⚡ 3-Step Setup (5 Minutes)

### Step 1: Create Admin User
1. Open: https://console.firebase.google.com
2. Project: `kisanagro-d72fa`
3. Authentication → Users → **Add User**
   - Email: `megharaj@admin.com`
   - Password: `Megh@2004`

### Step 2: Create Admin Document
1. Firestore Database → **Start Collection**
2. Collection: `admins`
3. Document ID: `megharaj@admin.com`
4. Fields:
   ```
   email:     megharaj@admin.com  (string)
   role:      admin                (string)
   createdAt: [server timestamp]  (timestamp)
   ```

### Step 3: Login!
1. Go to: **http://localhost:3001/admin/login**
2. Enter credentials above
3. Click **Sign In**
4. You're in! 🎉

---

## 📱 Quick Links

**Website**: http://localhost:3001  
**Admin Login**: http://localhost:3001/admin/login  
**Dashboard**: http://localhost:3001/admin/dashboard  
**Products**: http://localhost:3001/admin/products  
**Inquiries**: http://localhost:3001/admin/inquiries  

---

## 🔑 Credentials

```
Email:    megharaj@admin.com
Password: Megh@2004
```

---

## ✨ What You Can Do

✅ Add/Edit/Delete Products  
✅ Upload Product Images  
✅ Manage Customer Inquiries  
✅ Contact via Email/Phone/WhatsApp  
✅ View Real-time Statistics  

---

## 📚 Documentation

- **ADMIN_SETUP.md** - Detailed setup guide
- **ADMIN_COMPLETE.md** - Complete feature list
- **README.md** - Full documentation

---

## 🆘 Troubleshooting

**Can't login?**
- Check email is exactly: `megharaj@admin.com`
- Check Firestore document ID matches email
- Check role field is: `admin`

**Need help?**
- Read ADMIN_SETUP.md
- Check Firebase Console for errors
- Open browser console (F12)

---

🎉 **Ready to manage your website!**
