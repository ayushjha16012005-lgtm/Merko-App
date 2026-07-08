'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogHeader, DialogTitle, DialogFooter, useToast } from '@merko/ui';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useReturns } from '@/hooks/useReturns';
import { 
  MapPin, ClipboardList, Clock, ArrowLeft, CheckCircle2, 
  CreditCard, Truck, RotateCcw, AlertCircle, Calendar, 
  DollarSign, ExternalLink, HelpCircle, Palette
} from 'lucide-react';
import type { ShipmentEventResponseDto, ReturnEventResponseDto } from '@merko/types';

interface TimelineMilestone {
  status: string;
  label: string;
  description: string;
}

const MILESTONES: TimelineMilestone[] = [
  { status: 'ORDER_PLACED', label: 'Order Placed', description: 'Your order was successfully placed.' },
  { status: 'DESIGN_APPROVED', label: 'Design Approved', description: 'Merchandise custom print artwork approved.' },
  { status: 'PRINTING_STARTED', label: 'Printing Initiated', description: 'The custom printing process has started.' },
  { status: 'PRINTING_COMPLETED', label: 'Printing Completed', description: 'Merchandise blanks printed successfully.' },
  { status: 'PACKED', label: 'Packed & Secured', description: 'Items verified, packed, and labeled.' },
  { status: 'DISPATCHED', label: 'Dispatched', description: 'Shipped via courier partner.' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Parcel delivered successfully.' },
];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const { toast } = useToast();

  const { isAuthenticated, isLoading: authLoading, user: currentUser } = useAuth();
  const { order, isLoadingOrder, orderError } = useOrders(orderId);
  const { payWithRazorpay, isInitiating, isVerifying } = usePayments();
  const { requestReturn, isRequestingReturn } = useReturns();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoadingOrder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/20 dark:bg-slate-950/20">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Fetching order details...</p>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Order Not Found</h2>
        <p className="text-slate-500 mb-8">The requested order is invalid or belongs to another user scope.</p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const totalAmount = Number(order.totalAmount);
  const shippingCharge = totalAmount > 1000 ? 0 : 99;
  const gstTax = totalAmount * 0.18;
  const grandTotal = totalAmount + shippingCharge + gstTax;

  const eventsMap = new Map<string, { createdAt: string; description: string }>();
  order.timeline.forEach((evt) => {
    eventsMap.set(evt.status, { createdAt: evt.createdAt, description: evt.description });
  });

  const milestoneStatuses = MILESTONES.map((m) => m.status);
  const activeStatusIndex = milestoneStatuses.indexOf(order.status);

  const isPaid = order.payment?.status === 'COMPLETED';
  const hasPaymentPending = !isPaid && order.status !== 'CANCELLED';

  const handlePayment = async () => {
    if (!currentUser) return;
    await payWithRazorpay({
      orderId: order.id,
      customerName: `${currentUser.firstName} ${currentUser.lastName}`,
      customerEmail: currentUser.email,
      customerPhone: '',
      onSuccess: () => {
        toast('Payment completed successfully and signature verified!', 'success');
      },
      onError: (errMsg) => {
        toast(errMsg, 'error');
      },
    });
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (returnReason.trim().length < 5) {
      toast('Please enter a valid reason (minimum 5 characters).', 'error');
      return;
    }
    try {
      await requestReturn({ orderId: order.id, reason: returnReason });
      toast('Return request submitted successfully!', 'success');
      setIsReturnModalOpen(false);
      setReturnReason('');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast(error.response?.data?.error || 'Failed to submit return request.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh]">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/orders" className="hover:text-indigo-650 transition">Orders</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold dark:text-white">{order.orderNumber}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Order Details
            </h1>
            <Badge className={`${
              order.status === 'DELIVERED' 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400'
            }`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">Reference ID: {order.id}</p>
        </div>
        <Button variant="ghost" asChild className="self-start sm:self-center">
          <Link href="/orders" className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-350">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Main tracking timeline details column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Payment Prompt Card */}
          {hasPaymentPending && (
            <Card className="border-amber-200 bg-amber-50/10 dark:border-amber-900/30 dark:bg-amber-950/10">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 mt-0.5 flex-shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Order Payment Pending</h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Please settle payment to initiate custom printing workflows.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handlePayment} 
                  disabled={isInitiating || isVerifying}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-5 text-xs flex-shrink-0"
                >
                  {isInitiating || isVerifying ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Shipment Tracking details */}
          {order.shipment && (
            <Card className="border-indigo-100 bg-indigo-50/5 dark:border-indigo-950/30 dark:bg-indigo-950/5">
              <CardHeader className="pb-3 border-b border-indigo-100/30 dark:border-indigo-900/20">
                <CardTitle className="text-base flex items-center gap-2 text-indigo-750 dark:text-indigo-400">
                  <Truck className="h-5 w-5" />
                  Shipment Tracking Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs border border-slate-200/50 dark:border-slate-800/60">
                  <div>
                    <span className="text-slate-400 font-medium block">Courier Partner</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{order.shipment.courierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Tracking ID</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{order.shipment.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Est. Delivery</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {order.shipment.estimatedDelivery 
                        ? new Date(order.shipment.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : 'Updating...'}
                    </span>
                  </div>
                  {order.shipment.trackingUrl && (
                    <div className="flex items-end">
                      <a 
                        href={order.shipment.trackingUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-650 hover:text-indigo-750 font-bold inline-flex items-center gap-1"
                      >
                        Track Shipment <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Progress bar visualizer */}
                <div className="relative pt-2 pb-4">
                  <div className="absolute top-[26px] left-[32px] right-[32px] h-[3px] bg-slate-200 dark:bg-slate-800 -z-10 rounded" />
                  <div 
                    className="absolute top-[26px] left-[32px] h-[3px] bg-green-500 -z-10 rounded transition-all duration-500" 
                    style={{ 
                      width: 
                        order.shipment.status === 'DELIVERED' ? '100%' :
                        order.shipment.status === 'OUT_FOR_DELIVERY' ? '66%' :
                        order.shipment.status === 'IN_TRANSIT' ? '33%' : '0%' 
                    }}
                  />

                  <div className="flex justify-between items-start">
                    {[
                      { key: 'DISPATCHED', label: 'Dispatched', icon: <Calendar className="h-3.5 w-3.5" /> },
                      { key: 'IN_TRANSIT', label: 'In Transit', icon: <Truck className="h-3.5 w-3.5" /> },
                      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: <HelpCircle className="h-3.5 w-3.5" /> },
                      { key: 'DELIVERED', label: 'Delivered', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                    ].map((step, idx) => {
                      const shipmentStatuses = ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                      const activeIndex = shipmentStatuses.indexOf(order.shipment!.status);
                      const isReached = idx <= activeIndex;
                      const isCompleted = (isReached && idx < activeIndex) || order.shipment!.status === 'DELIVERED';
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center text-center max-w-[75px]">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                              : isReached 
                              ? 'bg-indigo-650 border-indigo-650 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.icon}
                          </span>
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-350 mt-1.5 block leading-tight">
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery details events */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tracking Event Updates</h4>
                  <div className="relative border-l border-slate-250 dark:border-slate-800 pl-4 space-y-4 text-[11px]">
                    {order.shipment.events?.map((evt: ShipmentEventResponseDto) => (
                      <div key={evt.id} className="relative">
                        <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                        <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-250">
                          <span>{evt.status.replace('_', ' ')}</span>
                          <span className="text-slate-400">{new Date(evt.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{evt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Return Request Summary & Events */}
          {order.returnRequests && order.returnRequests.length > 0 && (
            <Card className="border-red-100 bg-red-50/5 dark:border-red-950/20 dark:bg-red-950/5">
              <CardHeader className="pb-3 border-b border-red-100/30 dark:border-red-900/20">
                <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-405">
                  <RotateCcw className="h-5 w-5" />
                  Item Return Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Return Request Status</span>
                    <Badge className="bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 mt-1">
                      {order.returnRequests[0].status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Request Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-1.5">
                      {new Date(order.returnRequests[0].createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200">Return Logs</h4>
                  <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 space-y-4 text-[11px]">
                    {order.returnRequests[0].events?.map((evt: ReturnEventResponseDto) => (
                      <div key={evt.id} className="relative">
                        <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-red-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                          <span>{evt.status.replace('_', ' ')}</span>
                          <span className="text-slate-400">{new Date(evt.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-slate-500 mt-0.5">{evt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund generated details */}
                {order.payment?.refunds && order.payment.refunds.length > 0 && (
                  <div className="bg-green-50/20 dark:bg-green-950/10 p-4 rounded-xl border border-green-200/50 dark:border-green-900/30 flex items-start gap-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5">
                      <DollarSign className="h-5 w-5" />
                    </span>
                    <div className="text-xs">
                      <h4 className="font-bold text-slate-900 dark:text-white">Refund Receipt Generated</h4>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">
                        A refund amount of ₹{Number(order.payment.refunds[0].amount).toLocaleString('en-IN')} is successfully settled.
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-slate-400 font-medium">
                        <span>Refund Status: <strong className="text-green-600">{order.payment.refunds[0].status}</strong></span>
                        {order.payment.refunds[0].gatewayRefundId && (
                          <span>ID: {order.payment.refunds[0].gatewayRefundId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Standard Fulfillment Timeline */}
          <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-650" />
                Fulfillment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 space-y-6 py-1">
                {MILESTONES.map((milestone, idx) => {
                  const eventRecord = eventsMap.get(milestone.status);
                  const isCompleted = !!eventRecord;
                  const isReached = idx <= activeStatusIndex || isCompleted;

                  return (
                    <div key={milestone.status} className="relative pl-7">
                      <span
                        className={`absolute -left-[10px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 transition-all ${
                          isCompleted
                            ? 'bg-indigo-600 text-white'
                            : isReached
                            ? 'bg-indigo-400 text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                      </span>

                      <div className={isReached ? 'opacity-100' : 'opacity-40'}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {milestone.label}
                          </h4>
                          {eventRecord && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {new Date(eventRecord.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {eventRecord?.description || milestone.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Line items of the placed order */}
          <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-650" />
                Purchased Blank Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Variant: {item.variantName} · SKU: {item.sku}
                    </p>
                    {item.mockupUrl && (
                      <div className="flex items-center gap-2 mt-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-slate-800 max-w-[280px]">
                        <img src={item.mockupUrl} alt="Design Mockup" className="w-8 h-8 object-cover rounded bg-white" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Design Mockup</span>
                          <a href={item.mockupUrl} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-650 hover:underline">View Full Screen</a>
                        </div>
                      </div>
                    )}
                    {item.designConfig && (() => {
                      try {
                        const cfg = JSON.parse(item.designConfig);
                        if (cfg.customerNotes) {
                          return (
                            <div className="text-[10px] bg-amber-50 dark:bg-amber-900/10 text-amber-850 dark:text-amber-200 p-1.5 rounded border border-amber-200/50 dark:border-amber-800/30 mt-1 max-w-[280px]">
                              <strong>Notes:</strong> {cfg.customerNotes}
                            </div>
                          );
                        }
                      } catch(e) {}
                      return null;
                    })()}
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-500 block mb-0.5">
                      ₹{Number(item.price).toLocaleString('en-IN')} x {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Artwork Design Files */}
          {order.designFiles && order.designFiles.length > 0 && (
            <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-5 w-5 text-indigo-650" />
                  Custom Design Artwork Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {order.designFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-950/40 shadow-xs">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-650 dark:bg-indigo-950 dark:text-indigo-400 flex-shrink-0">
                        <Palette className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {file.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          Format: {file.fileType.split('/').pop()}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" asChild className="h-8 px-2 flex-shrink-0 text-xs">
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar address / billing column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping address details */}
          <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider">
                <MapPin className="h-4 w-4" />
                Shipping Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white">{order.shippingName}</p>
              <p>{order.shippingAddressLine1}</p>
              {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
              <p>
                {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}
              </p>
              <p>{order.shippingCountry}</p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Phone: {order.shippingPhone}</p>
            </CardContent>
          </Card>

          {/* Pricing breakdowns card */}
          <Card className="border-slate-200/80 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase text-slate-550 tracking-wider">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST Tax (18%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900 dark:text-white font-sans">
                  {shippingCharge === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingCharge}`}
                </span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Return request activation card */}
          {order.status === 'DELIVERED' && (!order.returnRequests || order.returnRequests.length === 0) && (
            <Card className="border-red-200 bg-red-50/5 dark:border-red-950/20 dark:bg-red-950/5 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-red-650 dark:text-red-400 font-bold uppercase tracking-wider">
                  <RotateCcw className="h-4 w-4" />
                  Order Return Window Open
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Damaged or misprinted custom designs can be returned for full refunds within 7 days.
                </p>
                <Button 
                  onClick={() => setIsReturnModalOpen(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10"
                >
                  Request Returns & Refund
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Return Request dialog drawer modal */}
      <Dialog isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Request Order Return</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleReturnSubmit}>
          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500 uppercase tracking-wide">Select Return Issue</label>
              <select 
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Reason --</option>
                <option value="Printed pattern color mismatch or defect">Custom print details look faded/damaged</option>
                <option value="Wrong product sizes delivered">Sizes do not match variant options selected</option>
                <option value="Blank material/fabric issues">Items have manufacturing defects</option>
                <option value="Incorrect merchandise item received">Wrong blank product delivered</option>
              </select>
            </div>
            
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 flex gap-2 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-950/30">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>Approved returns trigger automated refunds directly to original payment sources.</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsReturnModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isRequestingReturn || !returnReason} className="bg-red-650 text-white text-xs">
              {isRequestingReturn ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
