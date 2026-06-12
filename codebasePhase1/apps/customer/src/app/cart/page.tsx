'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    items,
    totalAmount,
    totalItemsCount,
    isLoading: cartLoading,
    updateQuantity,
    removeFromCart,
    isUpdating,
    isRemoving,
  } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) return;
    try {
      await updateQuantity({ id: itemId, quantity: newQty });
      toast('Quantity updated successfully.', 'success');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast(error.response?.data?.error || 'Failed to update item quantity.', 'error');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast('Item removed from cart.', 'success');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast(error.response?.data?.error || 'Failed to remove item.', 'error');
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-550 dark:text-slate-400">Loading your shopping basket...</p>
        </div>
      </div>
    );
  }

  const shippingCharge = totalAmount > 1000 ? 0 : items.length > 0 ? 99 : 0;
  const gstTax = totalAmount * 0.18;
  const grandTotal = totalAmount + shippingCharge + gstTax;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] pb-24 lg:pb-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-indigo-600 transition">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium dark:text-white">Shopping Cart</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
            You have {totalItemsCount} custom item{totalItemsCount === 1 ? '' : 's'} in your basket
          </p>
        </div>
        <Button variant="ghost" asChild className="self-start sm:self-center text-xs">
          <Link href="/products" className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
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
            <ShoppingBag className="h-8 w-8 text-slate-450 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
            Customize blank canvases or upload artwork to customize your order.
          </p>
          <Button asChild>
            <Link href="/products">Browse Catalog</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Cart items listing */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const product = item.productVariant.product;
                const image = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Product Image preview */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        {/* Title and stats details */}
                        <div className="flex-grow text-center sm:text-left min-w-0">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                            <Link href={`/products/${product.id}`} className="hover:text-indigo-650 transition">
                              {product.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            {product.category?.name || 'Custom Merchandise'}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start text-[10px] text-slate-500 font-semibold">
                            <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                              Variant: {item.productVariant.name}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                              SKU: {item.productVariant.sku}
                            </span>
                          </div>
                        </div>

                        {/* Control buttons group */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                          <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 rounded"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={isUpdating}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[75px] font-bold text-slate-900 dark:text-white text-sm">
                            ₹{(Number(item.productVariant.price) * item.quantity).toLocaleString('en-IN')}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving}
                            className="p-2 text-slate-450 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Cart Pricing summary panel */}
          <div className="lg:col-span-4">
            <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900 sticky top-24">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Wholesale Subtotal ({totalItemsCount} items)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% inclusive)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{gstTax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery fee</span>
                    <span className="font-bold">
                      {shippingCharge === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        `₹${shippingCharge}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between font-extrabold text-base text-slate-900 dark:text-white">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-2">
                  <Button asChild className="w-full h-11 text-sm font-bold flex items-center justify-center gap-1.5">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Mobile Sticky CTA footer block (Bottom Sheet Action Pattern) */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 px-6 z-40 shadow-2xl flex items-center justify-between pb-safe">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total amount</span>
            <span className="text-lg font-black text-slate-900 dark:text-white block">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <Button asChild className="h-11 px-6 font-bold flex items-center gap-1.5">
            <Link href="/checkout">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
