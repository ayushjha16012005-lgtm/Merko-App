'use client';

import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdmin';
import { Badge, Card, CardContent, CardHeader, Input } from '@merko/ui';
import { Search, RotateCcw, DollarSign, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function AdminRefundsPage() {
  const [search, setSearch] = useState('');

  // Queries
  const { data: adminOrders, isLoading } = useAdminOrders({
    page: 1,
    limit: 1000 // Fetch high limits to scan settled refunds
  });

  const { user } = useAuthStore();
  
  if (user?.role === 'ADMIN' && !user?.permissions?.includes('payments')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">You do not have permission to view refunds.</p>
      </div>
    );
  }

  const orders = adminOrders?.items || [];

  // Extract refunds from orders payments
  const refundsList: {
    id: string;
    createdAt: string;
    amount: number;
    reason: string | null;
    gatewayRefundId: string | null;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    originalTxId: string | null;
  }[] = [];

  orders.forEach(ord => {
    if (ord.payment?.refunds) {
      ord.payment.refunds.forEach(ref => {
        refundsList.push({
          id: ref.id,
          createdAt: ref.createdAt,
          amount: Number(ref.amount),
          reason: ref.reason || null,
          gatewayRefundId: ref.gatewayRefundId || null,
          orderNumber: ord.orderNumber,
          customerName: ord.shippingName,
          customerEmail: ord.user?.email || 'Guest',
          originalTxId: ord.payment!.gatewayPaymentId || null
        });
      });
    }
  });

  // Filter refunds
  const filteredRefunds = refundsList.filter(ref => {
    return (
      ref.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ref.customerName.toLowerCase().includes(search.toLowerCase()) ||
      ref.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      (ref.gatewayRefundId && ref.gatewayRefundId.toLowerCase().includes(search.toLowerCase())) ||
      (ref.reason && ref.reason.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // Metrics
  const totalRefundPayouts = refundsList.reduce((sum, r) => sum + r.amount, 0);
  const totalRefundCount = refundsList.length;

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Refunds Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track customer debit reversals, gateway refund IDs, and claims reason audits.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Refund Payouts</span>
            <DollarSign className="h-4.5 w-4.5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{totalRefundPayouts.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Settled reverse balance
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Processed Returns Refunded</span>
            <RotateCcw className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalRefundCount}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Reversed invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap flex-1 gap-3 max-w-md">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search refund ID, order ref, customer..." 
                className="pl-9 h-9 text-xs bg-transparent"
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400">
            Total {filteredRefunds.length} processed refunds
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      ) : filteredRefunds.length === 0 ? (
        <Card className="text-center py-16 border-slate-200 dark:border-slate-800">
          <CardContent>
            <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No refunds registered</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">There are no refund logs processed in payment ledger.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/85 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Refund ID</th>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Refund Date</th>
                    <th className="p-4">Original Transaction</th>
                    <th className="p-4">Reason Details</th>
                    <th className="p-4 text-right">Refund Amount</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRefunds.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white truncate max-w-[150px]" title={ref.gatewayRefundId || ref.id}>
                        {ref.gatewayRefundId || ref.id}
                      </td>
                      <td className="p-4 font-mono">
                        {ref.orderNumber}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold block">{ref.customerName}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{ref.customerEmail}</span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {new Date(ref.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4 font-mono text-slate-450">
                        {ref.originalTxId || '—'}
                      </td>
                      <td className="p-4 italic font-semibold text-slate-650 dark:text-slate-350">
                        {ref.reason || 'Restocked return'}
                      </td>
                      <td className="p-4 text-right font-bold text-red-650">
                        -₹{ref.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant="success" className="text-[9px] font-extrabold uppercase py-0.5 px-2">
                          Settled
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
