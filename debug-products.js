// Temporary debug script to check products in Firebase
// Run this in browser console on the website

async function debugProducts() {
  try {
    // Check if we can access Firebase
    if (typeof db === 'undefined') {
      console.log('❌ Firebase db not accessible');
      return;
    }
    
    console.log('🔍 Checking products in database...');
    
    // Get all products
    const { collection, getDocs } = window.firebase;
    const snapshot = await getDocs(collection(db, 'products'));
    
    console.log(`📊 Total products in database: ${snapshot.docs.length}`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Product ${index + 1}:`, {
        id: doc.id,
        title: data.title,
        featured: data.featured,
        category: data.category,
        hasImages: data.images && data.images.length > 0
      });
    });
    
    // Count featured products
    const featuredCount = snapshot.docs.filter(doc => doc.data().featured === true).length;
    console.log(`✨ Featured products: ${featuredCount}`);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// To use: Open browser console and run: debugProducts()
console.log('Debug function created. Run debugProducts() to check products.');