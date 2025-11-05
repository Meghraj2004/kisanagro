'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useClientSideEmail } from '@/lib/hooks/useClientSideEmail';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';
import { FiUpload, FiX, FiSave, FiLogOut } from 'react-icons/fi';

export default function NewProductPage() {
  const { user, loading, isAdmin } = useAdminAuth();
  const clientEmail = useClientSideEmail(user);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Fruit Foam Nets',
    customCategory: '',
    description: '',
    features: [''],
    images: [] as string[],
    priceMin: '',
    priceMax: '',
    minQuantity: '',
    sizeOptions: [{ size: '', fruits: '', price: '' }],
    featured: false,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push('/admin/login');
    return null;
  }

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if image is larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL(file.type, quality);
          
          console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedBase64.length / 1024).toFixed(2)}KB`);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Convert and compress images
      const compressedImages = await Promise.all(
        files.map(async (file) => {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name} is not an image`);
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} exceeds 10MB limit`);
          }

          // Compress image to reduce base64 size
          const compressed = await compressImage(file, 1200, 0.8);
          
          // Check if compressed size is still too large for Firestore (800KB limit to be safe)
          const sizeInKB = compressed.length / 1024;
          if (sizeInKB > 800) {
            // Try compressing more aggressively
            console.log('Image still too large, compressing more...');
            return await compressImage(file, 800, 0.6);
          }
          
          return compressed;
        })
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedImages],
      }));
      alert(`${files.length} image(s) uploaded and compressed successfully!`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert(error.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSizeOptionChange = (index: number, field: string, value: string) => {
    const newSizeOptions = [...formData.sizeOptions];
    newSizeOptions[index] = { ...newSizeOptions[index], [field]: value };
    setFormData((prev) => ({ ...prev, sizeOptions: newSizeOptions }));
  };

  const handleAddSizeOption = () => {
    setFormData((prev) => ({
      ...prev,
      sizeOptions: [...prev.sizeOptions, { size: '', fruits: '', price: '' }],
    }));
  };

  const handleRemoveSizeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizeOptions: prev.sizeOptions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form Data:', formData);
    
    if (formData.images.length === 0) {
      alert('Please upload at least one product image.');
      return;
    }

    setSaving(true);
    try {
      console.log('Creating slug from title:', formData.title);
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      console.log('Generated slug:', slug);
      
      // Prepare product data without undefined values
      const productData: any = {
        title: formData.title,
        slug,
        category: formData.category,
        description: formData.description,
        features: formData.features.filter((f) => f.trim() !== ''),
        images: formData.images,
        featured: formData.featured,
        sizeOptions: formData.sizeOptions.filter((opt) => opt.size.trim() !== '' || opt.fruits.trim() !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Only add customCategory if it's "Other" and has a value
      if (formData.category === 'Other' && formData.customCategory?.trim()) {
        productData.customCategory = formData.customCategory.trim();
      }

      // Only add priceRange if both min and max are provided
      if (formData.priceMin && formData.priceMax) {
        productData.priceRange = {
          min: parseFloat(formData.priceMin),
          max: parseFloat(formData.priceMax)
        };
      }

      // Only add minQuantity if it has a value
      if (formData.minQuantity?.trim()) {
        productData.minQuantity = formData.minQuantity.trim();
      }
      
      console.log('Product data to save:', productData);
      console.log('Database instance:', db);
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      console.log('Product added successfully! Doc ID:', docRef.id);
      alert('Product added successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      console.error('=== ERROR ADDING PRODUCT ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      alert(`Failed to add product: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-sm text-gray-600 mt-1" suppressHydrationWarning>
                {clientEmail || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/admin/products" className="text-gray-600 hover:text-primary-600">
                Products
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g., Premium EPE Foam Net"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                  ⭐ Feature this product on homepage
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, customCategory: '' })}
                >
                  <option value="Fruit Foam Nets">Fruit Foam Nets</option>
                  <option value="EPE Foam">EPE Foam</option>
                  <option value="Protective Packaging">Protective Packaging</option>
                  <option value="Agriculture Supplies">Agriculture Supplies</option>
                  <option value="Other">Other</option>
                </select>
                
                {formData.category === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="Enter custom category name"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  className="input"
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>


            </div>
          </div>

          {/* Size Options & Fruit Specifications */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Size Options & Specifications</h2>
            <p className="text-sm text-gray-600 mb-4">Add size options with corresponding fruits they support</p>
            
            <div className="space-y-3">
              {formData.sizeOptions.map((option, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size (mm)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., 40x80x180 mm"
                      value={option.size}
                      onChange={(e) => handleSizeOptionChange(index, 'size', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      For Fruits
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., For Guava (100 gm to 500 gm weight)"
                      value={option.fruits}
                      onChange={(e) => handleSizeOptionChange(index, 'fruits', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="input"
                        placeholder="₹ price"
                        value={option.price}
                        onChange={(e) => handleSizeOptionChange(index, 'price', e.target.value)}
                      />
                    </div>
                    {formData.sizeOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeOption(index)}
                        className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50 h-10"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddSizeOption}
                className="btn btn-outline text-primary-600 border-primary-600 hover:bg-primary-50"
              >
                + Add Size Option
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Product Features</h2>
            
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="e.g., Lightweight and durable"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddFeature}
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                + Add Feature
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Price Range</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="e.g., 100"
                  value={formData.priceMin}
                  onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="e.g., 500"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Quantity
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., 1000 pieces"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
              />
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Product Images *</h2>
            
            <div className="space-y-4">
              {/* Upload Button */}
              <div>
                <label className="btn btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <FiUpload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Upload up to 10MB per image. Images will be automatically compressed and resized for optimal storage.
                </p>
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link href="/admin/products" className="text-gray-600 hover:underline">
              ← Back to Products
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
