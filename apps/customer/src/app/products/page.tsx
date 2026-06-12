'use client';

import { useState } from 'react';

interface ProductPlaceholder {
  id: string;
  name: string;
  category: string;
  price: string;
  isCustomizable: boolean;
  image: string;
  rating: number;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const products: ProductPlaceholder[] = [
    {
      id: '1',
      name: 'Premium Employee ID Card',
      category: 'ID Cards',
      price: '₹149',
      isCustomizable: true,
      image: '💳',
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Classic Branded Cotton Tee',
      category: 'Branded T-Shirts',
      price: '₹499',
      isCustomizable: true,
      image: '👕',
      rating: 4.5,
    },
    {
      id: '3',
      name: 'Matte Ceramic Coffee Mug',
      category: 'Custom Mugs',
      price: '₹299',
      isCustomizable: true,
      image: '☕',
      rating: 4.7,
    },
    {
      id: '4',
      name: 'Standard Conference PVC Banner',
      category: 'Event Banners',
      price: '₹999',
      isCustomizable: false,
      image: '🚩',
      rating: 4.2,
    },
  ];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 py-4">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm">Discover custom printed merchandise for personal or corporate branding.</p>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="font-bold text-slate-900">Filter By</h2>
            
            {/* Category Filter Group */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</span>
              <div className="space-y-2">
                {['All Categories', 'ID Cards', 'Apparel', 'Gifts', 'Signage'].map((cat) => (
                  <label key={cat} className="flex items-center space-x-3 text-sm text-slate-600 cursor-pointer hover:text-indigo-600">
                    <input type="checkbox" defaultChecked={cat === 'All Categories'} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Customizability Filter Group */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features</span>
              <label className="flex items-center space-x-3 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span>Customizable Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-semibold text-slate-900 mt-4">No Products Found</h3>
              <p className="text-slate-500 text-sm mt-1">Try modifying your search or filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all flex flex-col"
                >
                  {/* Card Image Area */}
                  <div className="h-48 bg-slate-100 flex items-center justify-center text-7xl select-none relative">
                    {p.image}
                    {p.isCustomizable && (
                      <span className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Customizable
                      </span>
                    )}
                  </div>

                  {/* Details Area */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs text-indigo-600 font-semibold uppercase">{p.category}</span>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">{p.name}</h3>
                      <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-medium">
                        <span>★</span>
                        <span className="text-slate-700">{p.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-extrabold text-slate-900">{p.price}</span>
                      <button
                        className="bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                      >
                        {p.isCustomizable ? 'Customize Design' : 'Add To Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
