"use client";

import { useWishlist } from "@/components/WishlistProvider.tsx";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  const active = isInWishlist ? isInWishlist(productId) : false;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!toggleWishlist) return;
    
    try {
      await toggleWishlist(productId);
      
      const message = active ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist');
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#5a1832] text-white px-6 py-3 rounded-lg shadow-2xl z-[100] transition-all duration-300 animate-in fade-in slide-in-from-top-4';
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
    }
  };

  if (!wishlistContext) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`group p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg border border-gray-100 transition-all duration-300 ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer active:scale-90'
      } ${className}`}
      title={active ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist')}
      aria-label={active ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist')}
      type="button"
    >
      {loading ? (
        <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-[#5a1832] rounded-full animate-spin`}></div>
      ) : active ? (
        <FaHeart className={`${sizeClasses[size]} text-red-500 transition-transform duration-300 group-hover:scale-110`} />
      ) : (
        <FaRegHeart className={`${sizeClasses[size]} text-gray-400 group-hover:text-red-500 transition-colors duration-300`} />
      )}
    </button>
  );
}
