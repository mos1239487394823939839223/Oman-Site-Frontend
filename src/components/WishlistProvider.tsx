"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  getWishlist,
  addToWishlist as addToWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
  Product,
} from '@/services/clientApi';

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistCount: number;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }
    try {
      setLoading(true);
      const response = await getWishlist(token);
      const items: Product[] = response?.data ?? [];
      setWishlistItems(items);
      setWishlistCount(items.length);
    } catch {
      setWishlistItems([]);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (productId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      await addToWishlistAPI(productId, token);
      await fetchWishlist();
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      await removeFromWishlistAPI(productId, token);
      await fetchWishlist();
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const inWishlist = wishlistItems.some(item => item._id === productId);
    if (inWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistItems.some(item => item._id === productId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      fetchWishlist,
      loading,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
