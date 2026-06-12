import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import { SiteHeader } from '@/components/site-header';
import { CartDrawer } from '@/components/cart-drawer';
import { BottomNavigation } from '@/components/bottom-navigation';
import { ToastProvider } from '@merko/ui';

export const metadata: Metadata = {
  title: 'Merko | Custom Product Marketplace',
  description: 'Customize and order professional printed goods in under 5 minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50/50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50 pb-16 md:pb-0">
        <ToastProvider>
          <AppProviders>
            <Suspense fallback={<div className="h-16 border-b border-slate-200/80 bg-white dark:border-slate-800/40 dark:bg-slate-950" />}>
              <SiteHeader />
            </Suspense>
            <CartDrawer />
            <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <BottomNavigation />
            <footer className="border-t border-slate-200 bg-white py-12 text-slate-500 dark:border-slate-800/40 dark:bg-slate-950">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between space-y-4 px-4 sm:px-6 md:flex-row md:space-y-0 lg:px-8">
                <div className="text-xs">&copy; 2026 Merko Inc. All rights reserved.</div>
                <div className="flex gap-6 text-xs font-semibold text-slate-400">
                  <Link href="/products" className="hover:text-indigo-600 transition">Catalog</Link>
                  <Link href="/profile" className="hover:text-indigo-600 transition">Mock Profile</Link>
                </div>
              </div>
            </footer>
          </AppProviders>
        </ToastProvider>
      </body>
    </html>
  );
}

