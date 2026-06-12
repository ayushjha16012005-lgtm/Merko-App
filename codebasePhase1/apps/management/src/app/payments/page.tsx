'use client';

import { useState } from 'react';
import { useAdminOrders, useCreateRefund } from '@/hooks/useAdmin';
import { 
  Badge, Button, Card, CardContent, CardHeader,
  Dialog, DialogHeader, DialogTitle, DialogFooter, Input, Select, useToast 
} from '@merko/ui';
import { 
  Search, TrendingUp, AlertCircle, ShoppingBag, RotateCcw
} from 'lucide-react';
import type { OrderResponseDto } from '@merko/types';

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Queries
  const { data: adminOrders, isLoading } = useAdminOrders({
    page: 1,
    limit: 1000 // Get high limits to show operational payments ledger
  });

  const createRefund = useCreateRefund();

  // Refund dialog states
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const orders = adminOrders?.items || [];

  // Filter payments
  const filteredPayments = orders.filter(ord => {
    if (!ord.payment) return false;
    
    // Search filter
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (ord.payment.gatewayPaymentId && ord.payment.gatewayPaymentId.toLowerCase().includes(search.toLowerCase())) ||
      ord.shippingName.toLowerCase().includes(search.toLowerCase()) ||
      (ord.user?.email && ord.user.email.toLowerCase().includes(search.toLowerCase()));
      
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      ord.payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalReceived = orders.reduce((acc, ord) => {
    if (ord.payment?.status === 'COMPLETED') {
      return acc + Number(ord.payment.amount);
    }
    return acc;
  }, 0);

  const totalRefunded = orders.reduce((acc, ord) => {
    if (ord.payment?.refunds) {
      const refAmt = ord.payment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
      return acc + refAmt;
    }
    return acc;
  }, 0);

  const pendingPayments = orders.filter(ord => ord.payment?.status === 'PENDING').length;

  const handleCreateRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder?.payment || !refundAmount) return;

    try {
      await createRefund.mutateAsync({
        paymentId: selectedOrder.payment.id,
        amount: parseFloat(refundAmount),
        reason: refundReason || undefined,
      });
      toast('Refund payload processed successfully!', 'success');
      setIsRefundOpen(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedOrder(null);
    } catch {
      toast('Failed to process refund.', 'error');
    }
  };

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Payments Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track gateway transactions, settled balances, credit notes, and customer refunds.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Settled</span>
            <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{totalReceived.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5 flex items-center gap-1">
              Fully settled via Razorpay
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Refunded</span>
            <RotateCcw className="h-4.5 w-4.5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{totalRefunded.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Reversed transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Authorizations</span>
            <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {pendingPayments}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Unpaid checkouts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Filters Block */}
      <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap flex-1 gap-3 max-w-2xl">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transaction ID or name..." 
                className="pl-9 h-9 text-xs bg-transparent"
              />
            </div>
            <div className="w-44">
              <Select 
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'FAILED', label: 'Failed' },
                ]}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400">
            Total {filteredPayments.length} payment records
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="text-center py-16 border-slate-200 dark:border-slate-800">
          <CardContent>
            <ShoppingBag className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No transaction records found</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">There are no payment history logs matching these filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/85 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Refunds</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.map((ord) => {
                    const pay = ord.payment!;
                    const hasRefund = pay.refunds && pay.refunds.length > 0;
                    const refundAmt = (hasRefund && pay.refunds) ? pay.refunds.reduce((sum, r) => sum + Number(r.amount), 0) : 0;

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {pay.gatewayPaymentId || 'PENDING'}
                        </td>
                        <td className="p-4 font-mono">
                          {ord.orderNumber}
                        </td>
                        <td className="p-4">
                          <span className="font-bold block">{ord.shippingName}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{ord.user?.email || 'Guest'}</span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(pay.createdAt || ord.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4">
                          <Badge className={
                            pay.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                            pay.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }>
                            {pay.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-medium text-red-650">
                          {hasRefund ? `₹${refundAmt.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-905 dark:text-white">
                          ₹{Number(pay.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right">
                          {pay.status === 'COMPLETED' && !hasRefund && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsRefundOpen(true);
                              }}
                              className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50/10 font-bold"
                            >
                              Refund
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Refund Modal Dialog */}
      <Dialog isOpen={isRefundOpen} onClose={() => setIsRefundOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Issue Payment Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateRefundSubmit}>
          {selectedOrder?.payment && (
            <div className="space-y-4 py-4 text-xs">
              <div className="text-xs text-slate-550 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg flex flex-col gap-1 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <strong className="text-slate-900 dark:text-white">₹{Number(selectedOrder.payment.amount).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{selectedOrder.payment.gatewayPaymentId}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Refund Amount (₹) *</label>
                <Input 
                  type="number"
                  min="1"
                  max={selectedOrder.payment.amount}
                  step="0.01"
                  value={refundAmount} 
                  onChange={(e) => setRefundAmount(e.target.value)} 
                  placeholder={`Max ₹${selectedOrder.payment.amount}`} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason for Refund</label>
                <textarea 
                  value={refundReason} 
                  onChange={(e) => setRefundReason(e.target.value)} 
                  placeholder="Customer request, quality check failure, return, etc." 
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsRefundOpen(false)} className="text-xs">Cancel</Button>
            <Button type="submit" disabled={createRefund.isPending} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9">
              {createRefund.isPending ? 'Processing...' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
