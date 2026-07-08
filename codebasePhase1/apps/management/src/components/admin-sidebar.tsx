'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@merko/ui';
import { 
  LayoutDashboard, Package, FolderTree, ClipboardList, Home, 
  Settings, ShieldCheck, Users, ShieldAlert, CreditCard, 
  Truck, RotateCcw, DollarSign, BarChart3 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const operationsItems = [
    { href: '/', label: 'Console Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/orders', label: 'Order Pipeline', icon: ClipboardList },
    ...(user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('payments') 
      ? [{ href: '/payments', label: 'Payments', icon: CreditCard }] 
      : []),
    { href: '/shipments', label: 'Shipments', icon: Truck },
    { href: '/returns', label: 'Returns', icon: RotateCcw },
    ...(user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('payments') 
      ? [{ href: '/refunds', label: 'Refunds', icon: DollarSign }] 
      : []),
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const catalogItems = [
    { href: '/products', label: 'Products', icon: Package },
    { href: '/categories', label: 'Categories', icon: FolderTree },
  ];

  const groups = [
    { title: 'Operations', items: operationsItems },
    { title: 'Catalog', items: catalogItems },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    groups.push({
      title: 'Platform Admin',
      items: [
        { href: '/access-requests', label: 'Access Requests', icon: ShieldCheck },
        { href: '/super-admins', label: 'Super Admins', icon: Users },
        { href: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
      ],
    });
  }

  return (
    <aside className="flex w-64 flex-col justify-between border-r border-slate-200 bg-slate-900 text-slate-350 dark:border-slate-800 flex-shrink-0">
      <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-140px)]">
        {/* Workspace Brand Block */}
        <div className="flex h-16 items-center border-b border-slate-800 px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-black text-white text-sm">
              M
            </span>
            <span className="text-sm font-bold tracking-wider text-white">MERKO ADMIN</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/30 rounded px-1.5 py-0.5 bg-indigo-50/10">v2.0</span>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          {groups.map((group) => (
            <div key={group.title} className="space-y-2">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                {group.title}
              </span>
              <nav className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        isActive
                          ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-400' : 'text-slate-500')} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Settings & Profile */}
      <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/20 flex-shrink-0">
        <Link 
          href="/settings" 
          className="flex items-center justify-between px-3 text-xs text-slate-500 hover:text-slate-300 transition"
        >
          <span className="flex items-center gap-2 font-medium">
            <Settings className="h-4 w-4" /> System Settings
          </span>
        </Link>

        <div className="flex items-center justify-between rounded-xl bg-slate-950/30 p-3 border border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400">
              {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'AD'}
            </div>
            <div className="text-xs">
              <p className="font-semibold leading-tight text-white">
                {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">Role: {user?.role || 'ADMIN'}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-red-500 hover:opacity-80 transition shrink-0"
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
