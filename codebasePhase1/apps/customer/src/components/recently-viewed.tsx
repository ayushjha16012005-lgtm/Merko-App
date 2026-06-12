'use client';

import Link from 'next/link';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@merko/ui';
import { Eye } from 'lucide-react';

export function RecentlyViewed() {
  const { viewedIds } = useRecentlyViewed();
  const { data: response, isLoading } = useProducts({ limit: 100 });

  if (viewedIds.length === 0 || isLoading || !response?.data) return null;

  // Filter products by stored IDs and preserve stored order (most recently viewed first)
  const products = response.data
    .filter((prod) => viewedIds.includes(prod.id))
    .sort((a, b) => viewedIds.indexOf(a.id) - viewedIds.indexOf(b.id));

  if (products.length === 0) return null;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="h-4.5 w-4.5 text-indigo-600" />
          Recently Viewed Products
        </h3>
      </div>

      {/* Swipe track without horizontal scroll bars */}
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
        {products.map((product) => {
          const image = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
          return (
            <div 
              key={product.id} 
              className="w-[200px] flex-shrink-0 snap-start"
            >
              <Link href={`/products/${product.id}`} className="group block">
                <Card className="overflow-hidden border border-slate-200/80 bg-white/70 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 group-hover:shadow-md transition-all duration-200">
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border-b border-slate-100 dark:border-slate-850">
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 uppercase block tracking-wider">
                      {product.category?.name || 'Canvas'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-850 dark:text-slate-205 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      ₹{Number(product.basePrice).toLocaleString('en-IN')}+
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
