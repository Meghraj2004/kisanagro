'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useClientSideEmail } from '@/lib/hooks/useClientSideEmail';

// Force dynamic rendering to prevent static generation errors with Firebase
export const dynamic = 'force-dynamic';
import { Product } from '@/types';
import { FiUpload, FiX, FiSave, FiLogOut } from 'react-icons/fi';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { user, loading, isAdmin } = useAdminAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title || '',
            category: data.category || 'Fruit Foam Nets',
            customCategory: data.customCategory || '',
            description: data.description || '',
            features: data.features || [''],
            images: data.images || [],
            priceMin: data.priceRange?.min?.toString() || '',
            priceMax: data.priceRange?.max?.toString() || '',
            minQuantity: data.minQuantity || '',
            sizeOptions: data.sizeOptions || [{ size: '', fruits: '', price: '' }],
            featured: data.featured || false,
          });
        } else {
          alert('Product not found!');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product.');
      } finally {
        setLoadingProduct(false);
      }
    };

    if (isAdmin && params.id) {
      fetchProduct();
    }
  }, [isAdmin, params.id, router]);

  if (loading || loadingProduct) {
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
    setFormData((prev) => ({
      ...prev,
      sizeOptions: prev.sizeOptions.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
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
    
    if (formData.images.length === 0) {
      alert('Please upload at least one product image.');
      return;
    }

    setSaving(true);
    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Prepare update data without undefined values
      const updateData: any = {
        title: formData.title,
        slug,
        category: formData.category,
        description: formData.description,
        features: formData.features.filter((f) => f.trim() !== ''),
        images: formData.images,
        featured: formData.featured,
        sizeOptions: formData.sizeOptions.filter((opt) => opt.size.trim() !== '' || opt.fruits.trim() !== '' || opt.price.trim() !== ''),
        updatedAt: serverTimestamp(),
      };

      // Only add customCategory if it's "Other" and has a value
      if (formData.category === 'Other' && formData.customCategory?.trim()) {
        updateData.customCategory = formData.customCategory.trim();
      }

      // Only add priceRange if both min and max are provided
      if (formData.priceMin && formData.priceMax) {
        updateData.priceRange = {
          min: parseFloat(formData.priceMin),
          max: parseFloat(formData.priceMax)
        };
      }

      // Only add minQuantity if it has a value
      if (formData.minQuantity?.trim()) {
        updateData.minQuantity = formData.minQuantity.trim();
      }

      await updateDoc(doc(db, 'products', params.id), updateData);

      alert('Product updated successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
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
      {/* Admin Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-xs sm:text-sm text-gray-600 suppress-hydration-warning">
                {user?.email || 'Admin'}
              </p>
              <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-1">
                <Link href="/admin/dashboard" className="text-xs text-gray-600 hover:text-primary-600 whitespace-nowrap">
                  Dashboard
                </Link>
                <Link href="/admin/products" className="text-xs text-gray-600 hover:text-primary-600 whitespace-nowrap">
                  Products
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <FiLogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 sm:py-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Basic Information</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  className="input text-sm sm:text-base"
                  placeholder="e.g., Premium EPE Foam Net"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="flex items-start sm:items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-edit"
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 mt-0.5 sm:mt-0 flex-shrink-0"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <label htmlFor="featured-edit" className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed">
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
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Size Options & Specifications</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Add size options with corresponding fruits they support</p>
            
            <div className="space-y-3 sm:space-y-4">
              {formData.sizeOptions.map((option, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size (mm)
                    </label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="e.g., 40x80x180 mm"
                      value={option.size}
                      onChange={(e) => handleSizeOptionChange(index, 'size', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      For Fruits
                    </label>
                    <input
                      type="text"
                      className="input text-sm"
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
                        className="input text-sm"
                        placeholder="₹ price"
                        value={option.price}
                        onChange={(e) => handleSizeOptionChange(index, 'price', e.target.value)}
                      />
                    </div>
                    {formData.sizeOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeOption(index)}
                        className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50 p-2 flex-shrink-0"
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
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Product Images *</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Upload Button */}
              <div>
                <label className="btn btn-secondary cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm">
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
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Upload up to 10MB per image. Images will be automatically compressed and resized for optimal storage.
                </p>
              </div>

              {/* Image Preview - Mobile Optimized */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 sm:h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-primary-600 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
            <Link href="/admin/products" className="text-center sm:text-left text-gray-600 hover:underline text-sm order-2 sm:order-1">
              ← Back to Products
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base py-3 sm:py-2 order-1 sm:order-2"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
