'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@merko/ui';
import { useCart } from '@/hooks/useCart';
import { useUiStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export function CartDrawer() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cartDrawerOpen, setCartDrawerOpen } = useUiStore();
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartDrawerOpen(false);
    };
    if (cartDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [cartDrawerOpen, setCartDrawerOpen]);

  if (!isAuthenticated || !cartDrawerOpen) return null;

  const shippingCharge = totalAmount > 1000 ? 0 : items.length > 0 ? 99 : 0;
  const gstTax = totalAmount * 0.18;
  const grandTotal = totalAmount + shippingCharge + gstTax;

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    router.push('/checkout');
  };

  const handleUpdateQty = async (itemId: string, qty: number, change: number) => {
    const nextQty = qty + change;
    if (nextQty > 0) {
      await updateQuantity({ id: itemId, quantity: nextQty });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCartDrawerOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Drawer container panel */}
        <motion.div
          ref={drawerRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          // Switch to slide-up on mobile bottom-sheet
          className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/80 mobile-bottom-sheet"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              Shopping Cart ({totalItemsCount})
            </h2>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart items list - scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cartLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <ShoppingBag className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Your basket is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                    Add custom items from our catalog to get started.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setCartDrawerOpen(false); router.push('/products'); }}>
                  Browse Products
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const product = item.productVariant.product;
                const image = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
                
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-xl border border-slate-150/60 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-950/20"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                        {item.productVariant.name}
                      </p>

                      {/* Quantity adjusting controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-950 p-0.5">
                          <button
                            disabled={item.quantity <= 1 || isUpdating}
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ₹{(Number(item.productVariant.price) * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            disabled={isRemoving}
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Checkout Summary & Safe Area Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-200/60 dark:border-slate-800/60 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/20 space-y-4 pb-safe">
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% inclusive)</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-250">₹{gstTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery fee</span>
                  <span className="font-bold text-slate-850 dark:text-slate-250">
                    {shippingCharge === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingCharge}`}
                  </span>
                </div>
                <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" asChild onClick={() => setCartDrawerOpen(false)}>
                  <Link href="/cart">Full View</Link>
                </Button>
                <Button onClick={handleCheckoutClick} className="w-full flex items-center justify-center gap-1.5">
                  Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
