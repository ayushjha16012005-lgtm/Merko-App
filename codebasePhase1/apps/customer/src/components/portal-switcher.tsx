'use client';

import { User, Settings } from 'lucide-react';

export function PortalSwitcher() {
  const handleToggle = (target: 'customer' | 'management') => {
    if (target === 'customer') {
      window.location.href = 'http://localhost:3000';
    } else {
      window.location.href = 'http://localhost:3001/dashboard';
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-6">
      <div className="flex items-center gap-1 rounded-full bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-md border border-slate-800">
        <button
          onClick={() => handleToggle('customer')}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all bg-orange-500 shadow-md"
        >
          <User className="h-3.5 w-3.5" />
          <span>Customer</span>
        </button>
        <button
          onClick={() => handleToggle('management')}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-all hover:bg-slate-800"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Management</span>
        </button>
      </div>
    </div>
  );
}
