import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Merko Admin | Portal',
  description: 'Management portal for product config and order pipeline management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex bg-slate-100 text-slate-900">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800">
          <div className="flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
              <span className="text-xl font-bold text-white tracking-wider">MERKO ADMIN</span>
            </div>
            <nav className="p-4 flex flex-col gap-1">
              <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all">
                <span>🏠</span>
                <span>Portal Home</span>
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all">
                <span>📈</span>
                <span>Dashboard</span>
              </Link>
              <Link href="/products" className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all">
                <span>📦</span>
                <span>Manage Products</span>
              </Link>
              <Link href="/orders" className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all">
                <span>📋</span>
                <span>Order Pipeline</span>
              </Link>
            </nav>
          </div>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">AD</div>
              <div className="text-xs">
                <p className="font-semibold text-white leading-tight">Admin User</p>
                <p className="text-slate-500">SuperAdmin</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-grow flex flex-col">
          {/* Top Navbar */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8">
            <div className="flex items-center space-x-4">
              <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
                SYSTEM OPERATIONAL
              </span>
            </div>
          </header>

          <main className="flex-grow p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
