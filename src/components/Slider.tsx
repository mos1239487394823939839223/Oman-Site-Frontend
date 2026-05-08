"use client";

import { useState, useEffect } from "react";
import { getBanners } from "@/services/clientApi";
import Link from "next/link";
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

  useEffect(() => {
    fetchBanners();
  }, []);

  const displayBanners = banners.length > 0 ? banners : [];

  useEffect(() => {
    if (displayBanners.length > 0 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [displayBanners.length, isAutoPlaying]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      
      // 1. Try to load from localStorage (Admin Dashboard)
      const saved = localStorage.getItem("admin_banners");
      if (saved) {
        const adminData = JSON.parse(saved);
        // Map admin data to the expected Banner interface
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
          setLoading(false);
          return;
        }
      }

      // 2. Fallback to API
      const response = await getBanners();
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Stop auto-play when user interacts
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-gray-600 font-medium">Loading banners...</div>
          </div>
        </div>
      </div>
    );
  }

  if (displayBanners.length === 0) {
    return (
      <div className="relative w-full h-[500px] bg-gradient-to-r from-primary/80 to-blue-600 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Welcome to Our Store</h2>
            <p className="text-xl mb-6">Discover amazing products and deals</p>
            <Link href="/products" className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-2xl group hover:shadow-3xl transition-all duration-500">
      <div className="flex h-full">
        <div className="flex-1 relative group">
          <img
            src={displayBanners[currentSlide]?.image || "/placeholder.svg"}
            alt={displayBanners[currentSlide]?.name || "Featured Product"}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-start pl-12 rtl:pr-12 rtl:pl-0">
            <div className="text-white max-w-lg">
              <div className="inline-block bg-gradient-to-r from-[#1a3a3a]/80 to-[#1a3a3a] text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                ✨ {t('home.collections.mussar')}
              </div>
              <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
                {displayBanners[currentSlide]?.name || "Featured Product"}
              </h2>
              <p className="text-xl mb-8 text-gray-100 drop-shadow-md">
                {t('home.findStyle')}
              </p>
              <div className="flex gap-4">
                <Link 
                  href={displayBanners[currentSlide]?.link || "/products"}
                  className="bg-gradient-to-r from-[#1a3a3a] to-[#1a3a3a]/90 hover:from-[#1a3a3a]/90 hover:to-[#1a3a3a]/80 text-white px-10 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  {t('common.addToCart')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-2">
          <div className="flex-1 relative group">
            <img
              src={displayBanners[(currentSlide + 1) % displayBanners.length]?.image || "/placeholder.svg"}
              alt={displayBanners[(currentSlide + 1) % displayBanners.length]?.name || "Category 1"}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">
                  {displayBanners[(currentSlide + 1) % displayBanners.length]?.name || "Category 1"}
                </h3>
                <Link 
                  href={displayBanners[(currentSlide + 1) % displayBanners.length]?.link || "/products"}
                  className="inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 relative group">
            <img
              src={displayBanners[(currentSlide + 2) % displayBanners.length]?.image || "/placeholder.svg"}
              alt={displayBanners[(currentSlide + 2) % displayBanners.length]?.name || "Category 2"}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">
                  {displayBanners[(currentSlide + 2) % displayBanners.length]?.name || "Category 2"}
                </h3>
                <Link 
                  href={displayBanners[(currentSlide + 2) % displayBanners.length]?.link || "/products"}
                  className="inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 shadow-lg">
        <div className="text-white text-sm font-semibold">
          {currentSlide + 1} / {displayBanners.length}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {displayBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6">
        <button
          onClick={toggleAutoPlay}
          className="flex items-center space-x-3 text-white/80 hover:text-white text-sm bg-white/15 backdrop-blur-md rounded-full px-4 py-3 transition-all duration-300 hover:bg-white/25 shadow-lg"
        >
          <div className={`w-3 h-3 rounded-full ${isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="font-medium">{isAutoPlaying ? 'Auto-play' : 'Paused'}</span>
        </button>
      </div>
    </div>
  );
}

