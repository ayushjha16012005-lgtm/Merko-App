export default function DashboardPage() {
  const stats = [
    { title: 'Revenue Today', value: '₹48,250', delta: '+12.5% from yesterday', icon: '💰' },
    { title: 'Active Orders', value: '42', delta: '8 in production, 2 in QC', icon: '📋' },
    { title: 'Conversion Rate', value: '3.42%', delta: '+0.2% this week', icon: '⚡' },
    { title: 'Low Stock Alert', value: '5 items', delta: 'Requires catalog restock', icon: '⚠️' },
  ];

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Real-time status metrics and financial aggregates.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.delta}</p>
            </div>
            <span className="text-2xl">{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* Detail Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          <div className="divide-y divide-slate-100">
            {[
              { id: 'TXN-1082', customer: 'Ayush Jha', amount: '₹1,490', status: 'SUCCESS', date: 'Just now' },
              { id: 'TXN-1081', customer: 'Aarav Mehta', amount: '₹299', status: 'SUCCESS', date: '12 min ago' },
              { id: 'TXN-1080', customer: 'Sneha Rao', amount: '₹1,598', status: 'FAILED', date: '45 min ago' },
            ].map((txn) => (
              <div key={txn.id} className="flex justify-between items-center py-3.5">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{txn.customer}</p>
                  <p className="text-xs text-slate-400">{txn.id} · {txn.date}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-slate-950">{txn.amount}</p>
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Production Hotspots</h2>
          <div className="divide-y divide-slate-100">
            {[
              { name: 'Premium Employee ID Card', count: 18, workload: 'HIGH' },
              { name: 'Matte Ceramic Coffee Mug', count: 12, workload: 'NORMAL' },
              { name: 'Classic Branded Cotton Tee', count: 4, workload: 'LOW' },
            ].map((prod) => (
              <div key={prod.name} className="flex justify-between items-center py-3.5">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900">{prod.name}</p>
                  <p className="text-xs text-slate-400">{prod.count} items in queue</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                  prod.workload === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                  prod.workload === 'NORMAL' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {prod.workload}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
