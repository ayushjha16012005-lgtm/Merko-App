'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Input, Badge } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Search, Package, Calendar, ArrowRight } from 'lucide-react';
import type { OrderResponseDto } from '@merko/types';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, isLoadingOrders } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoadingOrders) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-950/20">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Retrieving your order logs...</p>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order: OrderResponseDto) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const mapping: Record<string, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
      ORDER_PLACED: { variant: 'outline', label: 'Placed' },
      PAYMENT_PENDING: { variant: 'outline', label: 'Payment Pending' },
      PAYMENT_SUCCESS: { variant: 'secondary', label: 'Paid' },
      DESIGN_APPROVED: { variant: 'secondary', label: 'Design Approved' },
      PRINTING_STARTED: { variant: 'secondary', label: 'Printing' },
      PRINTING_COMPLETED: { variant: 'secondary', label: 'Ready for Packing' },
      PACKED: { variant: 'secondary', label: 'Packed' },
      DISPATCHED: { variant: 'default', label: 'Dispatched' },
      DELIVERED: { variant: 'default', label: 'Delivered' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' },
    };

    const details = mapping[status] || { variant: 'outline', label: status };
    return <Badge variant={details.variant}>{details.label}</Badge>;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[80vh]">
      <div className="mb-8 flex items-center space-x-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium dark:text-white">Orders</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Order History
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track customization progress and print pipeline status.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-slate-950/50"
            placeholder="Search by Order # or Product Name..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'ORDER_PLACED', 'PRINTING_STARTED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all border ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-16 text-center border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70">
          <div className="h-16 w-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Package className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">No Orders Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            We couldn&apos;t find any orders matching your parameters.
          </p>
          <Button asChild>
            <Link href="/products">Shop Merchandise</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: OrderResponseDto) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden border-slate-200/80 bg-white/70 shadow-sm backdrop-blur-md hover:shadow-md transition-shadow dark:border-slate-800/60 dark:bg-slate-900/70">
                {/* Header Section */}
                <div className="bg-slate-50/50 border-b border-slate-100/60 dark:bg-slate-950/20 dark:border-slate-800/60 p-5 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Order Number</span>
                      <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Date Placed</span>
                      <span className="text-sm font-semibold text-slate-650 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Total Amount</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <Button size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        Track Progress
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Items Preview */}
                <CardContent className="p-5 divide-y divide-slate-100 dark:divide-slate-800/40">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.productName}</h4>
                        <p className="text-xs text-slate-450 mt-0.5">
                          Variant: {item.variantName} · SKU: {item.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 block mb-0.5">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
