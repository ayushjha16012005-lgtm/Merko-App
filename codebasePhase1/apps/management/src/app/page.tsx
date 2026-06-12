import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@merko/ui';
import { 
  LayoutDashboard, Package, FolderTree, ClipboardList, Settings, ShieldCheck, 
  CreditCard, Truck, RotateCcw, DollarSign, BarChart3 
} from 'lucide-react';

const sections = [
  {
    title: 'Operational Dashboard',
    desc: 'View real-time sales reports, order rollups, and performance metrics.',
    icon: LayoutDashboard,
    color: 'text-indigo-500',
    href: '/dashboard',
  },
  {
    title: 'Product Catalog',
    desc: 'Configure customizable product templates, blank attributes, and metadata.',
    icon: Package,
    color: 'text-amber-500',
    href: '/products',
  },
  {
    title: 'Taxonomy Categories',
    desc: 'Define store categories, parent hierarchies, and catalog collection filters.',
    icon: FolderTree,
    color: 'text-violet-500',
    href: '/categories',
  },
  {
    title: 'Fulfillment Orders',
    desc: 'Track print-ready artwork designs, advance pipeline milestones, and print tags.',
    icon: ClipboardList,
    color: 'text-emerald-500',
    href: '/orders',
  },
  {
    title: 'Payments Ledger',
    desc: 'Monitor Razorpay settled transactions, audit payment states, and issue returns credit.',
    icon: CreditCard,
    color: 'text-emerald-500',
    href: '/payments',
  },
  {
    title: 'Logistics Shipments',
    desc: 'Coordinate warehouse dispatches, assign courier tracking AWB numbers, and update events.',
    icon: Truck,
    color: 'text-indigo-500',
    href: '/shipments',
  },
  {
    title: 'Returns Approvals',
    desc: 'Audit buyer return requests, schedule courier pickups, and verify restock conditions.',
    icon: RotateCcw,
    color: 'text-red-500',
    href: '/returns',
  },
  {
    title: 'Refunds Tracking',
    desc: 'Audit gateway refund logs, refund payout history, and balance credit adjustments.',
    icon: DollarSign,
    color: 'text-red-500',
    href: '/refunds',
  },
  {
    title: 'Performance Insights',
    desc: 'View sales velocity graphs, average ticket size, and product category distribution charts.',
    icon: BarChart3,
    color: 'text-indigo-500',
    href: '/analytics',
  },
  {
    title: 'Store Settings',
    desc: 'Update Razorpay integration keys, customizer constraints, upload thresholds, and pincodes.',
    icon: Settings,
    color: 'text-slate-500',
    href: '/settings',
  },
];

export default function PortalHomePage() {
  return (
    <div className="max-w-6xl space-y-8 py-4 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to the Merko Management Console. Choose an operational block below to configure store catalogs or fulfill orders.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-150 py-1 px-3 text-xs dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-950/60 font-mono">
            Environment: SQLite Live
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="flex flex-col justify-between hover:shadow-md transition-shadow duration-155 border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/60 ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col justify-between h-full text-xs">
                <p className="leading-relaxed text-slate-450 dark:text-slate-400 font-semibold mb-6">
                  {item.desc}
                </p>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-755 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors w-fit"
                >
                  Manage Section <span className="text-sm font-normal">&rarr;</span>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
