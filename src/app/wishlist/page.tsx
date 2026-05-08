"use client";

import { useWishlist } from "@/components/WishlistProvider";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { FaHeart } from "react-icons/fa";

export default function WishlistPage() {
  const context = useWishlist();
  const wishlistItems = context?.wishlistItems || [];
  const fetchWishlist = context?.fetchWishlist;
  const loading = context?.loading || false;
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && typeof fetchWishlist === 'function') {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] p-16 shadow-sm border border-gray-100 text-center space-y-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-5xl">
              🔒
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-[#1a3a3a]">Please Login</h1>
              <p className="text-gray-500 font-medium max-w-md mx-auto">Sign in to see your saved products and manage your favorites list</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-[#1a3a3a] text-white px-10 py-4 rounded-2xl font-black transition-all hover:bg-[#6f1e3d] hover:scale-105 active:scale-95 shadow-xl shadow-[#1a3a3a]/10"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="bg-white text-[#1a3a3a] border-2 border-[#1a3a3a]/10 px-10 py-4 rounded-2xl font-black transition-all hover:bg-gray-50"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-4 mb-10">
          <FaHeart className="text-red-500 text-2xl" />
          <h1 className="text-2xl font-black text-[#1a3a3a] tracking-tight uppercase">My Favorites</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] h-[450px] animate-pulse border border-gray-100">
                <div className="h-72 bg-gray-100 rounded-t-[2.5rem]"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] py-32 shadow-sm border border-gray-100 text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative inline-block">
              <FaHeart className="text-gray-100 text-9xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">💔</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-[#1a3a3a]">No Favorites Yet</h3>
              <p className="text-gray-500 font-medium max-w-lg mx-auto text-lg px-6">
                You haven't added any products to your favorites yet. Start browsing to find products you love!
              </p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="bg-[#1a3a3a] text-white px-12 py-5 rounded-[2rem] font-black shadow-xl shadow-[#1a3a3a]/10 hover:bg-[#6f1e3d] transition-all hover:scale-105 active:scale-95 text-lg"
            >
              Start Browsing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
            {wishlistItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

