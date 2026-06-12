'use client';

import { useState } from 'react';

interface AdminOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  total: string;
  status: 'PENDING' | 'PAYMENT_CONFIRMED' | 'IN_PRODUCTION' | 'QUALITY_CHECK' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  date: string;
  trackingNumber?: string;
  courier?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([
    { id: '1', orderNumber: 'MRK-20260601-0001', customerName: 'Ayush Jha', total: '₹447', status: 'PAYMENT_CONFIRMED', date: '2026-06-07 10:30' },
    { id: '2', orderNumber: 'MRK-20260601-0002', customerName: 'Aarav Mehta', total: '₹299', status: 'IN_PRODUCTION', date: '2026-06-07 11:15' },
    { id: '3', orderNumber: 'MRK-20260601-0003', customerName: 'Sneha Rao', total: '₹1,499', status: 'SHIPPED', date: '2026-06-06 14:00', trackingNumber: 'TRAK987654', courier: 'Delhivery' },
    { id: '4', orderNumber: 'MRK-20260601-0004', customerName: 'Rohan Sharma', total: '₹999', status: 'DELIVERED', date: '2026-06-05 09:00', trackingNumber: 'TRAK123456', courier: 'BlueDart' },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTracking, setTempTracking] = useState('');
  const [tempCourier, setTempCourier] = useState('');

  const advanceStatus = (id: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      PENDING: 'PAYMENT_CONFIRMED',
      PAYMENT_CONFIRMED: 'IN_PRODUCTION',
      IN_PRODUCTION: 'QUALITY_CHECK',
      QUALITY_CHECK: 'SHIPPED',
      SHIPPED: 'DELIVERED',
    };

    const next = nextStatusMap[currentStatus];
    if (!next) return;

    if (next === 'SHIPPED') {
      setEditingId(id);
      setTempTracking('');
      setTempCourier('');
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next as any } : o));
    }
  };

  const handleSaveTracking = (id: string) => {
    if (!tempTracking || !tempCourier) return;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'SHIPPED', trackingNumber: tempTracking, courier: tempCourier } : o));
    setEditingId(null);
  };

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Queue</h1>
        <p className="text-slate-500 text-sm">Monitor order pipeline stages and update fulfillment logs.</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Status:</span>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'PENDING', 'PAYMENT_CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-12 text-center">
            <span className="text-3xl">📦</span>
            <p className="text-slate-500 text-sm mt-3 font-semibold">No orders in this stage.</p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div key={o.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-all">
              <div className="space-y-3 flex-grow">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">{o.orderNumber}</span>
                  <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                    o.status === 'DELIVERED' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                    o.status === 'SHIPPED' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                    o.status === 'QUALITY_CHECK' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                    o.status === 'IN_PRODUCTION' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                    'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {o.status}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 text-xs">
                  <p className="text-slate-500">Customer: <span className="font-semibold text-slate-800">{o.customerName}</span></p>
                  <p className="text-slate-500">Placed: <span className="font-semibold text-slate-800">{o.date}</span></p>
                  <p className="text-slate-500">Amount: <span className="font-semibold text-slate-800">{o.total}</span></p>
                </div>

                {o.trackingNumber && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 max-w-md">
                    <p className="text-xs text-slate-500">
                      Tracking: <span className="font-mono font-bold text-slate-800">{o.trackingNumber}</span> ({o.courier})
                    </p>
                  </div>
                )}

                {editingId === o.id && (
                  <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/20 space-y-3 max-w-md">
                    <p className="text-xs font-bold text-indigo-700">Enter Shipping Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Courier Name"
                        value={tempCourier}
                        onChange={(e) => setTempCourier(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Tracking ID"
                        value={tempTracking}
                        onChange={(e) => setTempTracking(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-slate-500 font-semibold px-3 py-1.5 hover:bg-slate-50 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveTracking(o.id)}
                        className="text-xs bg-indigo-600 text-white font-semibold px-3.5 py-1.5 rounded-lg hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order actions */}
              <div className="flex items-center gap-3">
                {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'REFUNDED' && editingId !== o.id && (
                  <button
                    onClick={() => advanceStatus(o.id, o.status)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1"
                  >
                    <span>Advance Status</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
