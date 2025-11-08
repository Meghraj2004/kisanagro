import slugify from 'slugify';

export const createSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  // Add professional footer to message
  const professionalMessage = `${message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🏭 *KISANAGRO* - Premium Fruit Protection\n🌐 www.kisanagro.com\n⭐ Quality • Reliability • Trust`;
  
  const encodedMessage = encodeURIComponent(professionalMessage);
  // Format phone number for WhatsApp (add country code if not present)
  const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

export const getProductImageUrl = (productId: string, imageName: string): string => {
  return `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/products%2F${productId}%2F${imageName}?alt=media`;
};
