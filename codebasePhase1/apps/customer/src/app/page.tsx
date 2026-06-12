'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge, Button, Card, Input, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useToast } from '@merko/ui';
import type { ProductResponseDto } from '@merko/types';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useCart } from '@/hooks/useCart';
import { 
  ArrowRight, 
  Upload, 
  RefreshCw, 
  Truck, 
  Zap, 
  Heart, 
  Star, 
  ChevronRight, 
  Calculator, 
  X,
  Info
} from 'lucide-react';

export default function HomePage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { orders, isLoadingOrders } = useOrders();
  const { addToCart } = useCart();

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

  // Local Wishlist state
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const toggleWishlist = (id: string, name: string) => {
    setWishlisted((prev) => {
      const isVal = !prev[id];
      toast(isVal ? `Added ${name} to wishlist` : `Removed ${name} from wishlist`, 'info');
      return { ...prev, [id]: isVal };
    });
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
      
      {/* 1. Category Pills directly below search bar (top of page content) */}
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategoryId(undefined)}
            className={`flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              selectedCategoryId === undefined
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800'
            }`}
          >
            🛍️ All Products
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

      {/* 2. Greeting Section */}
      <div className="pt-2">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {isAuthenticated && user
            ? `Good morning, ${user.firstName} 👋`
            : 'Good morning! 👋'}
        </h1>
        <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-0.5">
          What would you like to print today?
        </p>
      </div>

      {/* 3. Orange + Blue Banner Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Orange Banner: Business Printing Solutions */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-md flex justify-between items-center group">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Enterprise
            </span>
            <h3 className="text-lg font-black mt-2">Business Printing Solutions</h3>
            <p className="text-xs text-orange-50 font-medium leading-relaxed max-w-[280px]">
              Custom branding, bulk production and corporate merchandise.
            </p>
          </div>
          <Link
            href="/products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
          >
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Blue Banner: Free Shipping */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md flex justify-between items-center group">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Always On
            </span>
            <h3 className="text-lg font-black mt-2">Free Shipping</h3>
            <p className="text-xs text-blue-50 font-medium leading-relaxed max-w-[280px]">
              On all orders above ₹5,000 across India.
            </p>
          </div>
          <Link
            href="/products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition">Upload Design</h4>
            <p className="mt-0.5 text-[10px] text-slate-500">Customise your artwork</p>
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition">Reorder</h4>
            <p className="mt-0.5 text-[10px] text-slate-500">Repeat an order</p>
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition">Track Order</h4>
            <p className="mt-0.5 text-[10px] text-slate-500">Live tracking</p>
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
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition">Quick Quote</h4>
            <p className="mt-0.5 text-[10px] text-slate-500">Get pricing now</p>
          </div>
        </button>
      </div>

      {/* 5. Shop by Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Shop by Category
          </h2>
          <Link href="/products" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition">
            See all <ChevronRight className="h-4.5 w-4.5" />
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
            Featured Products
          </h2>
          <Link href="/products" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition">
            See all <ChevronRight className="h-4.5 w-4.5" />
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
              const isFav = !!wishlisted[p.id];
              const image = p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=400';
              
              // Dynamic badges
              let badgeText = 'NEW';
              if (p.category?.slug.includes('creative')) badgeText = 'POPULAR';
              else if (p.category?.slug.includes('modern')) badgeText = 'BEST SELLER';
              else if (p.category?.slug.includes('birthday')) badgeText = 'PREMIUM';

              return (
                <div 
                  key={p.id} 
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Image and Badges */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <Image
                      src={image}
                      alt={p.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
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
                        <Link href={`/products/${p.id}`}>Customize</Link>
                      </Button>
                      <Button
                        size="sm"
                        disabled={addingId === p.id}
                        onClick={() => handleAddToCart(p)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] h-8"
                      >
                        {addingId === p.id ? 'Adding...' : 'Add'}
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
              Recent Orders
            </h2>
            <Link href="/orders" className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition">
              See all <ChevronRight className="h-4.5 w-4.5" />
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
                  <Image src={design.fileUrl} alt={design.fileName} fill className="object-cover" />
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
                      <Link href={`/products`}>Reorder</Link>
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
            <span>Quick Quote Calculator</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Get instant price estimations for bulk orders including default volume discounts.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Product Category
            </label>
            <select
              value={quoteCategory}
              onChange={(e) => setQuoteCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-orange-500 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Select a category</option>
              <option value="shirts">Custom Apparel (T-Shirts)</option>
              <option value="cards">Matte Business Cards</option>
              <option value="cups">Ceramic Mugs</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Quantity units
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
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Estimated Total:</span>
                <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                  ₹{estimatedPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="mt-1.5 text-[9px] text-slate-450 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>Includes tiered volume discounts. Taxes & shipping calculated at checkout.</span>
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
            Close
          </Button>
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
            onClick={() => {
              setIsQuoteOpen(false);
              toast('Quote applied. Please select variants in catalog.', 'success');
            }}
          >
            Browse Blanks
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
