'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@merko/ui';
import { 
  useAdminProducts, 
  useAdminCategories, 
  useAdminOrders, 
  useAdminReturns, 
  useAccessRequests 
} from '@/hooks/useAdmin';
import { 
  Package, FolderTree, Landmark, ClipboardCheck, PlusCircle, 
  Activity, Flame, ShieldCheck, DollarSign, ShoppingCart, 
  Truck, RotateCcw, Users, TrendingUp, AlertTriangle 
} from 'lucide-react';

export default function AdminDashboard() {
  // Queries
  const { data: allProducts, isLoading: productsLoading } = useAdminProducts({ limit: 1 });
  const { data: allCategories, isLoading: categoriesLoading } = useAdminCategories({ limit: 1 });
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({ limit: 1000 });
  const { data: returnsData, isLoading: returnsLoading } = useAdminReturns({ limit: 1000 });
  const { data: adminRequests, isLoading: requestsLoading } = useAccessRequests();

  const isLoading = productsLoading || categoriesLoading || ordersLoading || returnsLoading || requestsLoading;

  // Compute metrics
  const totalProductsCount = allProducts?.pagination?.total || 0;
  const totalCategoriesCount = allCategories?.pagination?.total || 0;
  const orders = ordersData?.items || [];
  const returns = returnsData?.items || [];
  const requests = adminRequests || [];

  // Completed payments revenue
  const totalRevenue = orders.reduce((acc, ord) => {
    if (ord.payment?.status === 'COMPLETED') {
      return acc + Number(ord.totalAmount);
    }
    return acc;
  }, 0);

  // Order queues counts
  const pendingOrders = orders.filter(ord => 
    ['ORDER_PLACED', 'DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED', 'PACKED'].includes(ord.status)
  ).length;

  const activeShipments = orders.filter(ord => 
    ord.shipment && ord.shipment.status !== 'DELIVERED'
  ).length;

  const pendingReturns = returns.filter(ret => ret.status === 'RETURN_REQUESTED').length;
  
  // Pending refunds: returns that are received or approved but not refunded yet
  const pendingRefunds = returns.filter(ret => {
    const isMatchingStatus = ['RETURN_APPROVED', 'RETURN_RECEIVED', 'PICKED_UP'].includes(ret.status);
    if (!isMatchingStatus) return false;
    const order = orders.find(o => o.id === ret.orderId);
    return !order?.payment?.refunds?.length;
  }).length;

  const pendingAdminRequests = requests.filter(req => req.status === 'PENDING_APPROVAL').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 120, damping: 18 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 py-4 text-slate-900 dark:text-slate-100"
    >
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time platform metrics, sales summaries, and operational queue control.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-150 py-1 px-3 text-xs dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-950/60 font-mono">
            SQLite active
          </Badge>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <DollarSign className="h-4.5 w-4.5 text-indigo-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
              )}
              <p className="text-[11px] text-slate-450 mt-1.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> Fully settled via Razorpay
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Summary */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders Pipeline</span>
              <ShoppingCart className="h-4.5 w-4.5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <div className="text-2xl font-black text-slate-900 dark:text-white">{orders.length}</div>
              )}
              <p className="text-[11px] text-slate-450 mt-1.5">
                <strong className="text-amber-500 font-semibold">{pendingOrders}</strong> pending fulfillment
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipments Status */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Shipments</span>
              <Truck className="h-4.5 w-4.5 text-violet-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activeShipments}</div>
              )}
              <p className="text-[11px] text-slate-450 mt-1.5">AWB tracking logged live</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Backlogs */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Action Queue</span>
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ) : (
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {pendingReturns + pendingAdminRequests + pendingRefunds}
                </div>
              )}
              <p className="text-[11px] text-slate-450 mt-1.5 flex flex-wrap gap-2">
                <span>Returns: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{pendingReturns}</strong></span>
                <span>Admins: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{pendingAdminRequests}</strong></span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts & Analytics Block */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Revenue Overview chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <Card className="h-full border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Revenue Overview & Velocity</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Calculated daily settled order volumes</p>
              </div>
              <Badge className="bg-slate-100 text-slate-755 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">Updated hourly</Badge>
            </CardHeader>
            <CardContent className="h-64 flex flex-col justify-end relative pt-6">
              {/* Chart Grid Lines */}
              <div className="absolute inset-x-6 top-6 bottom-10 flex flex-col justify-between opacity-30 pointer-events-none">
                <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
                <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
                <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              </div>

              {/* Area chart SVG */}
              <svg className="w-full h-40 text-indigo-500/10 overflow-visible px-4" viewBox="0 0 500 200" preserveAspectRatio="none">
                <path
                  fill="currentColor"
                  d="M0,200 L50,170 L100,185 L150,130 L200,150 L250,90 L300,110 L350,50 L400,75 L450,30 L500,15 L500,200 Z"
                />
                <path
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  d="M0,200 L50,170 L100,185 L150,130 L200,150 L250,90 L300,110 L350,50 L400,75 L450,30 L500,15"
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
        </motion.div>

        {/* Quick Actions & Registries */}
        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs">
              <Button className="w-full justify-start gap-2 h-9 text-xs" asChild>
                <Link href="/products">
                  <PlusCircle className="h-4 w-4" /> Create Catalog Blank
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs border-slate-200 dark:border-slate-850" asChild>
                <Link href="/categories">
                  <FolderTree className="h-4 w-4 text-indigo-500" /> Add Taxonomy Category
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs border-slate-200 dark:border-slate-850" asChild>
                <Link href="/orders">
                  <Activity className="h-4 w-4 text-emerald-500" /> Manage Fulfillment queues
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Operational indicators */}
          <Card className="border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
                Operational Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Products Registry</span>
                <span className="font-bold">{totalProductsCount} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Taxonomy Nodes</span>
                <span className="font-bold">{totalCategoriesCount} categories</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment gateway</span>
                <Badge variant="success" className="text-[9px] font-extrabold uppercase py-0.5 px-2">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Operations Backlog Section (Admin approvals & returns) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left approvals list */}
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <Card className="border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/85">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-indigo-600" />
                Access Requests Pending ({pendingAdminRequests})
              </CardTitle>
              {pendingAdminRequests > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" asChild>
                  <Link href="/access-requests">View Queue</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <div className="h-10 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-900" />
                  <div className="h-10 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-900" />
                </div>
              ) : requests.filter(r => r.status === 'PENDING_APPROVAL').length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <ShieldCheck className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                  All admin access applications reviewed.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {requests.filter(r => r.status === 'PENDING_APPROVAL').map((req) => (
                    <div key={req.id} className="p-4 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-250 block">{req.firstName} {req.lastName}</span>
                        <span className="text-slate-400 block mt-0.5">{req.businessName || 'Independent Vendor'} · {req.email}</span>
                      </div>
                      <Button size="sm" asChild className="h-8 text-[10px] font-bold">
                        <Link href="/access-requests">Review</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Returns approvals list */}
        <motion.div variants={itemVariants} className="lg:col-span-6">
          <Card className="border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/85">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <RotateCcw className="h-4.5 w-4.5 text-red-500" />
                Return Requests Pending ({pendingReturns})
              </CardTitle>
              {pendingReturns > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" asChild>
                  <Link href="/returns">Manage Returns</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <div className="h-10 w-full animate-pulse rounded bg-slate-50 dark:bg-slate-900" />
                </div>
              ) : returns.filter(r => r.status === 'RETURN_REQUESTED').length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <ClipboardCheck className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                  No item return requests pending approval.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {returns.filter(r => r.status === 'RETURN_REQUESTED').slice(0, 3).map((ret) => {
                    const matchedOrder = orders.find(o => o.id === ret.orderId);
                    return (
                      <div key={ret.id} className="p-4 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-250 block">Order {matchedOrder?.orderNumber || 'AWB-N/A'}</span>
                          <span className="text-slate-400 block mt-0.5 truncate max-w-[240px]">&ldquo;{ret.reason}&rdquo;</span>
                        </div>
                        <Button size="sm" asChild className="h-8 text-[10px] font-bold">
                          <Link href="/returns">Resolve</Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
