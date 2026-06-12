'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'merko-recently-viewed';
const LIMIT = 5;

export function useRecentlyViewed() {
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setViewedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse recently viewed items from localStorage', e);
    }
  }, []);

  const addProduct = useCallback((productId: string) => {
    if (!productId) return;
    try {
      setViewedIds((prev) => {
        // Remove duplicate if already present, and insert at front
        const filtered = prev.filter((id) => id !== productId);
        const updated = [productId, ...filtered].slice(0, LIMIT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error('Failed to update recently viewed items', e);
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setViewedIds([]);
    } catch (e) {
      console.error('Failed to clear viewed history', e);
    }
  }, []);

  return {
    viewedIds,
    addProduct,
    clearHistory,
  };
}
