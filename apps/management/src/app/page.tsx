import Link from 'next/link';

export default function PortalHomePage() {
  return (
    <div className="space-y-8 max-w-4xl py-4">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500 text-sm">Welcome to the Merko Management Portal. Configure catalogs and coordinate order fulfillment pipeline.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        {[
          {
            title: 'Operational Dashboard',
            desc: 'View real-time sales reports, order rollups, conversion funnels, and performance metrics.',
            icon: '📈',
            href: '/dashboard',
          },
          {
            title: 'Product Catalog Management',
            desc: 'Define custom fields schemas, update variant inventory levels, and configure pricing rules.',
            icon: '📦',
            href: '/products',
          },
          {
            title: 'Order Fulfillment Pipeline',
            desc: 'Download print-ready assets, update status workflows, and input shipping tracking details.',
            icon: '📋',
            href: '/orders',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div className="space-y-4">
              <span className="text-3xl block">{item.icon}</span>
              <h2 className="font-bold text-slate-900 text-lg">{item.title}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
            <div className="pt-6">
              <Link
                href={item.href}
                className="inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Go to section &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
