'use client';

import { useState } from 'react';
import { useAdminReturns, useUpdateReturnStatus, useCreateRefund, useAdminOrders } from '@/hooks/useAdmin';
import { 
  Badge, Button, Card, CardContent, CardHeader,
  Dialog, DialogHeader, DialogTitle, DialogFooter, Input, Select, useToast 
} from '@merko/ui';
import { 
  Search, RotateCcw, AlertTriangle, DollarSign, ClipboardCheck, CheckCircle2
} from 'lucide-react';
import type { ReturnRequestResponseDto, OrderResponseDto } from '@merko/types';

export default function AdminReturnsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Queries
  const { data: returnsData, isLoading } = useAdminReturns({
    page: 1,
    limit: 1000 // Get high limits to show returns
  });

  const { data: adminOrders } = useAdminOrders({
    page: 1,
    limit: 1000
  });

  const updateReturnStatus = useUpdateReturnStatus();
  const createRefund = useCreateRefund();

  // Refund modal states
  const [selectedReturn, setSelectedReturn] = useState<(ReturnRequestResponseDto & { order?: OrderResponseDto }) | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const returns = returnsData?.items || [];
  const orders = adminOrders?.items || [];

  // Filter returns
  const filteredReturns = returns.map(ret => {
    const order = orders.find(o => o.id === ret.orderId);
    return {
      ...ret,
      order
    };
  }).filter(ret => {
    // Search filter
    const matchesSearch = 
      ret.reason.toLowerCase().includes(search.toLowerCase()) ||
      (ret.order?.orderNumber && ret.order.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      (ret.order?.shippingName && ret.order.shippingName.toLowerCase().includes(search.toLowerCase()));

    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      ret.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalRequests = returns.length;
  const pendingRequests = returns.filter(r => r.status === 'RETURN_REQUESTED').length;
  const totalApproved = returns.filter(r => r.status !== 'RETURN_REQUESTED' && r.status !== 'RETURN_REJECTED').length;

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateReturnStatus.mutateAsync({ id, status });
      toast(`Return status updated to ${status.replace('_', ' ')}`, 'success');
    } catch {
      toast('Failed to update return status.', 'error');
    }
  };

  const handleCreateRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn?.order?.payment || !refundAmount) return;

    try {
      await createRefund.mutateAsync({
        paymentId: selectedReturn.order.payment.id,
        returnRequestId: selectedReturn.id,
        amount: parseFloat(refundAmount),
        reason: refundReason || undefined,
      });
      toast('Refund processed successfully!', 'success');
      setIsRefundOpen(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedReturn(null);
    } catch {
      toast('Failed to issue refund.', 'error');
    }
  };

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Returns Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review buyer return claims, coordinate logistic reverse shipments, and process refund cancellations.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Return Requests</span>
            <RotateCcw className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalRequests}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Accumulated claims logged
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {pendingRequests}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5 font-bold text-amber-600 dark:text-amber-400">
              Awaiting admin check
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved / Processed</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalApproved}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Claims active or refunded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap flex-1 gap-3 max-w-2xl">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ref, reason..." 
                className="pl-9 h-9 text-xs bg-transparent"
              />
            </div>
            <div className="w-48">
              <Select 
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'RETURN_REQUESTED', label: 'Requested' },
                  { value: 'RETURN_APPROVED', label: 'Approved' },
                  { value: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled' },
                  { value: 'PICKED_UP', label: 'Picked Up' },
                  { value: 'RETURN_RECEIVED', label: 'Received' },
                  { value: 'RETURN_REJECTED', label: 'Rejected' },
                ]}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400">
            Total {filteredReturns.length} records
          </div>
        </CardContent>
      </Card>

      {/* Table grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      ) : filteredReturns.length === 0 ? (
        <Card className="text-center py-16 border-slate-200 dark:border-slate-800">
          <CardContent>
            <ClipboardCheck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No return requests found</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">No customer returns match the current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/85 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Return ID</th>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Claim Date</th>
                    <th className="p-4">Reason Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReturns.map((ret) => {
                    const isRefundable = ret.status === 'RETURN_RECEIVED' && (!ret.order?.payment?.refunds || ret.order.payment.refunds.length === 0);
                    return (
                      <tr key={ret.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                          {ret.id.split('-').pop()}
                        </td>
                        <td className="p-4 font-mono">
                          {ret.order?.orderNumber || 'AWB-N/A'}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold block">{ret.order?.shippingName || 'N/A'}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{ret.order?.user?.email || ''}</span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4 italic font-semibold text-slate-650 dark:text-slate-350">
                          &ldquo;{ret.reason}&rdquo;
                        </td>
                        <td className="p-4">
                          <Badge className={
                            ret.status === 'RETURN_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            ret.status === 'RETURN_REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }>
                            {ret.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {ret.status === 'RETURN_REQUESTED' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateStatus(ret.id, 'RETURN_APPROVED')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold h-7 text-[10px]"
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(ret.id, 'RETURN_REJECTED')}
                                className="border-red-200 text-red-650 hover:bg-red-50/10 font-bold h-7 text-[10px]"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {ret.status === 'RETURN_APPROVED' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(ret.id, 'PICKUP_SCHEDULED')}
                              className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-7 text-[10px]"
                            >
                              Schedule Pickup
                            </Button>
                          )}
                          {ret.status === 'PICKUP_SCHEDULED' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(ret.id, 'PICKED_UP')}
                              className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-7 text-[10px]"
                            >
                              Mark Picked Up
                            </Button>
                          )}
                          {ret.status === 'PICKED_UP' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateStatus(ret.id, 'RETURN_RECEIVED')}
                              className="bg-green-605 hover:bg-green-700 text-white font-bold h-7 text-[10px]"
                            >
                              Receive Parcel
                            </Button>
                          )}
                          {isRefundable && (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedReturn(ret);
                                setRefundAmount(String(ret.order?.totalAmount || ''));
                                setIsRefundOpen(true);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-7 text-[10px]"
                            >
                              <DollarSign className="h-3.5 w-3.5 mr-0.5" /> Issue Refund
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
          <DialogTitle>Issue Return Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateRefundSubmit}>
          {selectedReturn?.order?.payment && (
            <div className="space-y-4 py-4 text-xs">
              <div className="text-xs text-slate-550 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg flex flex-col gap-1 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <strong className="text-slate-900 dark:text-white">₹{Number(selectedReturn.order.payment.amount).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Reason for return:</span>
                  <span className="italic font-semibold">&ldquo;{selectedReturn.reason}&rdquo;</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Refund Amount (₹) *</label>
                <Input 
                  type="number"
                  min="1"
                  max={selectedReturn.order.payment.amount}
                  step="0.01"
                  value={refundAmount} 
                  onChange={(e) => setRefundAmount(e.target.value)} 
                  placeholder={`Max ₹${selectedReturn.order.payment.amount}`} 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason for Refund</label>
                <textarea 
                  value={refundReason} 
                  onChange={(e) => setRefundReason(e.target.value)} 
                  placeholder="Processed return validation check, item restocked." 
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
