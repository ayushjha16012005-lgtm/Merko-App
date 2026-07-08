'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, useToast } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { Heart, ArrowLeft, Star, Trash2 } from 'lucide-react';
import type { ProductResponseDto } from '@merko/types';
import { useLanguage } from '@/contexts/language-context';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRemove = async (productId: string, name: string) => {
    try {
      await removeFromWishlist(productId);
      toast(language === 'hi' ? `"${name}" आपकी इच्छा-सूची से हटा दिया गया है।` : `Removed "${name}" from your wishlist.`, 'success');
    } catch {
      toast(language === 'hi' ? 'इच्छा-सूची से आइटम हटाने में विफल।' : 'Failed to remove item from wishlist.', 'error');
    }
  };

  const handleAddToCart = async (product: ProductResponseDto) => {
    const variantId = product.variants?.[0]?.id;
    if (!variantId) {
      toast(language === 'hi' ? 'इस उत्पाद के लिए कोई डिफ़ॉल्ट विकल्प नहीं मिला।' : 'No default variant found for this product.', 'error');
      return;
    }
    setAddingId(product.id);
    try {
      await addToCart({
        productVariantId: variantId,
        quantity: 1,
      });
      toast(language === 'hi' ? `"${product.name}" कार्ट में जोड़ा गया!` : `Added "${product.name}" to cart!`, 'success');
    } catch {
      toast(language === 'hi' ? 'कृपया साइन इन करें या पुन: प्रयास करें।' : 'Please sign in or try again.', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const getRatingData = (id: string) => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rating = (4.4 + (sum % 7) * 0.1).toFixed(1);
    const count = 120 + (sum % 800);
    return { rating, count };
  };

  if (authLoading || wishlistLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">{language === 'hi' ? 'आपकी इच्छा-सूची लोड हो रही है...' : 'Loading your wishlist...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] pb-24">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-650 transition">{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium dark:text-white">{language === 'hi' ? 'इच्छा-सूची' : 'Wishlist'}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {language === 'hi' ? 'मेरी इच्छा-सूची' : 'My Wishlist'}
          </h1>
          <p className="text-sm text-slate-555 dark:text-slate-400 mt-1">
            {language === 'hi' 
              ? `आपके पास ${items.length} आइटम सहेजे गए हैं` 
              : `You have ${items.length} item${items.length === 1 ? '' : 's'} saved`
            }
          </p>
        </div>
        <Button variant="ghost" asChild className="self-start sm:self-center text-xs">
          <Link href="/products" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
            <ArrowLeft className="h-4 w-4" />
            {language === 'hi' ? 'खरीदारी जारी रखें' : 'Continue Shopping'}
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800/80"
        >
          <div className="relative mx-auto h-16 w-16 text-slate-300 dark:text-slate-700 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Heart className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {language === 'hi' ? 'आपकी इच्छा-सूची खाली है' : 'Your wishlist is empty'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
            {language === 'hi' ? 'दिल के आइकन पर क्लिक करके अपने पसंदीदा कस्टम ब्लैंक्स या प्रिंट्स को सहेज कर रखें।' : 'Keep track of custom blanks or prints you like by clicking the heart icon.'}
          </p>
          <Button asChild>
            <Link href="/products">{language === 'hi' ? 'कैटलॉग देखें' : 'Explore Catalog'}</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          <AnimatePresence>
            {items.map((item) => {
              const p = item.product;
              const { rating, count } = getRatingData(p.id);
              const image = p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400';
              const isOutOfStock = !p.variants || p.variants.length === 0 || p.variants.every((v) => (v.stock ?? 0) <= 0);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition dark:border-slate-850 dark:bg-slate-900">
                    {/* Image Container */}
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                      <Image
                        src={image}
                        alt={p.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(p.id, p.name)}
                        className="absolute right-2.5 top-2.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm hover:bg-red-50 transition dark:bg-slate-900/95 dark:hover:bg-slate-800"
                        title={language === 'hi' ? 'इच्छा-सूची से हटाएं' : 'Remove from wishlist'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Card Content details */}
                    <div className="flex flex-1 flex-col p-4 bg-white dark:bg-slate-900">
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
                        {p.category?.name || 'CUSTOM CANVASES'}
                      </span>
                      <h3 className="mt-1 font-bold text-slate-850 line-clamp-1 text-xs dark:text-white hover:text-indigo-650 transition">
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
                          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-[10px] h-8"
                          asChild
                        >
                          <Link href={`/products/${p.id}`}>{language === 'hi' ? 'कस्टमाइज़' : 'Customize'}</Link>
                        </Button>
                        <Button
                          size="sm"
                          disabled={addingId === p.id || isOutOfStock}
                          onClick={() => handleAddToCart(p)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] h-8"
                        >
                          {addingId === p.id ? t('products.adding') : isOutOfStock ? (language === 'hi' ? 'बिक गया' : 'Sold Out') : (language === 'hi' ? 'जोड़ें' : 'Add')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
