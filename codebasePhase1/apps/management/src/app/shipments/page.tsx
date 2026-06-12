'use client';

import { useState } from 'react';
import { useAdminOrders, useAddShipmentEvent } from '@/hooks/useAdmin';
import { 
  Badge, Button, Card, CardContent, CardHeader,
  Dialog, DialogHeader, DialogTitle, DialogFooter, Input, Select, useToast 
} from '@merko/ui';
import { 
  Search, Truck, ExternalLink, CheckCircle2, Clock, PlusCircle
} from 'lucide-react';
import type { OrderResponseDto } from '@merko/types';

export default function AdminShipmentsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Queries
  const { data: adminOrders, isLoading } = useAdminOrders({
    page: 1,
    limit: 1000 // Get high limits to show shipments
  });

  const addShipmentEvent = useAddShipmentEvent();

  // Log event modal states
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [shipmentEventStatus, setShipmentEventStatus] = useState('IN_TRANSIT');
  const [shipmentEventDesc, setShipmentEventDesc] = useState('');
  const [shipmentEventLoc, setShipmentEventLoc] = useState('');

  const orders = adminOrders?.items || [];
  
  // Extract shipments from orders
  const ordersWithShipments = orders.filter(ord => !!ord.shipment);

  // Filter shipments
  const filteredShipments = ordersWithShipments.filter(ord => {
    const ship = ord.shipment!;
    
    // Search filter
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ship.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      ship.courierName.toLowerCase().includes(search.toLowerCase()) ||
      ord.shippingName.toLowerCase().includes(search.toLowerCase());
      
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      ship.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalShipped = ordersWithShipments.length;
  const totalInTransit = ordersWithShipments.filter(o => o.shipment?.status === 'IN_TRANSIT').length;
  const totalDelivered = ordersWithShipments.filter(o => o.shipment?.status === 'DELIVERED').length;

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
      setIsEventOpen(false);
      setShipmentEventDesc('');
      setShipmentEventLoc('');
      setSelectedOrder(null);
    } catch {
      toast('Failed to add tracking event.', 'error');
    }
  };

  return (
    <div className="space-y-6 py-4 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Shipments Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track courier performance, AWB assignment tracking, and update shipment routing status events.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Dispatched</span>
            <Truck className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalShipped}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Assigned tracking numbers
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Transit</span>
            <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalInTransit}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              En route to destinations
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivered</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalDelivered}
            </div>
            <p className="text-[11px] text-slate-450 mt-1.5">
              Fulfillment complete
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
                placeholder="Search AWB, Courier, Customer..." 
                className="pl-9 h-9 text-xs bg-transparent"
              />
            </div>
            <div className="w-44">
              <Select 
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'PROCESSING', label: 'Processing' },
                  { value: 'DISPATCHED', label: 'Dispatched' },
                  { value: 'IN_TRANSIT', label: 'In Transit' },
                  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                  { value: 'DELIVERED', label: 'Delivered' },
                ]}
              />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-450 dark:text-slate-400">
            Total {filteredShipments.length} active shipments
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      ) : filteredShipments.length === 0 ? (
        <Card className="text-center py-16 border-slate-200 dark:border-slate-800">
          <CardContent>
            <Truck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No shipments logged</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">There are no dispatch records matching these filters.</p>
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
                    <th className="p-4">Courier Partner</th>
                    <th className="p-4">Tracking Number / AWB</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Est. Delivery</th>
                    <th className="p-4">Current Milestone</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredShipments.map((ord) => {
                    const ship = ord.shipment!;
                    const lastEvent = ship.events && ship.events.length > 0 ? ship.events[ship.events.length - 1] : null;

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          {ord.orderNumber}
                        </td>
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          {ship.courierName}
                        </td>
                        <td className="p-4 font-mono">
                          {ship.trackingUrl ? (
                            <a 
                              href={ship.trackingUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                            >
                              {ship.trackingNumber} <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            ship.trackingNumber
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold block">{ord.shippingName}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{ord.shippingCity}, {ord.shippingState}</span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {ship.estimatedDelivery ? new Date(ship.estimatedDelivery).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <Badge className={
                              ship.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200 w-fit' :
                              ship.status === 'IN_TRANSIT' ? 'bg-amber-50 text-amber-700 border-amber-200 w-fit' :
                              'bg-indigo-50 text-indigo-700 border-indigo-150 w-fit'
                            }>
                              {ship.status}
                            </Badge>
                            {lastEvent && (
                              <span className="text-[10px] text-slate-450 block truncate max-w-[200px] mt-0.5" title={lastEvent.description}>
                                {lastEvent.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {ship.status !== 'DELIVERED' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsEventOpen(true);
                              }}
                              className="h-7 text-[10px] font-bold flex items-center gap-1"
                            >
                              <PlusCircle className="h-3.5 w-3.5" /> Log Event
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

      {/* Log Event Modal Dialog */}
      <Dialog isOpen={isEventOpen} onClose={() => setIsEventOpen(false)} className="max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Log Shipping Status Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddShipmentEventSubmit}>
          <div className="space-y-4 py-4 text-xs">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shipment Status *</label>
              <select
                value={shipmentEventStatus}
                onChange={(e) => setOriginalState(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent py-2.5 px-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-10"
              >
                <option value="PROCESSING">Processing at Origin</option>
                <option value="DISPATCHED">Handed to Partner</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Update Details / Activity Description *</label>
              <Input 
                value={shipmentEventDesc} 
                onChange={(e) => setShipmentEventDesc(e.target.value)} 
                placeholder="Parcel arrived at Hub Bangalore..." 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Location (Optional)</label>
              <Input 
                value={shipmentEventLoc} 
                onChange={(e) => setShipmentEventLoc(e.target.value)} 
                placeholder="Hub Bangalore, KA" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEventOpen(false)} className="text-xs">Cancel</Button>
            <Button type="submit" disabled={addShipmentEvent.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9">
              {addShipmentEvent.isPending ? 'Logging...' : 'Log Event'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );

  function setOriginalState(value: string) {
    setShipmentEventStatus(value);
  }
}
