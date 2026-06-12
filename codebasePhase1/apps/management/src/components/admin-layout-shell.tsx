'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { Badge } from '@merko/ui';
import { Menu, X } from 'lucide-react';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Auto-close sidebar on mobile when navigating to another view
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      {/* Sidebar - Desktop is statically positioned, Mobile/Tablet uses translate-x slide-over */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex h-full flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar />
      </div>

      {/* Backdrop for mobile sidebar when open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main viewport area */}
      <div className="flex flex-1 flex-col h-screen overflow-hidden min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 md:px-8 dark:border-slate-800/40 dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile/tablet */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-755 focus:outline-none lg:hidden"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-slate-600 dark:text-slate-350" /> : <Menu className="h-5 w-5 text-slate-600 dark:text-slate-350" />}
            </button>
            <span className="text-[10px] sm:text-xs font-mono text-slate-450 dark:text-slate-400 truncate">
              Environment: Development (SQLite)
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="success" className="font-extrabold text-[9px] tracking-wider uppercase">
              System Operational
            </Badge>
          </div>
        </header>

        <main className="w-full flex-grow p-4 md:p-8 overflow-y-auto min-w-0">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
