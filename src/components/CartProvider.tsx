"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  getCart,
  addToCart as addToCartAPI,
  removeCartItem,
  updateCartItem as updateCartItemAPI,
  clearCart as clearCartAPI,
  applyCoupon as applyCouponAPI,
  CartItem,
} from '@/services/clientApi';
import { useAuth } from '@/components/AuthProvider';

export class LoginRequiredError extends Error {
  constructor() {
    super('LOGIN_REQUIRED');
    this.name = 'LoginRequiredError';
  }
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartTotalAfterDiscount?: number;
  /** The coupon code currently applied (uppercase), or null if none. */
  appliedCoupon: string | null;
  addToCart: (
    itemId: string,
    quantity?: number,
    color?: string,
    options?: { isGift?: boolean }
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (coupon: string) => Promise<{ discount: number }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getToken(): string | null {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartTotalAfterDiscount, setCartTotalAfterDiscount] = useState<number | undefined>(undefined);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function applyCartData(data: any) {
    if (!isMountedRef.current) return;
    // Backend returns { data: { cartItems: [...], totalCartPrice: N } }
    // Fallbacks: flat { cartItems: [...] } or { data: [] } (empty)
    const cartData = (data?.data && !Array.isArray(data.data)) ? data.data : data;
    const rawItems: any[] = Array.isArray(cartData?.cartItems) ? cartData.cartItems
      : Array.isArray(data?.data) ? data.data
      : [];
    // Normalize: backend uses "quantity", our interface uses "count"
    const items: CartItem[] = rawItems.map((item: any) => ({
      ...item,
      product: item.product || item.gift,
      count: item.count ?? item.quantity ?? 1,
    }));
    setCartItems(items);
    setCartCount(items.length);
    setCartTotal(cartData?.totalCartPrice ?? items.reduce((s: number, i: any) => s + i.price * (i.count ?? 1), 0));
    setCartTotalAfterDiscount(cartData?.totalPriceAfterDiscount);
  }

  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      if (!isMountedRef.current) return;
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setCartTotalAfterDiscount(undefined);
      return;
    }
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const data = await getCart(token);
      applyCartData(data);
    } catch {
      if (!isMountedRef.current) return;
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (
    itemId: string,
    _quantity: number = 1,
    color?: string,
    options?: { isGift?: boolean }
  ) => {
    const token = getToken();
    if (!token) throw new LoginRequiredError();
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      const data = await addToCartAPI(itemId, token, { ...options, color });
      if (!isMountedRef.current) return;
      applyCartData(data);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  /**
   * Re-sync totals after a cart mutation (add qty, remove item, …).
   * When a coupon is applied, the discount depends on the current line
   * quantities/items, so we must re-apply it server-side to recalculate —
   * otherwise cartTotalAfterDiscount (and per-line prices for scoped coupons)
   * go stale. Falls back to the mutation's plain totals when no coupon is set
   * or the coupon is no longer valid.
   */
  const syncTotalsAfterMutation = async (mutationData: any, token: string) => {
    if (!isMountedRef.current) return;
    if (appliedCoupon) {
      try {
        const couponData = await applyCouponAPI(appliedCoupon, token);
        if (!isMountedRef.current) return;
        applyCartData(couponData);
        return;
      } catch {
        if (!isMountedRef.current) return;
        // Coupon expired / no longer applicable — drop it and use plain totals.
        setAppliedCoupon(null);
        setCartTotalAfterDiscount(undefined);
      }
    }
    const cartData = (mutationData?.data && !Array.isArray(mutationData.data)) ? mutationData.data : mutationData;
    if (!isMountedRef.current) return;
    if (cartData?.totalCartPrice !== undefined) setCartTotal(cartData.totalCartPrice);
  };

  const removeFromCart = async (itemId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      // Optimistic in-place removal — no global loading to avoid full re-render
      setCartItems(prev => {
        const next = prev.filter(item => item._id !== itemId);
        setCartCount(next.length);
        return next;
      });
      const data = await removeCartItem(itemId, token);
      await syncTotalsAfterMutation(data, token);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch {
      // On error, refresh to get back to consistent state
      await refreshCart();
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    const token = getToken();
    if (!token) return;
    try {
      // Optimistic in-place update — no global loading to avoid full re-render
      setCartItems(prev => prev.map(item =>
        item._id === itemId ? { ...item, count: quantity } : item
      ));
      const data = await updateCartItemAPI(itemId, quantity, token);
      await syncTotalsAfterMutation(data, token);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch {
      // On error, refresh to get back to consistent state
      await refreshCart();
    }
  };

  const clearCart = async () => {
    const token = getToken();
    if (!token) return;
    try {
      if (!isMountedRef.current) return;
      setLoading(true);
      await clearCartAPI(token);
      if (!isMountedRef.current) return;
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setCartTotalAfterDiscount(undefined);
      setAppliedCoupon(null);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  /**
   * Apply a coupon and return the resolved discount percentage so the UI
   * can display it without needing to re-derive it from price maths.
   */
  const applyCoupon = async (coupon: string): Promise<{ discount: number }> => {
    const token = getToken();
    if (!token) throw new Error('LOGIN_REQUIRED');
    try {
      if (!isMountedRef.current) return { discount: 0 };
      setLoading(true);
      const data = await applyCouponAPI(coupon, token);
      if (!isMountedRef.current) return { discount: 0 };
      applyCartData(data);
      const cartData = (data?.data && !Array.isArray(data.data)) ? data.data : data;
      const before = cartData?.totalCartPrice ?? 0;
      const after  = cartData?.totalPriceAfterDiscount ?? before;
      const discount = before > 0 ? Math.round(((before - after) / before) * 100) : 0;
      setAppliedCoupon(coupon.toUpperCase());
      return { discount };
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  /** Remove the active coupon client-side. */
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCartTotalAfterDiscount(undefined);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      cartTotalAfterDiscount,
      appliedCoupon,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      refreshCart,
      loading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
