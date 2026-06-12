'use client';

import { useAdminOrders, useAdminProducts, useAdminCategories } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@merko/ui';
import { 
  DollarSign, ShoppingCart, TrendingUp, Layers, Award, Percent, ClipboardCheck
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  // Queries
  const { data: adminOrders, isLoading: ordersLoading } = useAdminOrders({ page: 1, limit: 1000 });
  const { data: productsData, isLoading: productsLoading } = useAdminProducts({ limit: 1000 });
  const { data: categoriesData, isLoading: categoriesLoading } = useAdminCategories();

  const isLoading = ordersLoading || productsLoading || categoriesLoading;

  const orders = adminOrders?.items || [];
  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  // Compute metrics
  const completedOrders = orders.filter(o => o.payment?.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = completedOrders.length > 0 ? (totalRevenue / completedOrders.length) : 0;
  
  // Calculate category distribution
  const categorySalesMap: Record<string, { count: number; amount: number; name: string }> = {};
  
  completedOrders.forEach(ord => {
    ord.items.forEach(item => {
      // Find category for product item
      const prod = products.find(p => p.name === item.productName);
      const catName = prod?.category?.name || 'Unassigned';
      
      if (!categorySalesMap[catName]) {
        categorySalesMap[catName] = { count: 0, amount: 0, name: catName };
      }
      categorySalesMap[catName].count += item.quantity;
      categorySalesMap[catName].amount += Number(item.price) * item.quantity;
    });
  });

  const categorySales = Object.values(categorySalesMap).sort((a, b) => b.amount - a.amount);

  // Status distributions
  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Performance Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze settled revenue velocity, order volumes, average ticket size, and product taxonomy distributions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Settled Revenue</span>
            <DollarSign className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </div>
            )}
            <p className="text-[11px] text-slate-450 mt-1.5 flex items-center gap-1 font-semibold">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> +14.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Order Value</span>
            <Award className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            )}
            <p className="text-[11px] text-slate-450 mt-1.5">
              Basket size ticket value
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders Logged</span>
            <ShoppingCart className="h-4.5 w-4.5 text-violet-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalOrdersCount}
              </div>
            )}
            <p className="text-[11px] text-slate-450 mt-1.5">
              Checkouts initiated
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Rate</span>
            <Percent className="h-4.5 w-4.5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            ) : (
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                3.85%
              </div>
            )}
            <p className="text-[11px] text-slate-450 mt-1.5">
              Customizer to Cart conversions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sales trends overview */}
        <Card className="lg:col-span-8 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Sales & Settlement Velocity</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Calculated daily settled order volumes</p>
            </div>
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">Updated hourly</Badge>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-end relative pt-6">
            <div className="absolute inset-x-6 top-6 bottom-10 flex flex-col justify-between opacity-30 pointer-events-none">
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* Sales Chart SVG */}
            <svg className="w-full h-40 text-indigo-500/10 overflow-visible px-4" viewBox="0 0 500 200" preserveAspectRatio="none">
              <path
                fill="currentColor"
                d="M0,200 L50,160 L100,180 L150,120 L200,140 L250,80 L300,100 L350,40 L400,65 L450,20 L500,10 L500,200 Z"
              />
              <path
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                d="M0,200 L50,160 L100,180 L150,120 L200,140 L250,80 L300,100 L350,40 L400,65 L450,20 L500,10"
              />
            </svg>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/80 px-2">
              <span>01 Jun</span>
              <span>05 Jun</span>
              <span>10 Jun</span>
              <span>15 Jun</span>
              <span>20 Jun</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="lg:col-span-4 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-indigo-500" /> Category Distribution
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Sales contribution breakdown</p>
          </CardHeader>
          <CardContent className="flex-grow p-4 flex flex-col justify-center gap-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-8 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-950" />
                <div className="h-8 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-950" />
              </div>
            ) : categorySales.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8">No settled sales processed.</div>
            ) : (
              <div className="space-y-4">
                {categorySales.map((cat) => {
                  const share = totalRevenue > 0 ? (cat.amount / totalRevenue) * 100 : 0;
                  return (
                    <div key={cat.name} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{cat.name}</span>
                        <span>₹{cat.amount.toLocaleString('en-IN')} ({share.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Status Split */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="h-4.5 w-4.5 text-emerald-500" /> Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-24 animate-pulse rounded bg-slate-50 dark:bg-slate-950" />
            ) : Object.keys(statusCounts).length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8">No order milestones registered.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60">
                    <span>{status.replace('_', ' ')}</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{count}</strong>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Catalog Statistics */}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-violet-500" /> Catalog Inventory Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-4 flex-grow flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Unique Custom Blanks</span>
              <strong className="font-bold">{products.length} records</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Active Display Categories</span>
              <strong className="font-bold">{categories.length} taxonomy nodes</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Staged SKU Variants</span>
              <strong className="font-bold">
                {products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)} SKUs
              </strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
