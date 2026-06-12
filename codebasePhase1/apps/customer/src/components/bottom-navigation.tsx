'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Upload, ClipboardList, User } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Browse', path: '/products', icon: Search },
    { label: 'Upload', path: '/products', icon: Upload, isFloating: true },
    { label: 'Orders', path: '/orders', icon: ClipboardList },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/95 pb-safe backdrop-blur-md dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center justify-around px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          
          if (item.isFloating) {
            return (
              <div key={item.label} className="w-14 h-10 flex items-center justify-center">
                <Link
                  href="/products"
                  className="absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-transform active:scale-95 border-4 border-white dark:border-slate-950 hover:bg-orange-600"
                >
                  <Icon className="h-5.5 w-5.5" />
                </Link>
              </div>
            );
          }
          
          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-14 text-center transition ${
                isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
