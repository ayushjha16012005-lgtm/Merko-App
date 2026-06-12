'use client';

import { useState } from 'react';

interface AdminProductItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  basePrice: string;
  isActive: boolean;
  isDeleted: boolean;
  stock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([
    { id: '1', name: 'Premium Employee ID Card', category: 'ID Cards', sku: 'PRD-ID-001', basePrice: '₹149', isActive: true, isDeleted: false, stock: 150 },
    { id: '2', name: 'Classic Branded Cotton Tee', category: 'Apparel', sku: 'PRD-TS-002', basePrice: '₹499', isActive: false, isDeleted: false, stock: 0 },
    { id: '3', name: 'Matte Ceramic Coffee Mug', category: 'Gifts', sku: 'PRD-MG-003', basePrice: '₹299', isActive: true, isDeleted: false, stock: 8 },
    { id: '4', name: 'Standard Conference PVC Banner', category: 'Signage', sku: 'PRD-BN-004', basePrice: '₹999', isActive: false, isDeleted: true, stock: 12 },
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Counters rollups according to Portal Standards Addendum
  const totalProducts = products.filter(p => !p.isDeleted).length;
  const activeCount = products.filter(p => p.isActive && !p.isDeleted).length;
  const inactiveCount = products.filter(p => !p.isActive && !p.isDeleted).length;
  const deletedCount = products.filter(p => p.isDeleted).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10 && !p.isDeleted).length;
  const outOfStockCount = products.filter(p => p.stock === 0 && !p.isDeleted).length;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleBulkActivate = () => {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive: true } : p));
    setSelectedIds([]);
  };

  const handleBulkDeactivate = () => {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isActive: false } : p));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isDeleted: true, isActive: false } : p));
    setSelectedIds([]);
  };

  const handleBulkRestore = () => {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isDeleted: false, isActive: false } : p));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Products</h1>
          <p className="text-slate-500 text-sm">Create, edit, and configure custom field parameters per product category.</p>
        </div>
        <div>
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm">
            + Add Product
          </button>
        </div>
      </div>

      {/* Operational Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Products', val: totalProducts, color: 'border-slate-200 text-slate-900 bg-white' },
          { label: 'Active', val: activeCount, color: 'border-emerald-200 text-emerald-700 bg-emerald-50/20' },
          { label: 'Inactive / Draft', val: inactiveCount, color: 'border-slate-200 text-slate-500 bg-white' },
          { label: 'Deleted', val: deletedCount, color: 'border-rose-200 text-rose-700 bg-rose-50/20' },
          { label: 'Low Stock', val: lowStockCount, color: 'border-amber-200 text-amber-700 bg-amber-50/20' },
          { label: 'Out of Stock', val: outOfStockCount, color: 'border-red-200 text-red-700 bg-red-50/20' },
        ].map((counter) => (
          <div key={counter.label} className={`border rounded-xl p-4 text-center ${counter.color} shadow-sm`}>
            <p className="text-2xl font-black">{counter.val}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{counter.label}</p>
          </div>
        ))}
      </div>

      {/* Product Table Block */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4">
        {/* Bulk Actions Panel */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">
              {selectedIds.length} item(s) selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              disabled={selectedIds.length === 0}
              className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              disabled={selectedIds.length === 0}
              className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="bg-rose-50 border border-rose-100 hover:border-rose-200 text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              Soft Delete
            </button>
            <button
              onClick={handleBulkRestore}
              disabled={selectedIds.length === 0}
              className="bg-indigo-50 border border-indigo-100 hover:border-indigo-200 text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              Restore
            </button>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">SKU Code</th>
                <th className="py-4 px-6">Base Price</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6">Display Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    p.isDeleted ? 'bg-rose-50/10 text-slate-400 line-through' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.category}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs">{p.sku}</td>
                  <td className="py-4 px-6 font-bold">{p.basePrice}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        p.stock === 0 ? 'bg-rose-500' : p.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span className="text-xs font-medium">{p.stock} units</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      p.isDeleted
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : p.isActive
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {p.isDeleted ? 'DELETED' : p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
