export interface SizeOption {
  size: string;
  fruits: string;
  price: string; // Made required
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  customCategory?: string; // For "Other" category
  images: string[];
  description: string;
  features: string[];
  featured?: boolean; // Featured product flag
  // Pricing Information
  priceRange?: {
    min: number;
    max: number;
  };
  minQuantity?: string;
  // Size and Fruit Specifications
  sizeOptions?: SizeOption[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiryItem {
  productId: string;
  productTitle: string;
  fruitName: string;
  size: string;
  quantity: string;
}

export interface ProductSelection {
  productId: string;
  productTitle: string;
  category: string;
  fruitName: string;
  size: string;
  quantity: string;
  price?: string;
}

export interface InquiryProduct {
  productId: string;
  productTitle: string;
  selectedSizes: {
    size: string;
    quantity: number;
    unit: string;
  }[];
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  // Single product inquiry (legacy)
  productId?: string;
  productTitle?: string;
  fruitName?: string;
  size?: string;
  quantity?: string;
  // Multiple products inquiry (legacy format)
  products?: ProductInquiryItem[];
  // Multiple products inquiry (new format with enhanced details)
  selectedProducts?: ProductSelection[];
  message: string;
  createdAt: Date;
  notifiedEmail: boolean;
  notifiedWhatsapp: boolean;
  status?: 'new' | 'contacted' | 'closed';
}

export interface Admin {
  email: string;
  phone: string;
  role: 'admin';
  createdAt: Date;
}

export interface SiteMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}
