import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import { ToastProvider } from '@merko/ui';
import { AdminLayoutShell } from '@/components/admin-layout-shell';

export const metadata: Metadata = {
  title: 'Merko Admin | Portal',
  description: 'Management portal for product config and order pipeline management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-screen bg-slate-50/50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        <ToastProvider>
          <AppProviders>
            <AdminLayoutShell>
              {children}
            </AdminLayoutShell>
          </AppProviders>
        </ToastProvider>
      </body>
    </html>
  );
}
