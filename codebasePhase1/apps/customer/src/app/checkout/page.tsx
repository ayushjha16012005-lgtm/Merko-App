'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogHeader, DialogTitle, DialogFooter, useToast } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { useOrders } from '@/hooks/useOrders';
import { MapPin, ShoppingBag, ArrowRight, ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { items, totalAmount, isLoading: cartLoading } = useCart();
  const { addresses, isLoading: addressesLoading, createAddress } = useAddresses();
  const { placeOrder, isPlacingOrder } = useOrders();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Address creation fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Set default address when loaded
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((addr: Address) => addr.isDefault);
      setSelectedAddressId(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      const newAddr = await createAddress({
        name,
        phone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        postalCode,
        country,
        isDefault,
      });
      toast('Shipping address saved successfully.', 'success');
      setSelectedAddressId(newAddr.id);
      setIsDialogOpen(false);
      
      // Reset fields
      setName('');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast(error.response?.data?.error || 'Failed to save shipping address.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast('Please select a shipping address to proceed.', 'error');
      return;
    }

    try {
      const order = await placeOrder({ shippingAddressId: selectedAddressId });
      toast('Order placed successfully!', 'success');
      router.push(`/orders/${order.id}`);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast(error.response?.data?.error || 'Failed to place order.', 'error');
    }
  };

  if (authLoading || cartLoading || addressesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Preparing checkout terminal...</p>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Cart is Empty</h2>
        <p className="text-slate-500 mb-8">You must add items to your cart before proceeding to checkout.</p>
        <Button asChild>
          <Link href="/products">Go to Catalog</Link>
        </Button>
      </div>
    );
  }

  const shippingCharge = totalAmount > 1000 ? 0 : 99;
  const gstTax = totalAmount * 0.18;
  const grandTotal = totalAmount + shippingCharge + gstTax;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh] pb-24 lg:pb-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/cart" className="hover:text-indigo-600 transition">Cart</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium dark:text-white">Checkout</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Secure Checkout
        </h1>
      </div>

      {/* Modern Horizontal Steps Progress */}
      <div className="mb-8 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">1</span>
          <span className="font-bold text-slate-900 dark:text-white">Shipping</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-slate-100 dark:border-slate-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">2</span>
          <span className="font-bold text-slate-900 dark:text-white">Review</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold text-[10px]">3</span>
          <span className="font-bold text-slate-400">Payment</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Address Selection */}
          <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Select Shipping Address
              </CardTitle>
              <Button size="sm" onClick={() => setIsDialogOpen(true)} className="flex items-center gap-1 text-xs self-start sm:self-center">
                <Plus className="h-3.5 w-3.5" /> Add Address
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-4">No shipping addresses saved in your profile.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>Create Address</Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((addr: Address) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        selectedAddressId === addr.id
                          ? 'border-indigo-600 ring-2 ring-indigo-500/10 bg-indigo-50/5 dark:border-indigo-400 dark:bg-indigo-950/10'
                          : 'border-slate-200 hover:border-slate-350 bg-white dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="rounded bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{addr.addressLine2}</p>}
                        <p className="text-xs text-slate-550 dark:text-slate-400">
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        Phone: {addr.phone}
                      </p>
                      {selectedAddressId === addr.id && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-650 text-white">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items Review Card */}
          <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                Review Purchase Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => {
                const product = item.productVariant.product;
                const activeImg = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
                
                return (
                  <div key={item.id} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                    <img
                      src={activeImg}
                      alt={product.name}
                      className="h-14 w-14 object-cover rounded-lg bg-slate-50 border border-slate-200/50 dark:border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{product.name}</h4>
                      <p className="text-xs text-slate-500">Variant: {item.productVariant.name} · Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      ₹{(Number(item.productVariant.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Sidebar Panel */}
        <div className="lg:col-span-4">
          <Card className="border-slate-200/80 bg-white shadow-md dark:border-slate-800/60 dark:bg-slate-900 sticky top-24">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-bold">Billing Details</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax (18% inclusive)</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-250">₹{gstTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold">
                    {shippingCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingCharge}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-3.5 flex justify-between font-extrabold text-base text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-3 flex gap-2 text-[10px] text-slate-500 border border-slate-200/50 dark:border-slate-800">
                <ShieldCheck className="h-4.5 w-4.5 text-green-550 flex-shrink-0" />
                <span>Orders custom print artwork is approved instantly on checkout payment confirmation.</span>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || addresses.length === 0}
                  className="w-full h-11 text-sm font-bold flex items-center justify-center gap-1.5"
                >
                  {isPlacingOrder ? 'Completing Order...' : 'Place Your Order'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Checkout CTA bar (Bottom Sheet pattern) */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-850 p-4 px-6 z-40 shadow-2xl flex items-center justify-between pb-safe">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Checkout total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white block">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <Button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || addresses.length === 0}
            className="h-11 px-6 font-bold flex items-center gap-1.5"
          >
            {isPlacingOrder ? 'Processing...' : 'Place Order'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add New Address Dialog modal */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Add Shipping Address</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateAddress}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Receiver Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sarah Connor" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone Number *</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Street Address *</label>
              <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required placeholder="123 Cyberdyne Systems Blvd" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Apartment, Suite, Unit, etc. (Optional)</label>
              <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt 4B" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">City *</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Los Angeles" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">State *</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} required placeholder="California" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Postal / Zip Code *</label>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required placeholder="90001" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Country *</label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} required placeholder="United States" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="default-check"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="default-check" className="text-xs text-slate-550 dark:text-slate-400 font-medium">
                Set as default shipping address
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Address
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
