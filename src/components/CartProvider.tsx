"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  addToCart: (
    itemId: string,
    quantity?: number,
    color?: string,
    options?: { isGift?: boolean }
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (coupon: string) => Promise<void>;
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
  const [loading, setLoading] = useState(false);

  function applyCartData(data: any) {
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
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setCartTotalAfterDiscount(undefined);
      return;
    }
    try {
      setLoading(true);
      const data = await getCart(token);
      applyCartData(data);
    } catch {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
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
      setLoading(true);
      const data = await addToCartAPI(itemId, token, options);
      applyCartData(data);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } finally {
      setLoading(false);
    }
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
      const cartData = (data?.data && !Array.isArray(data.data)) ? data.data : data;
      const newTotal = cartData?.totalCartPrice;
      if (newTotal !== undefined) setCartTotal(newTotal);
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
      const cartData = (data?.data && !Array.isArray(data.data)) ? data.data : data;
      const newTotal = cartData?.totalCartPrice;
      if (newTotal !== undefined) setCartTotal(newTotal);
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
      setLoading(true);
      await clearCartAPI(token);
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      setCartTotalAfterDiscount(undefined);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (coupon: string) => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      const data = await applyCouponAPI(coupon, token);
      applyCartData(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      cartTotalAfterDiscount,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      applyCoupon,
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
