'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Badge, Button, Card, CardContent, Select, useToast } from '@merko/ui';
import type { ProductResponseDto } from '@merko/types';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { SlidersHorizontal, RefreshCw, XCircle, Heart, Star, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

function ProductsCatalog() {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  const initialSearch = searchParams?.get('search') || '';
  const initialCategory = searchParams?.get('categoryId') || 'all';

  const [searchVal, setSearchVal] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [page, setPage] = useState(1);

  // Sync state with search params from URL
  useEffect(() => {
    const q = searchParams?.get('search') || '';
    const cat = searchParams?.get('categoryId') || 'all';
    setSearchVal(q);
    setDebouncedSearch(q);
    setSelectedCategory(cat);
  }, [searchParams]);
  const limit = 9; // Show 9 items per page for a clean 3x3 grid on desktop

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1); // reset to first page on search
    }, 450);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useCategories();

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts({
    search: debouncedSearch,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    page,
    limit,
  });

  const categories = categoriesData?.data || [];
  const productsResponse = productsData?.data || [];
  const pagination = productsData?.pagination;

  const { isAuthenticated } = useAuth();
  const { wishlistedIds, addToWishlist, removeFromWishlist } = useWishlist();
  const toggleWishlist = async (id: string, name: string) => {
    if (!isAuthenticated) {
      toast(t('products.loginToWishlist'), 'error');
      return;
    }
    const isVal = !wishlistedIds.has(id);
    try {
      if (isVal) {
        await addToWishlist(id);
        toast(language === 'hi' ? `"${name}" इच्छा-सूची में जोड़ा गया` : `Added "${name}" to wishlist`, 'success');
      } else {
        await removeFromWishlist(id);
        toast(language === 'hi' ? `"${name}" इच्छा-सूची से हटाया गया` : `Removed "${name}" from wishlist`, 'info');
      }
    } catch {
      toast(t('toasts.genericError'), 'error');
    }
  };

  // Cart action
  const [addingId, setAddingId] = useState<string | null>(null);
  const handleAddToCart = async (p: ProductResponseDto) => {
    const variantId = p.variants?.[0]?.id;
    if (!variantId) {
      toast(language === 'hi' ? 'इस उत्पाद के लिए कोई डिफ़ॉल्ट विकल्प नहीं मिला।' : 'No default variant found for this product.', 'error');
      return;
    }
    setAddingId(p.id);
    try {
      await addToCart({
        productVariantId: variantId,
        quantity: 1
      });
      toast(language === 'hi' ? `${p.name} कार्ट में जोड़ा गया!` : `Added ${p.name} to cart!`, 'success');
    } catch {
      toast(t('products.loginToCart'), 'error');
    } finally {
      setAddingId(null);
    }
  };

  // Client-side sorting
  const sortedProducts = [...productsResponse].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return Number(a.basePrice) - Number(b.basePrice);
    }
    if (sortBy === 'price_desc') {
      return Number(b.basePrice) - Number(a.basePrice);
    }
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name_desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  // Rating and review generator
  const getRatingData = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.4 + (sum % 7) * 0.1).toFixed(1);
    const count = 120 + (sum % 800);
    return { rating, count };
  };

  // Category Emoji Mapper
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('products.title')}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium dark:text-slate-400">
            {language === 'hi' ? 'प्रीमियम ब्लैंक्स, कस्टमाइज़ करने योग्य टेम्प्लेट और कच्चे माल की हमारी क्यूरेटेड लाइब्रेरी ब्राउज़ करें।' : 'Browse our curated library of premium blanks, customizable templates, and raw materials.'}
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('hero.searchPlaceholder')}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs h-9 rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Filter Panel */}
        <aside className="w-full flex-shrink-0 space-y-6 lg:w-64">
          <Card className="p-4 border-slate-200 bg-slate-50/30">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <h2 className="flex items-center gap-1.5 font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                {language === 'hi' ? 'फ़िल्टर' : 'Filters'}
              </h2>
              {(selectedCategory !== 'all' || searchVal || sortBy !== 'featured') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchVal('');
                    setSortBy('featured');
                  }}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 transition"
                >
                  {language === 'hi' ? 'रीसेट करें' : 'Reset'}
                </button>
              )}
            </div>

            {/* Categories filter */}
            <div className="mt-4 space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {language === 'hi' ? 'श्रेणियां' : 'Categories'}
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPage(1);
                  }}
                  className={`flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition ${
                    selectedCategory === 'all'
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  🛍️ {language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
                </button>
                {categoriesLoading ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="h-8 animate-pulse rounded bg-slate-100/50" />
                  ))
                ) : (
                  categories.map((cat) => {
                    const emoji = getCategoryEmoji(cat.slug);
                    const isSel = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setPage(1);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition ${
                          isSel
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-sm shrink-0">{emoji}</span>
                        <span className="line-clamp-1">{cat.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sorting Filter */}
            <div className="mt-6 space-y-2.5">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {language === 'hi' ? 'क्रमबद्ध करें' : 'Sort By'}
              </h3>
              <Select
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'featured', label: language === 'hi' ? 'विशेष रूप से प्रदर्शित' : 'Featured Natural' },
                  { value: 'price_asc', label: language === 'hi' ? 'कीमत: कम से अधिक' : 'Price: Low to High' },
                  { value: 'price_desc', label: language === 'hi' ? 'कीमत: अधिक से कम' : 'Price: High to Low' },
                  { value: 'name_asc', label: language === 'hi' ? 'वर्णानुक्रम: A से Z' : 'Name: A to Z' },
                  { value: 'name_desc', label: language === 'hi' ? 'वर्णानुक्रम: Z से A' : 'Name: Z to A' },
                ]}
              />
            </div>
          </Card>
        </aside>

        {/* Main Product Catalog Display */}
        <div className="flex-grow space-y-6">
          {/* Error State */}
          {productsError && (
            <Card className="py-16 text-center border-red-100 bg-red-50/10">
              <CardContent className="space-y-4">
                <XCircle className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="text-base font-bold text-slate-900">{language === 'hi' ? 'एपीआई कनेक्शन विफल' : 'API Connection Failed'}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {language === 'hi' ? 'डेटाबेस से कनेक्ट करने में असमर्थ। सुनिश्चित करें कि एपीआई सर्वर सक्रिय है।' : 'Unable to connect to the database. Ensure the API server is active.'}
                </p>
                <Button size="sm" onClick={() => refetchProducts()} className="flex items-center gap-1.5 mx-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9">
                  <RefreshCw className="h-4 w-4" /> {language === 'hi' ? 'कनेक्शन पुन: प्रयास करें' : 'Retry Connection'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading States */}
          {productsLoading && !productsError && (
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
                  <div className="aspect-square bg-slate-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/4 rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-5/6 rounded bg-slate-100" />
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <div className="h-5 w-1/3 rounded bg-slate-100" />
                      <div className="h-7 w-1/4 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {!productsLoading && sortedProducts.length === 0 && !productsError && (
            <Card className="py-20 text-center border-slate-200 bg-slate-50/30">
              <CardContent>
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl mx-auto">🔍</span>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">{language === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No Products Found'}</h3>
                <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
                  {language === 'hi' ? 'हमें आपके सक्रिय फ़िल्टर से मेल खाने वाले कोई भी उत्पाद नहीं मिले। अपने खोज मापदंडों को रीसेट करने का प्रयास करें।' : "We couldn't find any products matching your active filters. Try clearing your search parameters."}
                </p>
                <Button
                  size="sm"
                  className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchVal('');
                  }}
                >
                  {language === 'hi' ? 'सभी फ़िल्टर साफ़ करें' : 'Clear All Filters'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Grid Layout of products */}
          {!productsLoading && sortedProducts.length > 0 && !productsError && (
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((p) => {
                const { rating, count } = getRatingData(p.id);
                const isFav = wishlistedIds.has(p.id);
                const image = p.images?.[0]?.imageUrl || p.category?.masterImageUrl || p.category?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400';
                
                // Check if all variants are out of stock
                const isOutOfStock = !p.variants || p.variants.length === 0 || p.variants.every((v: { stock?: number }) => (v.stock ?? 0) <= 0);

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
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    {/* Image Container */}
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      {/* Top Left Tag */}
                      <div className="absolute left-2.5 top-2.5">
                        <Badge className={`${isOutOfStock ? 'bg-slate-500' : 'bg-orange-500'} text-white font-black text-[8px] tracking-widest px-2 py-0.5 rounded-full border-none`}>
                          {isOutOfStock ? (language === 'hi' ? 'बिक गया' : 'SOLD OUT') : badgeText}
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

                    {/* Card Content details */}
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
                        <span className="text-[9px] text-slate-400 font-medium">{language === 'hi' ? '/इकाई' : '/unit'}</span>
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
                          disabled={addingId === p.id || isOutOfStock}
                          onClick={() => handleAddToCart(p)}
                          className={`${isOutOfStock ? 'bg-slate-100 text-slate-450 hover:bg-slate-150 border-none cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'bg-orange-500 hover:bg-orange-600 text-white'} font-bold text-[10px] h-8`}
                        >
                          {addingId === p.id ? t('products.adding') : isOutOfStock ? (language === 'hi' ? 'बिक गया' : 'Sold Out') : (language === 'hi' ? 'जोड़ें' : 'Add')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && !productsLoading && !productsError && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs font-bold h-9"
              >
                {language === 'hi' ? 'पिछला' : 'Previous'}
              </Button>
              {Array.from({ length: pagination.pages }).map((_, idx) => (
                <Button
                  key={idx}
                  variant={page === idx + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(idx + 1)}
                  className={`h-9 w-9 p-0 font-bold text-xs ${page === idx + 1 ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="text-xs font-bold h-9"
              >
                {language === 'hi' ? 'अगला' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-48">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    }>
      <ProductsCatalog />
    </Suspense>
  );
}
