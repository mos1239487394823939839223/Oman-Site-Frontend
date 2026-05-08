"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart, addToCart as addToCartAPI, removeCartItem, updateCartItem as updateCartItemAPI, clearCart as clearCartAPI, CartItem } from '@/services/clientApi';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);


  const refreshCart = async () => {
    let loadingTimeout: NodeJS.Timeout | undefined;
    
    try {
      if (loading) {
        console.log('CartProvider: refreshCart already in progress, skipping');
        return;
      }
      
      console.log('CartProvider: Starting refreshCart');
      setLoading(true);
      
      loadingTimeout = setTimeout(() => {
        console.log('CartProvider: Loading timeout reached, setting loading to false');
        setLoading(false);
      }, 5000);
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('CartProvider: refreshCart called', {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0
      });
      
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      console.log('CartProvider: Setting cart items from localStorage:', cartData);
      
      setCartItems([...cartData]);
      setCartCount(cartData.length);
      setCartTotal(cartData.reduce((sum: number, item: any) => sum + (item.price * item.count), 0));
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      console.log('CartProvider: Cart state updated from localStorage, new count:', cartData.length);
      
      /* Disabling external API sync for local products
      if (token && user && token.length > 10) {
        try {
          console.log('CartProvider: Attempting to fetch cart from API');
          const response = await getCart(token);
          // ... (rest of sync logic)
        } catch (apiError) {
          console.error('CartProvider: API error fetching cart:', apiError);
        }
      }
      */
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      console.log('CartProvider: Finished refreshCart');
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      setTimeout(() => setLoading(false), 100);
    }
  };

  useEffect(() => {
    console.log('CartProvider: Component mounted, calling refreshCart');
    refreshCart().catch(error => {
      console.error('CartProvider: Error in initial refresh:', error);
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && e.newValue !== null) {
        console.log('CartProvider: localStorage cart changed, refreshing');
        const cartData = JSON.parse(e.newValue);
        setCartItems([...cartData]);
        setCartCount(cartData.length);
        setCartTotal(cartData.reduce((sum: number, item: any) => sum + (item.price * item.count), 0));
        
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    };

    const handleCustomStorageChange = () => {
      console.log('CartProvider: Custom storage event triggered');
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems([...cartData]);
      setCartCount(cartData.length);
      setCartTotal(cartData.reduce((sum: number, item: any) => sum + (item.price * item.count), 0));
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCustomStorageChange);
    };
  }, []);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      // Prevent multiple simultaneous calls
      if (loading) {
        console.log('CartProvider: addToCart already in progress, skipping');
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('token');
      console.log('CartProvider: addToCart called', { productId, quantity, hasToken: !!token });
      
      // Always update localStorage first for immediate UI feedback
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cartData.find((item: any) => item.product._id === productId);
      
      if (existingItem) {
        existingItem.count += quantity;
      } else {
        // Get product details from API or use basic info
        try {
          const { getProduct } = await import('@/services/clientApi');
          const productResponse = await getProduct(productId);
          const product = productResponse.data;
          
          cartData.push({
            _id: Date.now().toString(),
            product: product,
            count: quantity,
            price: product.price
          });
        } catch (error) {
          // If can't get product details, create basic item
          cartData.push({
            _id: Date.now().toString(),
            product: { _id: productId, title: 'Product', price: 0 },
            count: quantity,
            price: 0
          });
        }
      }
      
      localStorage.setItem('cart', JSON.stringify(cartData));
      console.log('CartProvider: Updated localStorage cart:', cartData);
      
      // Update state immediately
      console.log('CartProvider: Updating state with cartData:', cartData);
      setCartItems([...cartData]); // Create new array to trigger re-render
      setCartCount(cartData.length);
      setCartTotal(cartData.reduce((sum: number, item: any) => sum + (item.price * item.count), 0));
      console.log('CartProvider: State updated - cartItems:', cartData, 'cartCount:', cartData.length);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // If user is authenticated, try to sync with API
      /* Disabling external API sync for local products
      if (token) {
        try {
          await addToCartAPI(productId, token);
        } catch (apiError) {
          console.error('CartProvider: API error adding to cart:', apiError);
        }
      }
      */
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setLoading(true);
      
      // Always update localStorage first for immediate UI feedback
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCart = cartData.filter((item: any) => item.product._id !== productId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Update state immediately
      setCartItems([...updatedCart]); // Create new array to trigger re-render
      setCartCount(updatedCart.length);
      setCartTotal(updatedCart.reduce((sum: number, item: any) => sum + (item.price * item.count), 0));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await removeCartItem(productId, token);
          return;
        } catch (apiError) {
          console.error('API error removing from cart:', apiError);
          // Keep localStorage data
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      
      // Always update localStorage first for immediate UI feedback
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = cartData.find((item: any) => item.product._id === productId);
      if (item) {
        item.count = quantity;
        localStorage.setItem('cart', JSON.stringify(cartData));
        
        // Update state immediately
        setCartItems([...cartData]); // Create new array to trigger re-render
        setCartCount(cartData.length);
        setCartTotal(cartData.reduce((sum: number, item: any) => sum + (item.price * item.count), 0));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await updateCartItemAPI(productId, quantity, token);
          return;
        } catch (apiError) {
          console.error('API error updating cart item:', apiError);
          // Keep localStorage data
        }
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      // Always update localStorage first for immediate UI feedback
      localStorage.setItem('cart', JSON.stringify([]));
      
      // Update state immediately
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await clearCartAPI(token);
          return;
        } catch (apiError) {
          console.error('API error clearing cart:', apiError);
          // Keep localStorage data (empty cart)
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      refreshCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


