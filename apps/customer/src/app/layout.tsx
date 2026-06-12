import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Merko | Custom Product Marketplace',
  description: 'Customize and order professional printed goods in under 5 minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                  MERKO
                </Link>
                <nav className="hidden md:flex space-x-6">
                  <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Browse Products
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm">
              &copy; 2026 Merko Inc. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
