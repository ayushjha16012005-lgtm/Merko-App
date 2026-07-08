'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useToast } from '@merko/ui';
import { useAuthStore } from '@/stores/auth-store';
import { LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { language, changeLanguage, t } = useLanguage();

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setIsLogoutOpen(false);
      toast(t('toasts.logoutSuccess'), 'success');
      router.push('/login');
    } catch {
      toast(t('toasts.logoutError'), 'error');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-xl font-black text-transparent tracking-tight dark:from-indigo-400 dark:to-indigo-200"
          >
            MERKO
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="/products"
              className="text-xs font-bold text-slate-650 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              {language === 'hi' ? 'उत्पाद सूची' : 'Browse Products'}
            </Link>
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <a
                href="http://localhost:3001/dashboard"
                className="text-xs font-bold text-slate-650 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                {t('header.adminPanel')}
              </a>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
            className="text-xs font-black h-8 px-3 rounded-lg border-slate-200 hover:bg-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all shrink-0"
          >
            {language === 'en' ? 'हिन्दी' : 'English'}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link href="/profile" className="text-xs font-semibold text-slate-650 hover:text-indigo-600 transition dark:text-slate-350">
                {(language === 'hi' ? 'नमस्ते, ' : 'Hi, ')}<span className="font-bold text-slate-850 dark:text-white">{user?.firstName}</span>
              </Link>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="text-red-500 hover:opacity-85 transition shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                title={t('header.logout')}
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" asChild className="text-xs font-semibold h-8 px-3">
                <Link href="/login">{t('header.login')}</Link>
              </Button>
              <Button size="sm" asChild className="text-xs font-semibold h-8 px-3 bg-indigo-600 hover:bg-indigo-750 text-white">
                <Link href="/register">{t('header.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT CONFIRMATION DIALOG MODAL */}
      <Dialog isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)}>
        <DialogHeader>
          <DialogTitle>{t('header.confirmLogoutTitle')}</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {t('header.confirmLogoutDesc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2.5 justify-end mt-4">
          <Button
            variant="outline"
            className="text-xs font-bold px-4 h-9.5 rounded-xl"
            onClick={() => setIsLogoutOpen(false)}
          >
            {t('header.cancel')}
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 h-9.5 rounded-xl shadow-sm border-none"
            onClick={handleLogoutConfirm}
          >
            {t('header.logout')}
          </Button>
        </DialogFooter>
      </Dialog>
    </header>
  );
}
