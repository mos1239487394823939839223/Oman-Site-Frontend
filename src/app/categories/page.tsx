"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSearch, FaGift, FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { getGifts } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";

export default function GiftsPage() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { dir } = useLanguage();

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const data = await getGifts();
      setGifts(data.data || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGiftToCart = async (gift: any) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await addToCart(gift._id, 1, undefined, { isGift: true });
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#5a1832] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      notification.textContent = t('cart.orderConfirmed');
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
    } catch (error) {
      console.error('Error adding gift to cart:', error);
    }
  };

  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) =>
      gift.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [gifts, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-10">
            <div className="h-10 bg-white/10 rounded-2xl w-1/4 mx-auto"></div>
            <div className="h-14 bg-white/10 rounded-3xl w-full max-w-2xl mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-[2.5rem] h-[360px] animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center space-y-6 mb-14">
          <p className="text-[#D4AF37] font-black tracking-widest uppercase text-xs">{t('admin.manageGifts')}</p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{t('admin.manageGifts')}</h1>
          <div className="w-20 h-1.5 bg-[#D4AF37] mx-auto rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>

          {/* Search */}
          <div className="max-w-xl mx-auto relative group mt-6">
            <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-14 pl-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:outline-none transition-all text-white placeholder:text-gray-500 text-base font-medium"
            />
          </div>
        </div>

        {/* Gifts Grid or Empty State */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
            {filteredGifts.map((gift) => (
              <div
                key={gift._id}
                onClick={() => router.push(`/gifts/${gift._id}`)}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:border-[#D4AF37]/30 hover:bg-white/10 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden bg-white">
                  <Image
                    src={resolveMediaUrl(gift.imageCover, "gifts")}
                    alt={gift.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={90}
                    className="object-contain transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
                    {t('common.addToCart')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                      {gift.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2 h-10">{gift.description || t('home.checkBackLater')}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="text-[#D4AF37] font-black text-lg">0.00 د.ع</div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddGiftToCart(gift);
                      }}
                      className="w-full bg-[#5a1832] hover:bg-[#4A2330] text-white py-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                      <FaShoppingCart size={14} />
                      {t('common.addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-28 h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <FaGift className="text-5xl text-[#D4AF37] opacity-60" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">
                {searchQuery ? t('common.noProductsFound', { query: searchQuery }) : t('home.noCategories')}
              </h2>
              <p className="text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? t('common.noProductsFound', { query: searchQuery })
                  : t('home.checkBackLater')}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-8 py-3 bg-[#6f1e3d] hover:bg-[#8d2a4e] text-white rounded-2xl font-black transition-all shadow-lg"
              >
                {t('common.all')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
