import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type Language = 'en' | 'hi' | 'ta' | 'bn' | 'mr';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  loading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.cart': 'Cart',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.contact': 'Contact',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.price': 'Price',
    'common.stock': 'Stock',
    'common.category': 'Category',
    'common.quantity': 'Quantity',
    'common.total': 'Total',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.actions': 'Actions',
    
    // Products
    'products.title': 'Products',
    'products.addProduct': 'Add Product',
    'products.searchProducts': 'Search products...',
    'products.allCategories': 'All Categories',
    'products.sortBy': 'Sort by',
    'products.sortLowToHigh': 'Price: Low to High',
    'products.sortHighToLow': 'Price: High to Low',
    'products.addToCart': 'Add to Cart',
    'products.outOfStock': 'Out of Stock',
    'products.inStock': 'In Stock',
    'products.lowStock': 'Low Stock',
    'products.perKg': 'per kg',
    'products.supplier': 'Supplier',
    
    // Categories
    'category.vegetables': 'Vegetables',
    'category.spices': 'Spices',
    'category.snacks': 'Snacks',
    'category.beverages': 'Beverages',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Tax (18%)',
    'cart.total': 'Total',
    'cart.placeOrder': 'Place Order',
    'cart.remove': 'Remove',
    'cart.updateQuantity': 'Update quantity',
    
    // Orders
    'orders.title': 'Orders',
    'orders.myOrders': 'My Orders',
    'orders.incomingOrders': 'Incoming Orders',
    'orders.orderHistory': 'Order History',
    'orders.noOrders': 'No orders found',
    'orders.orderDetails': 'Order Details',
    'orders.trackOrder': 'Track Order',
    
    // Order Status
    'status.pending': 'Pending',
    'status.confirmed': 'Confirmed',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled',
    
    // Time Slots
    'timeSlot.morning': 'Morning (6AM-12PM)',
    'timeSlot.afternoon': 'Afternoon (12PM-6PM)',
    'timeSlot.evening': 'Evening (6PM-10PM)',
    
    // Tracking Status
    'tracking.orderConfirmed': 'Order Confirmed',
    'tracking.pickedUp': 'Picked Up',
    'tracking.inTransit': 'In Transit',
    'tracking.outForDelivery': 'Out for Delivery',
    'tracking.delivered': 'Delivered',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.pendingOrders': 'Pending Orders',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.quickActions': 'Quick Actions',
    
    // Profile
    'profile.title': 'Profile',
    'profile.fullName': 'Full Name',
    'profile.location': 'Location',
    'profile.phone': 'Phone',
    'profile.role': 'Role',
    'profile.language': 'Language',
    'profile.updateProfile': 'Update Profile',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    
    // Messages
    'message.success': 'Success!',
    'message.error': 'Error occurred',
    'message.orderPlaced': 'Order placed successfully',
    'message.profileUpdated': 'Profile updated successfully',
    'message.productAdded': 'Product added successfully',
    'message.productUpdated': 'Product updated successfully',
    'message.productDeleted': 'Product deleted successfully'
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.products': 'उत्पाद',
    'nav.cart': 'कार्ट',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉगआउट',
    'nav.contact': 'संपर्क',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.add': 'जोड़ें',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.price': 'कीमत',
    'common.stock': 'स्टॉक',
    'common.category': 'श्रेणी',
    'common.quantity': 'मात्रा',
    'common.total': 'कुल',
    'common.status': 'स्थिति',
    'common.date': 'तारीख',
    'common.actions': 'कार्य',
    
    // Products
    'products.title': 'उत्पाद',
    'products.addProduct': 'उत्पाद जोड़ें',
    'products.searchProducts': 'उत्पाद खोजें...',
    'products.allCategories': 'सभी श्रेणियां',
    'products.sortBy': 'क्रमबद्ध करें',
    'products.sortLowToHigh': 'कीमत: कम से ज्यादा',
    'products.sortHighToLow': 'कीमत: ज्यादा से कम',
    'products.addToCart': 'कार्ट में जोड़ें',
    'products.outOfStock': 'स्टॉक खत्म',
    'products.inStock': 'स्टॉक में है',
    'products.lowStock': 'कम स्टॉक',
    'products.perKg': 'प्रति किलो',
    'products.supplier': 'आपूर्तिकर्ता',
    
    // Categories  
    'category.vegetables': 'सब्जियां',
    'category.spices': 'मसाले',
    'category.snacks': 'नाश्ता',
    'category.beverages': 'पेय पदार्थ',
    
    // Cart
    'cart.title': 'शॉपिंग कार्ट',
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.subtotal': 'उप-योग',
    'cart.tax': 'कर (18%)',
    'cart.total': 'कुल',
    'cart.placeOrder': 'ऑर्डर दें',
    'cart.remove': 'हटाएं',
    'cart.updateQuantity': 'मात्रा अपडेट करें'
  },
  ta: {
    // Navigation
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.products': 'தயாரிப்புகள்',
    'nav.cart': 'கார்ட்',
    'nav.orders': 'ஆர்டர்கள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.logout': 'வெளியேறு',
    'nav.contact': 'தொடர்பு',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.save': 'சேமி',
    'common.cancel': 'ரத்து செய்',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
    'common.add': 'சேர்',
    'common.search': 'தேடு',
    'common.filter': 'வடிகட்டி',
    'common.price': 'விலை',
    'common.stock': 'கையிருப்பு',
    'common.category': 'வகை',
    'common.quantity': 'அளவு',
    'common.total': 'மொத்தம்',
    'common.status': 'நிலை',
    'common.date': 'தேதி',
    'common.actions': 'செயல்கள்'
  },
  bn: {
    // Navigation
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.products': 'পণ্য',
    'nav.cart': 'কার্ট',
    'nav.orders': 'অর্ডার',
    'nav.profile': 'প্রোফাইল',
    'nav.logout': 'লগআউট',
    'nav.contact': 'যোগাযোগ',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সেভ করুন',
    'common.cancel': 'বাতিল',
    'common.delete': 'মুছুন',
    'common.edit': 'সম্পাদনা',
    'common.add': 'যোগ করুন',
    'common.search': 'খোঁজ',
    'common.filter': 'ফিল্টার',
    'common.price': 'দাম',
    'common.stock': 'স্টক',
    'common.category': 'ক্যাটাগরি',
    'common.quantity': 'পরিমাণ',
    'common.total': 'মোট',
    'common.status': 'অবস্থা',
    'common.date': 'তারিখ',
    'common.actions': 'কর্ম'
  },
  mr: {
    // Navigation
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.products': 'उत्पादने',
    'nav.cart': 'कार्ट',
    'nav.orders': 'ऑर्डर',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉगआउट',
    'nav.contact': 'संपर्क',
    
    // Common
    'common.loading': 'लोड होत आहे...',
    'common.save': 'जतन करा',
    'common.cancel': 'रद्द करा',
    'common.delete': 'हटवा',
    'common.edit': 'संपादित करा',
    'common.add': 'जोडा',
    'common.search': 'शोधा',
    'common.filter': 'फिल्टर',
    'common.price': 'किंमत',
    'common.stock': 'स्टॉक',
    'common.category': 'श्रेणी',
    'common.quantity': 'प्रमाण',
    'common.total': 'एकूण',
    'common.status': 'स्थिती',
    'common.date': 'तारीख',
    'common.actions': 'कृती'
  }
};

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      // First, try to get user's saved preference
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.language_preference) {
            setLanguageState(profile.language_preference as Language);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Could not fetch user language preference:', error);
        }
      }

      // Fallback to browser language detection
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = ['hi', 'ta', 'bn', 'mr'].includes(browserLang) 
        ? browserLang as Language 
        : 'en';
      
      setLanguageState(supportedLang);
      setLoading(false);
    };

    initializeLanguage();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    // Save to user profile if logged in
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ language_preference: lang })
          .eq('user_id', user.id);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key] || translations.en[key] || key;
    return translation;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};