'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAdminOrders, 
  useUpdateOrderStatus, 
  useCreateShipment, 
  useAddShipmentEvent,
  useUpdateReturnStatus,
  useCreateRefund
} from '@/hooks/useAdmin';
import { 
  Badge, Button, Card, CardContent, CardHeader, 
  Dialog, DialogHeader, DialogTitle, DialogFooter, Input, useToast 
} from '@merko/ui';
import { 
  Search, Filter, Truck, ArrowRight, RotateCcw, 
  DollarSign, AlertCircle, ShoppingBag, Eye, PlusCircle,
  Palette, ExternalLink, Calendar, X, ClipboardList, MapPin, CheckCircle2, Clock
} from 'lucide-react';
import type { OrderResponseDto } from '@merko/types';

const MILESTONES = [
  { status: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received, pending design approval' },
  { status: 'DESIGN_APPROVED', label: 'Design Approved', desc: 'Custom artwork approved' },
  { status: 'PRINTING_STARTED', label: 'Printing Started', desc: 'Custom printing initiated' },
  { status: 'PRINTING_COMPLETED', label: 'Printing Completed', desc: 'Printing completed successfully' },
  { status: 'PACKED', label: 'Packed & Secured', desc: 'AWB shipping label ready' },
  { status: 'DISPATCHED', label: 'Dispatched', desc: 'Parcel handed to courier' },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Delivered to recipient address' },
];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeQueue, setActiveQueue] = useState<'ALL' | 'PENDING' | 'DISPATCHED' | 'RETURNS'>('ALL');
  const page = 1;

  // Queries
  const { data: adminOrders, isLoading } = useAdminOrders({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 50
  });

  // Mutations
  const updateOrderStatus = useUpdateOrderStatus();
  const createShipment = useCreateShipment();
  const addShipmentEvent = useAddShipmentEvent();
  const updateReturnStatus = useUpdateReturnStatus();
  const createRefund = useCreateRefund();

  // Details drawer target order state
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  
  // Dispatch shipment form fields
  const [isShipmentOpen, setIsShipmentOpen] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Add shipment event form fields
  const [isShipmentEventOpen, setIsShipmentEventOpen] = useState(false);
  const [shipmentEventStatus, setShipmentEventStatus] = useState('PROCESSING');
  const [shipmentEventDesc, setShipmentEventDesc] = useState('');
  const [shipmentEventLoc, setShipmentEventLoc] = useState('');

  // Refund form fields
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const handleAdvanceStatus = async (order: OrderResponseDto) => {
    const nextStatusMap: Record<string, string> = {
      ORDER_PLACED: 'DESIGN_APPROVED',
      DESIGN_APPROVED: 'PRINTING_STARTED',
      PRINTING_STARTED: 'PRINTING_COMPLETED',
      PRINTING_COMPLETED: 'PACKED',
      PACKED: 'DISPATCHED',
    };

    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) return;

    try {
      await updateOrderStatus.mutateAsync({
        id: order.id,
        status: nextStatus,
      });
      toast(`Order status advanced to ${nextStatus.replace('_', ' ')}`, 'success');
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch {
      toast('Failed to update order status.', 'error');
    }
  };

  const handleCreateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !courierName || !trackingNumber) return;

    try {
      await createShipment.mutateAsync({
        orderId: selectedOrder.id,
        courierName,
        trackingNumber,
        trackingUrl: trackingUrl || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
      });
      toast('Shipment dispatched and tracking generated!', 'success');
      setIsShipmentOpen(false);
      setCourierName('');
      setTrackingNumber('');
      setTrackingUrl('');
      setEstimatedDelivery('');
      setSelectedOrder(null);
    } catch {
      toast('Failed to create shipment.', 'error');
    }
  };

  const handleAddShipmentEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder?.shipment || !shipmentEventDesc) return;

    try {
      await addShipmentEvent.mutateAsync({
        shipmentId: selectedOrder.shipment.id,
        status: shipmentEventStatus,
        description: shipmentEventDesc,
        location: shipmentEventLoc || undefined,
      });
      toast('Tracking event logged successfully!', 'success');
      setIsShipmentEventOpen(false);
      setShipmentEventDesc('');
      setShipmentEventLoc('');
      setSelectedOrder(null);
    } catch {
      toast('Failed to add tracking event.', 'error');
    }
  };

  const handleUpdateReturnStatus = async (returnId: string, status: string) => {
    try {
      await updateReturnStatus.mutateAsync({ id: returnId, status });
      toast(`Return request marked as ${status.replace('_', ' ')}`, 'success');
      setSelectedOrder(null);
    } catch {
      toast('Failed to update return status.', 'error');
    }
  };

  const handleCreateRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder?.payment || !refundAmount) return;

    const returnRequest = selectedOrder.returnRequests?.[0];

    try {
      await createRefund.mutateAsync({
        paymentId: selectedOrder.payment.id,
        returnRequestId: returnRequest?.id,
        amount: parseFloat(refundAmount),
        reason: refundReason || undefined,
      });
      toast('Refund payload processed and order cancelled.', 'success');
      setIsRefundOpen(false);
      setRefundAmount('');
      setRefundReason('');
      setSelectedOrder(null);
    } catch {
      toast('Failed to issue refund.', 'error');
    }
  };

  const rawItems = adminOrders?.items || [];
  
  // Apply visual queue grouping filters
  const filteredOrders = rawItems.filter(ord => {
    if (activeQueue === 'PENDING') {
      return ['ORDER_PLACED', 'DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED', 'PACKED'].includes(ord.status);
    }
    if (activeQueue === 'DISPATCHED') {
      return ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(ord.status);
    }
    if (activeQueue === 'RETURNS') {
      return ord.returnRequests && ord.returnRequests.length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage custom printing parameters, package logistics, shipments tracking, and warehouse returns.
          </p>
        </div>
      </div>

      {/* Queue Filters Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {[
          { key: 'ALL', label: 'All Orders', count: rawItems.length },
          { 
            key: 'PENDING', 
            label: 'Pending Fulfillment', 
            count: rawItems.filter(o => ['ORDER_PLACED', 'DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED', 'PACKED'].includes(o.status)).length 
          },
          { 
            key: 'DISPATCHED', 
            label: 'Logistics / Shipped', 
            count: rawItems.filter(o => ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status)).length 
          },
          { 
            key: 'RETURNS', 
            label: 'Returns Pipeline', 
            count: rawItems.filter(o => o.returnRequests && o.returnRequests.length > 0).length 
          },
        ].map((queue) => (
          <button
            key={queue.key}
            onClick={() => setActiveQueue(queue.key as 'ALL' | 'PENDING' | 'DISPATCHED' | 'RETURNS')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
              activeQueue === queue.key
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-550 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <span>{queue.label}</span>
            <span className={`rounded-full px-1.5 py-0.25 text-[10px] font-bold ${
              activeQueue === queue.key ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-405'
            }`}>
              {queue.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap flex-1 gap-3 max-w-2xl">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..." 
                className="pl-9 h-9 text-xs bg-transparent"
              />
            </div>
            <div className="w-44">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-2 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-9"
              >
                <option value="">All Statuses</option>
                <option value="ORDER_PLACED">Order Placed</option>
                <option value="DESIGN_APPROVED">Design Approved</option>
                <option value="PRINTING_STARTED">Printing Started</option>
                <option value="PRINTING_COMPLETED">Printing Completed</option>
                <option value="PACKED">Packed</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Order Pipeline spreadsheet */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-16 border-slate-200 dark:border-slate-800">
          <CardContent>
            <ShoppingBag className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1">There are no orders matching this queue or filter.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/85 dark:border-slate-800 text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Fulfillment State</th>
                    <th className="p-4">Billing Status</th>
                    <th className="p-4 text-right">Settled Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => {
                    const hasReturn = order.returnRequests && order.returnRequests.length > 0;
                    const isPaid = order.payment?.status === 'COMPLETED';

                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {order.orderNumber}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-850 dark:text-slate-200 block text-xs">
                            {order.shippingName}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {order.user?.email || 'Guest checkout'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                              order.status === 'CANCELLED' ? 'bg-slate-50 text-slate-655 border-slate-205' :
                              'bg-indigo-50 text-indigo-700 border-indigo-150'
                            }>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            {hasReturn && (
                              <Badge className="bg-red-50 text-red-700 border-red-200 animate-pulse">
                                Return
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold uppercase text-[9px] tracking-wider ${isPaid ? 'text-green-600' : 'text-amber-500'}`}>
                            {order.payment?.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-905 dark:text-white">
                          ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5 justify-end">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setSelectedOrder(order)}
                              className="h-7 px-2"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {['ORDER_PLACED', 'DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED'].includes(order.status) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAdvanceStatus(order)}
                                className="h-7 text-[10px] font-bold py-0.5 px-2"
                              >
                                Advance <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                            {order.status === 'PACKED' && !order.shipment && (
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsShipmentOpen(true);
                                }}
                                className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-0.5 px-2"
                              >
                                Dispatch
                              </Button>
                            )}
                          </div>
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

      {/* SLIDE-OVER ORDER DETAILS SIDE-DRAWER */}
      <AnimatePresence>
        {selectedOrder && !isShipmentOpen && !isShipmentEventOpen && !isRefundOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-screen w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-205 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-slate-400">Order Ref</span>
                    <strong className="text-base text-slate-900 dark:text-white font-mono">{selectedOrder.orderNumber}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">ID: {selectedOrder.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 text-xs">
                {/* Delivery Information */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Destination Address
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 leading-relaxed text-slate-650 dark:text-slate-350">
                    <p className="font-bold text-slate-905 dark:text-white">{selectedOrder.shippingName}</p>
                    <p>{selectedOrder.shippingAddressLine1}</p>
                    {selectedOrder.shippingAddressLine2 && <p>{selectedOrder.shippingAddressLine2}</p>}
                    <p>{selectedOrder.shippingCity}, {selectedOrder.shippingState} - {selectedOrder.shippingPostalCode}</p>
                    <p>{selectedOrder.shippingCountry}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Phone: {selectedOrder.shippingPhone}</p>
                  </div>
                </div>

                {/* Fulfillment status timeline */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Fulfillment Milestones
                  </h4>
                  <div className="border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950/10 p-4 rounded-xl space-y-4">
                    {/* Linear timeline */}
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-2 py-1 space-y-4">
                      {MILESTONES.map((step) => {
                        const isDone = selectedOrder.timeline?.some(t => t.status === step.status);
                        const isCurrent = selectedOrder.status === step.status;

                        return (
                          <div key={step.status} className="relative pl-6">
                            <span className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border ring-4 ring-white dark:ring-slate-900 transition-all ${
                              isDone ? 'bg-indigo-600 border-indigo-600' : isCurrent ? 'bg-amber-500 border-amber-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 border-transparent'
                            }`} />
                            <div className={isDone || isCurrent ? 'opacity-100' : 'opacity-40'}>
                              <span className="font-bold text-slate-900 dark:text-white block text-xs">{step.label}</span>
                              <span className="text-[10px] text-slate-405 block mt-0.5">{step.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Items Summary list */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> Purchased Items
                  </h4>
                  <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-950/10">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex justify-between items-center bg-slate-50/20">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-xs block">{item.productName}</span>
                          <span className="text-[10px] text-slate-450 block mt-0.5">Variant: {item.variantName} · SKU: {item.sku}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0 ml-4">
                          {item.quantity} x ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design Artworks assets */}
                {selectedOrder.designFiles && selectedOrder.designFiles.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-indigo-500" /> Staged Artwork designs
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedOrder.designFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/20 text-xs shadow-xs">
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-slate-900 dark:text-white truncate block">{file.fileName}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5 capitalize">{file.fileType.split('/').pop()}</span>
                          </div>
                          <Button size="sm" variant="ghost" asChild className="h-7 px-2 font-semibold">
                            <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                              View <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payments & Refunds */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" /> Billing & Refunds
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 space-y-2 leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Grand Total</span>
                      <strong className="text-slate-900 dark:text-white">₹{Number(selectedOrder.totalAmount).toLocaleString('en-IN')}</strong>
                    </div>
                    {selectedOrder.payment && (
                      <div className="pt-2 border-t border-slate-200/40 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payment Status</span>
                          <span className="font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wide">{selectedOrder.payment.status}</span>
                        </div>
                        {selectedOrder.payment.gatewayPaymentId && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Transaction ID</span>
                            <span className="font-mono">{selectedOrder.payment.gatewayPaymentId}</span>
                          </div>
                        )}
                        {/* Refund list */}
                        {selectedOrder.payment.refunds && selectedOrder.payment.refunds.length > 0 && (
                          <div className="mt-3 bg-red-50/20 border border-red-150 p-2.5 rounded-lg text-[11px] text-red-700 dark:bg-red-950/10 dark:text-red-400 dark:border-red-950/30">
                            <span className="font-bold block">Refund Settled</span>
                            <span className="block mt-0.5">Amount: ₹{Number(selectedOrder.payment.refunds[0].amount).toLocaleString('en-IN')}</span>
                            <span className="block">Reason: {selectedOrder.payment.refunds[0].reason || 'Product returned'}</span>
                            <span className="block font-mono text-[9px] mt-1 text-slate-400">ID: {selectedOrder.payment.refunds[0].gatewayRefundId || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Trigger Refund Button */}
                    {selectedOrder.payment?.status === 'COMPLETED' && (!selectedOrder.payment.refunds || selectedOrder.payment.refunds.length === 0) && (
                      <div className="pt-2 flex justify-end">
                        <Button 
                          size="sm"
                          onClick={() => setIsRefundOpen(true)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold h-8 text-[11px]"
                        >
                          <DollarSign className="h-3.5 w-3.5" /> Issue Refund
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Returns management */}
                {selectedOrder.returnRequests && selectedOrder.returnRequests.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5 text-red-500" /> Return Panel controls
                    </h4>
                    <div className="border border-red-200 bg-red-50/5 p-4 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-red-200/30">
                        <span className="font-bold text-red-700 dark:text-red-400">Request Reason</span>
                        <Badge className="bg-red-100 text-red-800 border-red-200">{selectedOrder.returnRequests[0].status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-350 italic font-semibold leading-relaxed">&ldquo;{selectedOrder.returnRequests[0].reason}&rdquo;</p>
                      
                      {/* Actions */}
                      {selectedOrder.returnRequests[0].status === 'RETURN_REQUESTED' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateReturnStatus(selectedOrder.returnRequests![0].id, 'RETURN_APPROVED')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 text-[10px]"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateReturnStatus(selectedOrder.returnRequests![0].id, 'RETURN_REJECTED')}
                            className="border-red-200 text-red-600 hover:bg-red-50/10 font-bold h-8 text-[10px]"
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {selectedOrder.returnRequests[0].status === 'RETURN_APPROVED' && (
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateReturnStatus(selectedOrder.returnRequests![0].id, 'PICKUP_SCHEDULED')}
                          className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-8 text-[10px]"
                        >
                          Schedule Pickup
                        </Button>
                      )}

                      {selectedOrder.returnRequests[0].status === 'PICKUP_SCHEDULED' && (
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateReturnStatus(selectedOrder.returnRequests![0].id, 'PICKED_UP')}
                          className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold h-8 text-[10px]"
                        >
                          Mark Picked Up
                        </Button>
                      )}

                      {selectedOrder.returnRequests[0].status === 'PICKED_UP' && (
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateReturnStatus(selectedOrder.returnRequests![0].id, 'RETURN_RECEIVED')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 text-[10px]"
                        >
                          Receive at Warehouse
                        </Button>
                      )}

                      {selectedOrder.returnRequests[0].status === 'RETURN_RECEIVED' && (
                        <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-250/50">
                          <span className="text-amber-700 dark:text-amber-400 font-bold">Refund ready</span>
                          <Button 
                            size="sm"
                            onClick={() => setIsRefundOpen(true)}
                            className="bg-amber-605 hover:bg-amber-700 text-white font-bold h-7 text-[10px]"
                          >
                            Pay Refund
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-2 flex-shrink-0">
                {['ORDER_PLACED', 'DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED'].includes(selectedOrder.status) && (
                  <Button 
                    onClick={() => handleAdvanceStatus(selectedOrder)}
                    className="h-9 font-bold text-xs"
                  >
                    Advance Status <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
                {selectedOrder.status === 'PACKED' && !selectedOrder.shipment && (
                  <Button 
                    onClick={() => setIsShipmentOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 text-xs"
                  >
                    Generate Shipment
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedOrder(null)} className="h-9 text-xs">
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dispatch Shipment Modal Dialog */}
      <Dialog isOpen={isShipmentOpen} onClose={() => setIsShipmentOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Generate Shipping Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateShipmentSubmit}>
          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Courier Partner *</label>
              <Input 
                value={courierName} 
                onChange={(e) => setCourierName(e.target.value)} 
                placeholder="Blue Dart, Delhivery, etc." 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Tracking Number / AWB *</label>
              <Input 
                value={trackingNumber} 
                onChange={(e) => setTrackingNumber(e.target.value)} 
                placeholder="AWB1234567890" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Tracking Web URL (Optional)</label>
              <Input 
                value={trackingUrl} 
                onChange={(e) => setTrackingUrl(e.target.value)} 
                placeholder="https://track.bluedart.com/..." 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Estimated Delivery Date (Optional)</label>
              <Input 
                type="date"
                value={estimatedDelivery} 
                onChange={(e) => setEstimatedDelivery(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsShipmentOpen(false)}>Cancel</Button>
            <Button type="submit">Dispatch Parcel</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Add Shipment Event Modal Dialog */}
      <Dialog isOpen={isShipmentEventOpen} onClose={() => setIsShipmentEventOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Log Shipping Status Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddShipmentEventSubmit}>
          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Shipment Status *</label>
              <select
                value={shipmentEventStatus}
                onChange={(e) => setShipmentEventStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PROCESSING">Processing at Origin</option>
                <option value="PRINTED">Labels Printed</option>
                <option value="PACKED">Item Secured</option>
                <option value="DISPATCHED">Handed to Partner</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Activity Details / Update Description *</label>
              <Input 
                value={shipmentEventDesc} 
                onChange={(e) => setShipmentEventDesc(e.target.value)} 
                placeholder="Parcel arrived at Hub Bangalore..." 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Current Location (Optional)</label>
              <Input 
                value={shipmentEventLoc} 
                onChange={(e) => setShipmentEventLoc(e.target.value)} 
                placeholder="Hub Bangalore, KA" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsShipmentEventOpen(false)}>Cancel</Button>
            <Button type="submit">Log Event</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Create Refund Modal Dialog */}
      <Dialog isOpen={isRefundOpen} onClose={() => setIsRefundOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Issue Customer Refund</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateRefundSubmit}>
          {selectedOrder?.payment && (
            <div className="space-y-4 py-4 text-xs">
              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg flex flex-col gap-1 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <strong className="text-slate-900 dark:text-white">₹{Number(selectedOrder.payment.amount).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Transaction reference:</span>
                  <span className="font-mono">{selectedOrder.payment.gatewayPaymentId || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Refund Amount (₹) *</label>
                <Input 
                  type="number"
                  value={refundAmount} 
                  onChange={(e) => setRefundAmount(e.target.value)} 
                  placeholder={String(selectedOrder.payment.amount)} 
                  max={String(selectedOrder.payment.amount)}
                  min="1"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Reason for Refund</label>
                <Input 
                  value={refundReason} 
                  onChange={(e) => setRefundReason(e.target.value)} 
                  placeholder="Customer return verified..." 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsRefundOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold">Issue Refund</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
