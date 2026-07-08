'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, Input, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useToast } from '@merko/ui';
import type { ProductResponseDto } from '@merko/types';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useUiStore } from '@/stores/ui-store';
import { 
  ArrowRight, 
  Upload, 
  RefreshCw, 
  Truck, 
  Zap, 
  Heart, 
  ShoppingCart,
  Star, 
  ChevronRight, 
  Calculator, 
  X,
  Info,
  Search,
  Sparkles,
  Loader2
} from 'lucide-react';

import { useLanguage } from '@/contexts/language-context';

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { orders, isLoadingOrders } = useOrders();
  const { addToCart, totalItemsCount: cartCount } = useCart();
  const { wishlistedIds, addToWishlist, removeFromWishlist, totalItemsCount: wishlistCount } = useWishlist();
  const { setCartDrawerOpen } = useUiStore();
  const suggestionsRef = useRef<HTMLFormElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isGuestAuthModalOpen, setIsGuestAuthModalOpen] = useState(false);

  // Fetch search suggestions
  const { data: searchProductsData, isLoading: isSearching } = useProducts({
    search: searchQuery,
    limit: 5,
    isActive: true,
  });
  const suggestions = searchProductsData?.data || [];

  // Time-based greeting
  useEffect(() => {
    const hr = new Date().getHours();
    let greet = 'Good Morning';
    if (hr >= 5 && hr < 12) greet = language === 'hi' ? 'शुभ प्रभात' : 'Good Morning';
    else if (hr >= 12 && hr < 17) greet = language === 'hi' ? 'शुभ दोपहर' : 'Good Afternoon';
    else if (hr >= 17 && hr < 21) greet = language === 'hi' ? 'शुभ संध्या' : 'Good Evening';
    else greet = language === 'hi' ? 'शुभ रात्रि' : 'Good Night';
    const userName = user?.firstName || '';
    setGreeting(userName ? `${greet}, ${userName} 👋` : `${greet} 👋`);
  }, [user, isAuthenticated, language]);

  // Click outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (productId: string) => {
    setSearchQuery('');
    setIsFocused(false);
    router.push(`/products/${productId}`);
  };

  // Selected Category Pill state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  
  // Dynamic Categories and Products queries
  const { data: categoriesData } = useCategories({ limit: 100 });
  const categories = categoriesData?.data || [];
  
  const { data: productsData, isLoading: productsLoading } = useProducts({
    categoryId: selectedCategoryId,
    limit: 20
  });
  const products = productsData?.data || [];

  const toggleWishlist = async (id: string, name: string) => {
    if (!isAuthenticated) {
      toast('Please log in to add items to wishlist.', 'error');
      return;
    }
    const isVal = !wishlistedIds.has(id);
    try {
      if (isVal) {
        await addToWishlist(id);
        toast(`Added "${name}" to wishlist`, 'success');
      } else {
        await removeFromWishlist(id);
        toast(`Removed "${name}" from wishlist`, 'info');
      }
    } catch {
      toast('Failed to update wishlist.', 'error');
    }
  };

  // Cart action
  const [addingId, setAddingId] = useState<string | null>(null);
  const handleAddToCart = async (p: ProductResponseDto) => {
    const variantId = p.variants?.[0]?.id;
    if (!variantId) {
      toast('No default variant found for this product.', 'error');
      return;
    }
    setAddingId(p.id);
    try {
      await addToCart({
        productVariantId: variantId,
        quantity: 1
      });
      toast(`Added ${p.name} to cart!`, 'success');
    } catch {
      toast('Please log in to add items to cart.', 'error');
    } finally {
      setAddingId(null);
    }
  };

  // Quick Quote state
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteCategory, setQuoteCategory] = useState('');
  const [quoteQty, setQuoteQty] = useState(100);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const calculateQuote = useCallback(() => {
    if (!quoteCategory) return;
    let base = 250;
    if (quoteCategory === 'shirts') base = 350;
    else if (quoteCategory === 'cards') base = 1.5;
    else if (quoteCategory === 'cups') base = 199;
    
    // Volume discount
    let multiplier = 1;
    if (quoteQty >= 500) multiplier = 0.7;
    else if (quoteQty >= 250) multiplier = 0.8;
    else if (quoteQty >= 100) multiplier = 0.9;

    setEstimatedPrice(base * quoteQty * multiplier);
  }, [quoteCategory, quoteQty]);

  useEffect(() => {
    calculateQuote();
  }, [calculateQuote]);



  interface SavedDesign {
    id: string;
    fileName: string;
    fileUrl: string;
    productName: string;
    createdAt: string | Date;
  }

  // Compute Saved Designs from orders
  const savedDesigns = orders.reduce<SavedDesign[]>((acc, ord) => {
    if (ord.designFiles && ord.designFiles.length > 0) {
      ord.designFiles.forEach((file) => {
        if (!acc.some((f) => f.fileUrl === file.fileUrl)) {
          acc.push({
            id: file.id,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            productName: ord.items?.[0]?.productName || 'Custom Blanks',
            createdAt: file.uploadedAt || ord.createdAt
          });
        }
      });
    }
    return acc;
  }, []);

  // Rating and review generator
  const getRatingData = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.4 + (sum % 7) * 0.1).toFixed(1);
    const count = 120 + (sum % 800);
    return { rating, count };
  };

  // Category Emoji Mapper (Fallback)
  const getCategoryEmoji = (slug: string) => {
    if (slug.includes('creative') || slug.includes('modern') || slug.includes('id-card')) return '🪪';
    if (slug.includes('birthday')) return '🎂';
    if (slug.includes('branding') || slug.includes('advertising') || slug.includes('banner')) return '📢';
    if (slug.includes('mdf-gift')) return '🪵';
    if (slug.includes('mdf-home')) return '🖼️';
    if (slug.includes('acrylic-products') || slug.includes('block') || slug.includes('frame')) return '☕';
    return '📦';
  };

  return (
    <div className="space-y-6 pb-12 bg-white text-slate-900 min-h-screen">
      {/* HERO SECTION */}
      <section className="space-y-4 pt-1">
        {/* 1. Greeting */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse shrink-0" />
            <span>{greeting || t('hero.welcome')}</span>
          </h1>
        </div>

        {/* 2 & 3. Search Bar and Wishlist + Cart Buttons */}
        {/* Desktop: Search bar + Wishlist + Cart on one row. Mobile: Search bar on row 1, Wishlist + Cart centered on row 2 */}
        <div className="flex flex-col md:flex-row items-center gap-3.5 w-full">
          {/* 2. Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:flex-grow max-w-2xl" ref={suggestionsRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                className="w-full pl-10 pr-8 py-2 text-xs h-10.5 rounded-xl border border-slate-200/90 bg-slate-50/70 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-450 hover:text-slate-650"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {isFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
                {isSearching ? (
                  <div className="flex items-center justify-center py-6 text-xs text-slate-450 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    <span>{t('hero.searching')}</span>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-500 font-medium">
                    {t('hero.noMatches')}
                  </div>
                ) : (
                  <div className="py-1">
                    {suggestions.map((p) => {
                      const image = p.images?.[0]?.imageUrl || p.category?.masterImageUrl || p.category?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=100';
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSuggestionClick(p.id)}
                          className="flex items-center w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition gap-3"
                        >
                          <div className="relative h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                            <Image src={image} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">{p.category?.name || 'Category'}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-100 shrink-0">
                            ₹{Number(p.basePrice).toFixed(0)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* 3. Wishlist + Cart Buttons */}
          <div className="flex items-center justify-center gap-3 w-full md:w-auto shrink-0">
            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  setIsGuestAuthModalOpen(true);
                } else {
                  router.push('/wishlist');
                }
              }}
              className="relative flex-1 md:flex-none inline-flex h-10.5 items-center justify-center space-x-2 rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-red-200 px-4 text-xs font-bold text-slate-700 hover:text-red-500 transition shadow-sm shrink-0"
            >
              <Heart className="h-4.5 w-4.5 shrink-0 fill-current" />
              <span>{t('hero.wishlist')}</span>
              {isAuthenticated && wishlistCount > 0 && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white leading-none">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  setIsGuestAuthModalOpen(true);
                } else {
                  setCartDrawerOpen(true);
                }
              }}
              className="relative flex-1 md:flex-none inline-flex h-10.5 items-center justify-center space-x-2 rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-200 px-4 text-xs font-bold text-slate-700 hover:text-indigo-600 transition shadow-sm shrink-0"
            >
              <ShoppingCart className="h-4.5 w-4.5 shrink-0" />
              <span>{t('hero.cart')}</span>
              {isAuthenticated && cartCount > 0 && (
                <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-black text-white leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 4. Categories */}
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide w-full">
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={`flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              selectedCategoryId === undefined
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800'
            }`}
          >
            🛍️ {t('hero.allProducts')}
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            const emoji = getCategoryEmoji(cat.slug);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800'
                }`}
              >
                <span>{emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Orange + Blue Banner Section */}
      <div className="grid gap-3.5 md:grid-cols-2 w-full">
        {/* Orange Banner: Business Printing Solutions */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-5 sm:p-6 text-white shadow-md flex justify-between items-center group w-full">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              {t('hero.enterpriseBadge')}
            </span>
            <h3 className="text-lg font-black mt-2">{t('hero.promo1Title')}</h3>
            <p className="text-xs text-orange-50 font-medium leading-relaxed max-w-[280px]">
              {t('hero.promo1Desc')}
            </p>
          </div>
          <Link
            href="/products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 ml-2"
          >
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Blue Banner: Free Shipping */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:p-6 text-white shadow-md flex justify-between items-center group w-full">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              {t('hero.alwaysOnBadge')}
            </span>
            <h3 className="text-lg font-black mt-2">{t('hero.promo2Title')}</h3>
            <p className="text-xs text-blue-50 font-medium leading-relaxed max-w-[280px]">
              {t('hero.promo2Desc')}
            </p>
          </div>
          <Link
            href="/products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 ml-2"
          >
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Upload Design */}
        <Link 
          href="/products" 
          className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 border border-orange-100/50 dark:bg-orange-950/30">
            <Upload className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition">
              {language === 'hi' ? 'डिज़ाइन अपलोड करें' : 'Upload Design'}
            </h4>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {language === 'hi' ? 'अपनी कलाकृति कस्टमाइज़ करें' : 'Customise your artwork'}
            </p>
          </div>
        </Link>

        {/* Reorder */}
        <Link 
          href="/profile" 
          className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 border border-blue-100/50 dark:bg-blue-950/30">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition">
              {t('hero.reorder')}
            </h4>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {language === 'hi' ? 'ऑर्डर दोहराएं' : 'Repeat an order'}
            </p>
          </div>
        </Link>

        {/* Track Order */}
        <Link 
          href="/orders" 
          className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 border border-emerald-100/50 dark:bg-emerald-950/30">
            <Truck className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition">
              {language === 'hi' ? 'ऑर्डर ट्रैक करें' : 'Track Order'}
            </h4>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {language === 'hi' ? 'लाइव ट्रैकिंग' : 'Live tracking'}
            </p>
          </div>
        </Link>

        {/* Quick Quote */}
        <button
          onClick={() => setIsQuoteOpen(true)}
          className="group text-left flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500 border border-purple-100/50 dark:bg-purple-950/30">
            <Zap className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition">
              {t('hero.quickQuote')}
            </h4>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {language === 'hi' ? 'मूल्य प्राप्त करें' : 'Get pricing now'}
            </p>
          </div>
        </button>
      </div>

      {/* 5. Shop by Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'hi' ? 'श्रेणी अनुसार खरीदें' : 'Shop by Category'}
          </h2>
          <Link href="/products" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition">
            {language === 'hi' ? 'सभी देखें' : 'See all'} <ChevronRight className="h-4.5 w-4.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {categories.map((cat) => {
            const emoji = getCategoryEmoji(cat.slug);
            const hasImage = !!cat.imageUrl;

            return (
              <Link
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-150 bg-white p-3 shadow-sm hover:shadow-md transition dark:border-slate-800/60 dark:bg-slate-900"
              >
                {hasImage ? (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                    <Image src={cat.imageUrl!} alt={cat.name} fill className="object-cover" />
                  </div>
                ) : (
                  <span className="text-lg shrink-0">{emoji}</span>
                )}
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            {language === 'hi' ? 'विशेष उत्पाद' : 'Featured Products'}
          </h2>
          <Link href="/products" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition">
            {language === 'hi' ? 'सभी देखें' : 'See all'} <ChevronRight className="h-4.5 w-4.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 w-3/4" />
                <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {products.map((p) => {
              const { rating, count } = getRatingData(p.id);
              const isFav = wishlistedIds.has(p.id);
              const image = p.images?.[0]?.imageUrl || p.category?.masterImageUrl || p.category?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400';
              
              // Dynamic badges
              let badgeText = 'NEW';
              if (p.category?.slug.includes('creative')) badgeText = 'POPULAR';
              else if (p.category?.slug.includes('modern')) badgeText = 'BEST SELLER';
              else if (p.category?.slug.includes('birthday')) badgeText = 'PREMIUM';

              // Parse crop config
              let cropStyle: React.CSSProperties = {};
              if (p.cropConfig) {
                try {
                  const crop = JSON.parse(p.cropConfig);
                  const width = crop.width || 100;
                  const height = crop.height || 100;
                  const left = crop.left || 0;
                  const top = crop.top || 0;
                  const scaleX = 100 / width;
                  const scaleY = 100 / height;
                  cropStyle = {
                    width: `${scaleX * 100}%`,
                    height: `${scaleY * 100}%`,
                    left: `${-left * scaleX}%`,
                    top: `${-top * scaleY}%`,
                    maxWidth: 'none',
                    position: 'absolute'
                  };
                } catch (e) {}
              }

              return (
                <div 
                  key={p.id} 
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Image and Badges */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div 
                      className="absolute inset-0"
                      style={Object.keys(cropStyle).length > 0 ? cropStyle : undefined}
                    >
                      <Image
                        src={image}
                        alt={p.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                    {/* Top Left Tag */}
                    <div className="absolute left-2.5 top-2.5">
                      <Badge className="bg-orange-500 text-white font-black text-[8px] tracking-widest px-2 py-0.5 rounded-full border-none">
                        {badgeText}
                      </Badge>
                    </div>
                    {/* Wishlist Icon */}
                    <button
                      onClick={() => toggleWishlist(p.id, p.name)}
                      className="absolute right-2.5 top-2.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/95 text-slate-400 hover:text-red-500 shadow-sm transition-colors dark:bg-slate-900/95"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Body details */}
                  <div className="flex flex-1 flex-col p-4 bg-white dark:bg-slate-900">
                    <span className="text-[8px] font-black uppercase tracking-widest text-orange-500">
                      {p.category?.name || 'CUSTOM CANVASES'}
                    </span>
                    <h3 className="mt-1 font-bold text-slate-850 line-clamp-1 text-xs dark:text-white hover:text-orange-500 transition">
                      <Link href={`/products/${p.id}`}>{p.name}</Link>
                    </h3>

                    {/* Star ratings */}
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span>{rating}</span>
                      <span className="text-slate-400 font-medium">({count})</span>
                    </div>

                    <div className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                      ₹{Number(p.basePrice).toFixed(0)}
                      <span className="text-[9px] text-slate-400 font-medium">/unit</span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600 font-bold text-[10px] h-8"
                        asChild
                      >
                        <Link href={`/products/${p.id}`}>{language === 'hi' ? 'कस्टमाइज़' : 'Customize'}</Link>
                      </Button>
                      <Button
                        size="sm"
                        disabled={addingId === p.id}
                        onClick={() => handleAddToCart(p)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] h-8"
                      >
                        {addingId === p.id ? t('products.adding') : (language === 'hi' ? 'जोड़ें' : 'Add')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 7. Recent Orders */}
      {isAuthenticated && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'hi' ? 'हाल के ऑर्डर' : 'Recent Orders'}
            </h2>
            <Link href="/orders" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition">
              {language === 'hi' ? 'सभी देखें' : 'See all'} <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          </div>

          {isLoadingOrders ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse dark:bg-slate-800" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500">No recent orders found. Place your first custom order now!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => {
                const isTransit = ord.status === 'SHIPPED' || ord.status === 'DISPATCHED';
                const isDelivered = ord.status === 'DELIVERED';
                const isPrinting = ord.status === 'PRINTING' || ord.status === 'PROCESSING';

                let statusLabel = ord.status;
                let statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
                if (isTransit) {
                  statusLabel = 'In Transit';
                  statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
                } else if (isDelivered) {
                  statusLabel = 'Delivered';
                  statusClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
                } else if (isPrinting) {
                  statusLabel = 'Printing';
                  statusClass = 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400';
                }

                const item = ord.items?.[0];
                const image = 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=100';

                return (
                  <Link 
                    key={ord.id} 
                    href={`/orders/${ord.id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-150 bg-white p-3 hover:shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                        <Image src={image} alt="Order item" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-850 dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
                          {item?.productName || 'Custom Blanks'}
                        </p>
                        <span className="text-[9px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-850 dark:text-white">
                          ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <ChevronRight className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 8. Saved Designs */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Saved Designs
        </h2>

        {savedDesigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-150 bg-slate-50/50 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <span className="text-3xl mb-2">📁</span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">No saved designs yet</h3>
            <p className="mt-1 text-[10px] text-slate-500 max-w-[200px]">
              Designs you upload during customization will appear here.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {savedDesigns.map((design) => (
              <div 
                key={design.id} 
                className="flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-[1.8/1] w-full bg-slate-50 dark:bg-slate-950">
                  <img src={design.fileUrl} alt={design.fileName} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4 bg-white dark:bg-slate-900">
                  <div>
                    <h4 className="text-xs font-black text-slate-850 dark:text-white line-clamp-1">
                      {design.fileName}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                      {new Date(design.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      {design.productName}
                    </span>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[9px] h-7 px-3" asChild>
                      <Link href={`/products`}>{t('hero.reorder')}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Quick Quote Modal dialog */}
      <Dialog isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)}>
        <DialogHeader className="relative">
          <button 
            onClick={() => setIsQuoteOpen(false)}
            className="absolute right-0 top-0 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-500" />
            <span>{t('hero.calculatorTitle')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {t('hero.calculatorDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t('hero.categoryLabel')}
            </label>
            <select
              value={quoteCategory}
              onChange={(e) => setQuoteCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-orange-500 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">{language === 'hi' ? 'श्रेणी चुनें' : 'Select a category'}</option>
              <option value="shirts">{language === 'hi' ? 'कस्टम परिधान (टी-शर्ट)' : 'Custom Apparel (T-Shirts)'}</option>
              <option value="cards">{language === 'hi' ? 'मैट बिजनेस कार्ड' : 'Matte Business Cards'}</option>
              <option value="cups">{language === 'hi' ? 'सिरेमिक मग' : 'Ceramic Mugs'}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t('hero.quantityLabel')}
            </label>
            <Input
              type="number"
              min={10}
              max={10000}
              value={quoteQty}
              onChange={(e) => setQuoteQty(parseInt(e.target.value) || 0)}
              className="w-full text-xs"
            />
          </div>

          {estimatedPrice !== null && quoteCategory && (
            <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('hero.estimatedTotal')}:</span>
                <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                  ₹{estimatedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="mt-1.5 text-[9px] text-slate-450 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>{t('hero.quoteInfo')}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-full text-xs font-bold" 
            onClick={() => setIsQuoteOpen(false)}
          >
            {t('hero.close')}
          </Button>
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
            onClick={() => {
              setIsQuoteOpen(false);
              toast(t('hero.quoteApplied'), 'success');
            }}
          >
            {t('hero.browseBlanks')}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* GUEST AUTHENTICATION MODAL DIALOG */}
      <Dialog isOpen={isGuestAuthModalOpen} onClose={() => setIsGuestAuthModalOpen(false)}>
        <DialogHeader className="text-center sm:text-center pt-2">
          <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
            {t('auth.guestModalTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
            {t('auth.guestModalDesc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 justify-center mt-6 w-full pb-2">
          <Button
            asChild
            className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-sm border-none"
            onClick={() => setIsGuestAuthModalOpen(false)}
          >
            <Link href="/login">{t('header.login')}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-1/2 font-bold text-xs h-10 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800"
            onClick={() => setIsGuestAuthModalOpen(false)}
          >
            <Link href="/register">{t('header.register')}</Link>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
