"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getBanners } from "@/services/clientApi";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface Banner {
  _id: string;
  name: string;
  image: string;
  link: string;
}

export default function Slider() {
  const { t, i18n } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem("admin_banners");
      if (saved) {
        const adminData = JSON.parse(saved);
        const localBanners = adminData
          .filter((b: any) => b.active !== false)
          .map((b: any) => ({
            _id: b.id,
            name: i18n.language === 'ar' ? (b.nameAr || b.name) : b.name,
            image: b.image,
            link: b.link
          }));
        
        if (localBanners.length > 0) {
          setBanners(localBanners);
          return;
        }
      }
      const response = await getBanners();
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length > 0 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [banners.length, isAutoPlaying]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[300px] md:h-[500px] bg-white/5 animate-pulse rounded-[3rem] overflow-hidden border border-white/10" />
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-[3rem] shadow-2xl group border border-white/5">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Main Featured Slide */}
        <div className="flex-[2] relative overflow-hidden">
          <Image
            src={banners[currentSlide]?.image || "/placeholder.svg"}
            alt={banners[currentSlide]?.name || "Banner"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover object-top transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 flex items-center px-10 md:px-20">
            <div className="max-w-xl space-y-6">
              <div className="inline-block bg-[#D4AF37] text-[#5a1832] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                {t('home.collections.mussar')}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white !important leading-tight drop-shadow-2xl" style={{ color: 'white' }}>
                {banners[currentSlide]?.name}
              </h2>
              <div className="pt-4">
                <Link 
                  href={banners[currentSlide]?.link || "/products"}
                  className="inline-block bg-white text-[#5a1832] px-12 py-5 rounded-full font-black text-lg transition-all hover:bg-[#D4AF37] hover:scale-105 active:scale-95 shadow-2xl"
                >
                  تسوق الآن
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Side Banners (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-1 flex-col gap-2 p-2 bg-black/20">
          {[1, 2].map((offset) => {
            const index = (currentSlide + offset) % banners.length;
            const banner = banners[index];
            return (
              <div key={banner?._id || offset} className="flex-1 relative rounded-[2rem] overflow-hidden group/side">
                <Image
                  src={banner?.image || "/placeholder.svg"}
                  alt={banner?.name || "Banner"}
                  fill
                  sizes="33vw"
                  className="object-cover object-top transition-transform duration-700 group-hover/side:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover/side:bg-black/20 transition-all" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-black text-white mb-3 line-clamp-1">{banner?.name}</h3>
                  <Link 
                    href={banner?.link || "/products"}
                    className="inline-block bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2.5 rounded-full text-xs font-black hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all"
                  >
                    استكشف المزيد
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={prevSlide} className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all active:scale-90 shadow-2xl">
            <span className="text-xl">←</span>
          </button>
          <button onClick={nextSlide} className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all active:scale-90 shadow-2xl">
            <span className="text-xl">→</span>
          </button>
        </div>

        <div className="hidden md:flex gap-2 pointer-events-auto">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentSlide(i); setIsAutoPlaying(false); }}
              className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-12 bg-[#D4AF37]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
