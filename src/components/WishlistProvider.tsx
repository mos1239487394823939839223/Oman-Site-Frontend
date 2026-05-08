import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getWishlist, addToWishlist as addToWishlistAPI, removeFromWishlist as removeFromWishlistAPI, Product } from '@/services/clientApi';

const wishlistService = {
  toggleWishlist: (productId: string) => {
    const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlistIds.indexOf(productId);
    
    if (index > -1) {
      wishlistIds.splice(index, 1);
    } else {
      wishlistIds.push(productId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
    
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  }
};

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

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      /* Disabling external API sync for local products
      if (token) {
        try {
          const response = await getWishlist(token);
          // ...
        } catch (apiError) {
          console.error('WishlistProvider: API Error', apiError);
        }
      }
      */
      
      const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (wishlistIds.length > 0) {
        try {
          const { getProducts } = await import('@/services/clientApi');
          const productsResponse = await getProducts();
          const allProducts = productsResponse.data || [];
          const items = allProducts.filter((product: any) => wishlistIds.includes(product._id));
          
          setWishlistItems(items);
          setWishlistCount(items.length);
        } catch (error) {
          console.error('WishlistProvider: Error fetching products', error);
          setWishlistItems([]);
          setWishlistCount(0);
        }
      } else {
        setWishlistItems([]);
        setWishlistCount(0);
      }
    } catch (error) {
      console.error('WishlistProvider: Error in fetchWishlist', error);
      setWishlistItems([]);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      /* Disabling external API sync for local products
      if (token) {
        try {
          await addToWishlistAPI(productId, token);
        } catch (apiError) {
          console.error('API error adding to wishlist:', apiError);
        }
      }
      */
      
      wishlistService.toggleWishlist(productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      if (error instanceof Error && (error.message.includes('session has expired') || error.message.includes('login'))) {
        throw error;
      }
      wishlistService.toggleWishlist(productId);
      await fetchWishlist();
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      /* Disabling external API sync for local products
      if (token) {
        try {
          await removeFromWishlistAPI(productId, token);
        } catch (apiError) {
          console.error('API error removing from wishlist:', apiError);
        }
      }
      */
      
      wishlistService.toggleWishlist(productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      if (error instanceof Error && (error.message.includes('session has expired') || error.message.includes('login'))) {
        throw error;
      }
      wishlistService.toggleWishlist(productId);
      await fetchWishlist();
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      const isInWishlistState = wishlistItems.some(item => item._id === productId);
      const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isInWishlistLocalStorage = wishlistIds.includes(productId);
      const isInWishlist = isInWishlistState || isInWishlistLocalStorage;
      
      if (isInWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('login')) {
          alert('Please login to manage your wishlist.');
          window.location.href = '/login';
        } else {
          wishlistService.toggleWishlist(productId);
          await fetchWishlist();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist, fetchWishlist]);

  const isInWishlist = useCallback((productId: string): boolean => {
    const result = wishlistItems.some(item => item._id === productId);
    if (!result) {
      const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlistIds.includes(productId);
    }
    return result;
  }, [wishlistItems]);

  const contextValue = {
    wishlistItems,
    wishlistCount,
    addToCart: () => {}, // Placeholder to match any other usage
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    fetchWishlist,
    loading
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <WishlistContext.Provider value={contextValue as any}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

