'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, Card, CardHeader, CardTitle, Input } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@merko/ui';
import { RecentlyViewed } from '@/components/recently-viewed';
import { Recommendations } from '@/components/recommendations';
import { User, ShieldCheck, Mail, Phone, Lock, Palette, ExternalLink, Calendar, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile, isUpdatingProfile, changePassword, isChangingPassword } = useAuth();
  const { orders, isLoadingOrders } = useOrders();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'designs'>('info');

  interface SavedDraft {
    id: string;
    productId: string;
    productName: string;
    variantId?: string | null;
    variantName: string;
    name: string;
    fileUrl: string;
    fileType: string;
    config: Record<string, unknown>; // Using customizer configurations
    createdAt: string;
  }

  // Load local drafts state
  const [localDrafts, setLocalDrafts] = useState<SavedDesignItem[]>([]);
  useEffect(() => {
    if (user?.id) {
      const draftsStr = localStorage.getItem(`merko_saved_designs_${user.id}`);
      if (draftsStr) {
        try {
          const drafts: SavedDraft[] = JSON.parse(draftsStr);
          setLocalDrafts(drafts.map((d) => ({
            id: d.id,
            fileName: d.name,
            fileUrl: d.fileUrl,
            fileType: d.fileType || 'image/png',
            orderNumber: 'DRAFT',
            orderId: 'draft',
            createdAt: d.createdAt,
            productId: d.productId,
            isDraft: true,
          })));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user?.id]);

  const handleDeleteDraft = (draftId: string) => {
    if (!user?.id) return;
    const draftsStr = localStorage.getItem(`merko_saved_designs_${user.id}`);
    if (draftsStr) {
      try {
        const drafts: SavedDraft[] = JSON.parse(draftsStr);
        const filtered = drafts.filter((d) => d.id !== draftId);
        localStorage.setItem(`merko_saved_designs_${user.id}`, JSON.stringify(filtered));
        setLocalDrafts(prev => prev.filter(d => d.id !== draftId));
        toast('Draft design deleted successfully.', 'info');
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ firstName, lastName, phone });
      toast('Your personal settings have been successfully updated.', 'success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.response?.data?.error || 'Something went wrong while updating profile', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('New password and confirmation do not match.', 'error');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      toast('Your password has been changed successfully. Please log in again.', 'success');
      router.push('/login');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.response?.data?.error || 'Failed to update password. Verify current password.', 'error');
    }
  };

  interface SavedDesignItem {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    orderNumber: string;
    orderId: string;
    createdAt: string;
    productId?: string;
    isDraft?: boolean;
  }

  // Extract saved designs from past orders
  const savedDesigns = orders.reduce<SavedDesignItem[]>((acc, ord) => {
    if (ord.designFiles && ord.designFiles.length > 0) {
      ord.designFiles.forEach((file) => {
        if (!acc.some((f) => f.fileUrl === file.fileUrl)) {
          acc.push({
            id: file.id,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileType: file.fileType,
            orderNumber: ord.orderNumber,
            orderId: ord.id,
            createdAt: file.uploadedAt || ord.createdAt,
          });
        }
      });
    }
    return acc;
  }, []);

  const allSavedDesigns = [...localDrafts, ...savedDesigns];

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto min-h-[85vh]">
      {/* Profile summary banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <Card className="flex flex-col items-center gap-6 p-6 sm:p-8 sm:flex-row border-slate-200/80 bg-white shadow-md dark:border-slate-800/60 dark:bg-slate-900">
          <div className="flex h-16 w-16 select-none items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {user.firstName?.[0] || ''}
            {user.lastName?.[0] || ''}
          </div>
          <div className="flex-grow space-y-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 self-center text-[9px] font-extrabold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Account Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {user.email} · Role: <span className="font-semibold">{user.role}</span>
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Tabs navigation & detail panel */}
      <div className="flex flex-col gap-6 md:flex-row items-start">
        {/* Left Side Tab Navigation */}
        <aside className="w-full flex-shrink-0 md:w-60">
          <Card className="flex flex-col gap-1 p-3 border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <Button
              variant={activeTab === 'info' ? 'default' : 'ghost'}
              className="justify-start text-xs h-9"
              onClick={() => setActiveTab('info')}
            >
              <User className="mr-2 h-4 w-4" /> {language === 'hi' ? 'व्यक्तिगत सेटिंग्स' : 'Personal Settings'}
            </Button>
            <Button
              variant={activeTab === 'password' ? 'default' : 'ghost'}
              className="justify-start text-xs h-9"
              onClick={() => setActiveTab('password')}
            >
              <Lock className="mr-2 h-4 w-4" /> {language === 'hi' ? 'पासवर्ड बदलें' : 'Change Password'}
            </Button>
            <Button
              variant={activeTab === 'designs' ? 'default' : 'ghost'}
              className="justify-start text-xs h-9"
              onClick={() => setActiveTab('designs')}
            >
              <Palette className="mr-2 h-4 w-4" /> {language === 'hi' ? `सहेजे गए डिज़ाइन (${allSavedDesigns.length})` : `Saved Designs (${allSavedDesigns.length})`}
            </Button>
            <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
            <Button
              variant="ghost"
              className="justify-start text-xs text-indigo-650 hover:text-indigo-750 hover:bg-indigo-50/50 dark:text-indigo-400 dark:hover:bg-slate-800 h-9"
              asChild
            >
              <Link href="/profile/addresses">
                <span className="mr-2">📍</span> {language === 'hi' ? 'पते प्रबंधित करें' : 'Manage Addresses'}
              </Link>
            </Button>
          </Card>
        </aside>

        {/* Right Active Panel */}
        <Card className="flex-grow p-6 sm:p-8 border-slate-200/80 bg-white shadow-md dark:border-slate-800/60 dark:bg-slate-900 w-full min-h-[320px]">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-0 pb-3">
                  <CardTitle className="text-base font-bold">{language === 'hi' ? 'व्यक्तिगत सेटिंग्स' : 'Personal Settings'}</CardTitle>
                </CardHeader>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {t('auth.firstNameLabel')}
                      </label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {t('auth.lastNameLabel')}
                      </label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {language === 'hi' ? 'ईमेल पता (अपरिवर्तनीय)' : 'Email Address (Unchangeable)'}
                      </label>
                      <Input type="email" value={user.email} disabled className="opacity-60 cursor-not-allowed text-xs h-9" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {t('auth.phoneLabel')}
                      </label>
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                    <Button type="submit" disabled={isUpdatingProfile} className="text-xs h-9">
                      {isUpdatingProfile ? (language === 'hi' ? 'सेटिंग्स सहेजी जा रही हैं...' : 'Saving Changes...') : (language === 'hi' ? 'सेटिंग्स सहेजें' : 'Save Settings')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-0 pb-3">
                  <CardTitle className="text-base font-bold">{language === 'hi' ? 'खाता पासवर्ड अपडेट करें' : 'Update Account Password'}</CardTitle>
                </CardHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {language === 'hi' ? 'वर्तमान पासवर्ड' : 'Current Password'}
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {t('auth.newPasswordLabel')}
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {t('auth.confirmNewPasswordLabel')}
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                    <Button type="submit" disabled={isChangingPassword} className="text-xs h-9">
                      {isChangingPassword ? t('auth.updating') : (language === 'hi' ? 'पासवर्ड बदलें' : 'Change Password')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'designs' && (
              <motion.div
                key="designs"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-0 pb-3">
                  <CardTitle className="text-base font-bold">{language === 'hi' ? 'कस्टम डिज़ाइन लाइब्रेरी' : 'Custom Designs Library'}</CardTitle>
                </CardHeader>

                {isLoadingOrders ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-650 border-t-transparent" />
                  </div>
                ) : allSavedDesigns.length === 0 ? (
                  <div className="text-center py-10">
                    <Palette className="h-10 w-10 text-slate-350 mx-auto mb-3" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{language === 'hi' ? 'कोई कस्टम डिज़ाइन सहेजा नहीं गया है' : 'No custom designs stored'}</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 max-w-[240px] mx-auto mb-6">
                      {language === 'hi' ? 'जिन डिज़ाइनों को आप कस्टमाइज़ करते हैं और सहेजते हैं या ऑर्डर करते हैं, वे यहाँ दिखाई देंगे।' : 'Designs you customize and save or order appear here.'}
                    </p>
                    <Button asChild size="sm">
                      <Link href="/products">{language === 'hi' ? 'उत्पाद खाली चुनें' : 'Select Product Blank'}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {allSavedDesigns.map((file: any) => (
                      <div 
                        key={file.id} 
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 shadow-xs"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950 dark:text-indigo-400 flex-shrink-0">
                          <Palette className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-grow text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                          <p className={`text-[10px] font-medium mt-0.5 uppercase ${file.isDraft ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>
                            {file.isDraft ? (language === 'hi' ? 'प्रारूप अवधि' : 'DRAFT DURATION') : `${file.fileType.split('/').pop()} · Order ${file.orderNumber}`}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(file.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {file.isDraft ? (
                            <>
                              <Button variant="outline" size="sm" asChild className="h-8 px-2.5 text-xs">
                                <Link href={`/products/${file.productId}?draftId=${file.id}`} className="flex items-center gap-1">
                                  <Edit className="h-3 w-3 text-orange-500" /> {language === 'hi' ? 'जारी रखें' : 'Resume'}
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-750 hover:bg-red-50"
                                onClick={() => handleDeleteDraft(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs">
                              <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                {language === 'hi' ? 'देखें' : 'View'} <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Recently Viewed & Recommended Carousel Personalization Widgets */}
      <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-8 space-y-6">
        <RecentlyViewed />
        <Recommendations limit={4} />
      </div>
    </div>
  );
}
