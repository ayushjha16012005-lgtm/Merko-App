'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, Card, CardContent, CardHeader, Input, Dialog, DialogHeader, DialogTitle, DialogFooter } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import { useToast } from '@merko/ui';
import { Plus, Check } from 'lucide-react';
import Link from 'next/link';

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

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    addresses,
    isLoading: addressesLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const openAddDialog = () => {
    setEditingAddress(null);
    setName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('India');
    setIsDefault(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (addr: Address) => {
    setEditingAddress(addr);
    setName(addr.name);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country || 'India');
    setIsDefault(addr.isDefault);
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !addressLine1 || !city || !state || !postalCode) {
      toast('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      name,
      phone,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      city,
      state,
      postalCode,
      country,
      isDefault,
    };

    try {
      if (editingAddress) {
        await updateAddress({ id: editingAddress.id, data: payload });
        toast('The delivery address details have been saved.', 'success');
      } else {
        await createAddress(payload);
        toast('The new delivery address has been saved.', 'success');
      }
      setIsDialogOpen(false);
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      toast(axiosError.response?.data?.error || 'Failed to save address details.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        toast('The address was removed successfully.', 'success');
      } catch (err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        toast(axiosError.response?.data?.error || 'Failed to delete address.', 'error');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast('Selected address is now set as your default.', 'success');
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      toast(axiosError.response?.data?.error || 'Failed to set default address.', 'error');
    }
  };

  if (authLoading || addressesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto min-h-[80vh]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link href="/profile" className="hover:text-indigo-600 transition">Profile</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold dark:text-white">Address Book</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Delivery Addresses
          </h1>
        </div>
        <Button onClick={openAddDialog} className="flex items-center gap-1.5 self-start sm:self-center text-xs">
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <span className="text-5xl block mb-4">📍</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Saved Addresses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Please add an address to streamline your checkout process.
          </p>
          <Button onClick={openAddDialog}>Add Your First Address</Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <AnimatePresence>
            {addresses.map((addr: Address) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full flex flex-col justify-between border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900 ${
                  addr.isDefault ? 'ring-2 ring-indigo-600 dark:ring-indigo-400' : ''
                }`}>
                  <div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{addr.name}</span>
                        {addr.isDefault && (
                          <Badge className="bg-indigo-50 text-indigo-755 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 text-[9px] font-extrabold">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 text-slate-550 dark:text-slate-350 text-xs leading-relaxed">
                      <p>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                      <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p>{addr.country}</p>
                      <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase">Phone: {addr.phone}</p>
                    </CardContent>
                  </div>
                  <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-b-xl">
                    {!addr.isDefault ? (
                      <Button variant="ghost" size="sm" onClick={() => handleSetDefault(addr.id)} className="text-xs h-8">
                        Set Default
                      </Button>
                    ) : (
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase dark:text-indigo-400 flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Primary Address
                      </span>
                    )}
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(addr)} className="text-xs h-8">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 text-xs h-8" onClick={() => handleDelete(addr.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Dialog form modal */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 py-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Receiver Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sarah Connor" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Phone Number *</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Street Address *</label>
              <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required placeholder="123 Cyberdyne Systems Blvd" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-500">Apartment, Suite, Unit, etc. (Optional)</label>
              <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt 4B" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">City *</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Los Angeles" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">State *</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} required placeholder="California" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Postal / Zip Code *</label>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required placeholder="90001" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">Country *</label>
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
              <label htmlFor="default-check" className="text-slate-550 dark:text-slate-400 font-medium">
                Set as default shipping address
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" className="text-xs">
              {editingAddress ? 'Save Changes' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
