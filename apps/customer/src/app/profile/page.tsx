'use client';

import { useState } from 'react';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'designs'>('info');

  const addresses: SavedAddress[] = [
    {
      id: 'addr-1',
      fullName: 'Ayush Jha',
      phone: '+91 98765 43210',
      line1: '123 Enterprise Corporate Park, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: true,
    },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl select-none font-bold text-indigo-700">
          AJ
        </div>
        <div className="space-y-1 text-center md:text-left flex-grow">
          <h1 className="text-2xl font-bold text-slate-900">Ayush Jha</h1>
          <p className="text-slate-500 text-sm">ayush.jha@example.com · Customer</p>
          <div className="flex justify-center md:justify-start gap-2 pt-1.5">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
              Verified Account
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
            {[
              { id: 'info', label: 'Account Information', icon: '👤' },
              { id: 'addresses', label: 'Delivery Addresses', icon: '📍' },
              { id: 'designs', label: 'My Saved Designs', icon: '🎨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Tab Content Panels */}
        <div className="flex-grow bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Personal Settings</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Ayush Jha"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    defaultValue="ayush.jha@example.com"
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    defaultValue="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/10">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-900">Saved Addresses</h2>
                <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs transition-colors">
                  + Add Address
                </button>
              </div>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-slate-200 rounded-xl p-5 relative bg-slate-50/50">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-sm">{addr.fullName}</h3>
                        {addr.isDefault && (
                          <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                        {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">Phone: {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'designs' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Custom Templates & Designs</h2>
              <div className="text-center py-12">
                <span className="text-4xl">🎨</span>
                <h3 className="text-sm font-bold text-slate-900 mt-4">No Saved Designs Yet</h3>
                <p className="text-slate-500 text-xs mt-1">Design configurations you customize on the storefront will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
