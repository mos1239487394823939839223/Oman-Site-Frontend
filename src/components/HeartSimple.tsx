"use client";

import { useState, useEffect } from "react";

interface HeartSimpleProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function HeartSimple({ productId, className = "", size = 'md' }: HeartSimpleProps) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  };

  // Load wishlist state from localStorage on mount
  useEffect(() => {
    const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isInWishlist = wishlistIds.includes(productId);
    setActive(isInWishlist);
    console.log('HeartSimple: Loaded wishlist state', { productId, isInWishlist, wishlistIds });
  }, [productId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('HeartSimple clicked:', { productId, currentActive: active });
    
    try {
      setLoading(true);
      
      // Get current wishlist
      const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
      console.log('Current wishlist before toggle:', wishlistIds);
      
      let message = '';
      if (active) {
        // Remove from wishlist
        const newWishlist = wishlistIds.filter((id: string) => id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setActive(false);
        message = 'Product removed from wishlist';
        console.log('Product removed from wishlist:', newWishlist);
      } else {
        // Add to wishlist
        const newWishlist = [...wishlistIds, productId];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        setActive(true);
        message = 'Product added to wishlist';
        console.log('Product added to wishlist:', newWishlist);
      }
      
      // Show success message
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
    } finally {
      setLoading(false);
    }
  };

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
