"use client";

import { useWishlist } from "@/components/WishlistProvider";

interface HeartProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Heart({ productId, className = "", size = 'md' }: HeartProps) {
  const wishlistContext = useWishlist();
  const isInWishlist = wishlistContext?.isInWishlist;
  const toggleWishlist = wishlistContext?.toggleWishlist;
  const loading = wishlistContext?.loading;
  const active = isInWishlist ? isInWishlist(productId) : false;
  
  console.log('Heart component - wishlistContext:', wishlistContext);
  console.log('Heart component - toggleWishlist function:', toggleWishlist);

  // Debug logging
  console.log('Heart component rendered:', { 
    productId, 
    active, 
    loading, 
    hasContext: !!wishlistContext, 
    toggleWishlist: !!toggleWishlist,
    contextKeys: wishlistContext ? Object.keys(wishlistContext) : []
  });
  
  // Force re-render when context changes
  if (!wishlistContext) {
    console.warn('Heart component: No wishlist context available');
  }

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Heart clicked:', { productId, hasToggleWishlist: !!toggleWishlist, currentActive: active });
    
    if (!toggleWishlist) {
      console.error('toggleWishlist function not available');
      console.error('wishlistContext:', wishlistContext);
      console.error('Available methods in context:', wishlistContext ? Object.keys(wishlistContext) : 'No context');
      alert('Wishlist function not available. Please refresh the page.');
      return;
    }
    
    try {
      console.log('Calling toggleWishlist for product:', productId);
      await toggleWishlist(productId);
      console.log('Wishlist toggled successfully');
      
      // Show success message
      const message = active ? 'Product removed from wishlist' : 'Product added to wishlist';
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-primary/80 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2000);
      
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  // If no context, show a disabled heart
  if (!wishlistContext) {
    console.error('Heart component: No wishlist context available');
    return (
      <button
        disabled
        className={`p-2 bg-white/95 rounded-full shadow-lg border border-gray-200 opacity-50 cursor-not-allowed ${className}`}
        aria-label="Wishlist unavailable"
        style={{ zIndex: 30 }}
        type="button"
      >
        <svg 
          className={`${sizeClasses[size]} text-gray-300`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`p-2 bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-300 transition-all duration-200 hover:shadow-xl ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
      } ${className}`}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      style={{ zIndex: 30 }}
      type="button"
    >
      {loading ? (
        <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-red-500 rounded-full animate-spin`}></div>
      ) : (
        <svg 
          className={`${sizeClasses[size]} transition-all duration-200 ${active ? "text-red-500 fill-current" : "text-gray-700 hover:text-red-500"}`}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
    </button>
  );
}
