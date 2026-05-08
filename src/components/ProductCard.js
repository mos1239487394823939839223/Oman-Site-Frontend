"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import Heart from "./Heart";

export default function ProductCard({ product }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart(); // Use CartProvider instead of direct API

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      console.log('ProductCard: Adding product to cart', { productId: product._id });
      
      // Use CartProvider's addToCart function
      await addToCart(product._id, 1);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-primary/80 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = 'Product added to cart successfully! 🛒';
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
      console.error('ProductCard: Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] cursor-pointer overflow-hidden border border-gray-100">
      {/* Product Image Section */}
      <div className="relative h-72 w-full overflow-hidden p-3 pb-0">
        <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
          {product.discount && (
            <div className="absolute top-4 left-4 bg-[#6f1e3d] text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 shadow-lg uppercase tracking-wider">
              {product.discount}% OFF
            </div>
          )}
          
          <img 
            src={product.imageCover || "/placeholder.svg"} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          {/* Wishlist Heart */}
          <div className="absolute top-4 left-4 z-10">
            <Heart 
              productId={product._id}
              className="bg-white p-2 rounded-full shadow-md transition-colors border border-gray-100"
              size="md"
            />
          </div>
          
          {/* Quick View / Add to Cart Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={isAddingToCart}
              className="bg-white text-[#6f1e3d] font-bold px-6 py-3 rounded-full shadow-xl transform translate-y-10 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#6f1e3d] hover:text-white flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Details Section */}
      <div className="p-6 pt-5">
        <div className="mb-4">
          <p className="text-[10px] font-bold text-[#e6c35f] uppercase tracking-widest mb-1">
            {product.category?.name || 'Collection'}
          </p>
          <h3 className="text-lg font-black text-[#1a3a3a] line-clamp-1 group-hover:text-[#6f1e3d] transition-colors duration-300">
            {product.title}
          </h3>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#6f1e3d]">
              {product.price} <span className="text-xs">EGP</span>
            </span>
            {product.priceAfterDiscount && (
              <span className="text-xs text-gray-400 line-through font-medium">
                {product.priceAfterDiscount} EGP
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-bold text-yellow-700">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
}


