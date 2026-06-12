'use client';

import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@merko/ui';
import { Sparkles } from 'lucide-react';

interface RecommendationsProps {
  categoryId?: string;
  excludeProductId?: string;
  limit?: number;
}

export function Recommendations({ categoryId, excludeProductId, limit = 4 }: RecommendationsProps) {
  const { data: response, isLoading } = useProducts({
    categoryId: categoryId || undefined,
    limit: 20,
  });

  if (isLoading || !response?.data) {
    return (
      <div className="space-y-4 py-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
          Recommended for You
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Filter out current active product and slice to limit
  let products = response.data;
  if (excludeProductId) {
    products = products.filter((p) => p.id !== excludeProductId);
  }
  products = products.slice(0, limit);

  // Fallback: if no category match or empty, get general featured items
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
        Recommended for You
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => {
          const image = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <Card className="overflow-hidden border border-slate-200/80 bg-white/70 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 group-hover:shadow-md transition-all duration-200">
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border-b border-slate-100 dark:border-slate-850">
                  <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-305 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-3 space-y-1">
                  <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 uppercase block tracking-wider">
                    {product.category?.name || 'Canvases'}
                  </span>
                  <h4 className="font-bold text-xs text-slate-850 dark:text-slate-200 truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                    ₹{Number(product.basePrice).toLocaleString('en-IN')}+
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
