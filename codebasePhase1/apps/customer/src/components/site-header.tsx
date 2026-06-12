'use client';

import Link from 'next/link';
import { Button } from '@merko/ui';
import { useAuthStore } from '@/stores/auth-store';

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-2xl font-bold text-transparent"
          >
            MERKO
          </Link>
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="/products"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              Browse Products
            </Link>
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <a
                href="http://localhost:3001/dashboard"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                Admin Panel
              </a>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition dark:text-slate-300">
                Hi, <span className="font-semibold text-slate-900 dark:text-white">{user?.firstName}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
