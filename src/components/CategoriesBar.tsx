"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategories, Category } from "@/services/clientApi";
import { useTranslation } from "react-i18next";

interface CategoriesBarProps {
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategory?: string | null;
}

export default function CategoriesBar({ onCategorySelect, selectedCategory }: CategoriesBarProps) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/products?category=${categoryId}`);
    } else {
      router.push('/products');
    }
    onCategorySelect(categoryId);
  };

  if (loading) {
    return (
      <div className="bg-transparent py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto rtl:space-x-reverse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-20 h-20 bg-white/5 rounded-full animate-pulse mb-2 border border-white/5"></div>
                <div className="w-16 h-4 bg-white/5 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-1 no-scrollbar rtl:flex-row-reverse">
          {/* All Categories Button */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex-shrink-0 flex flex-col items-center p-2 rounded-2xl transition-all duration-500 group ${selectedCategory === null
                ? 'text-white scale-105'
                : 'text-white/60 hover:text-white hover:scale-105'
              }`}
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-1.5 border transition-all duration-500 ${selectedCategory === null
                ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] bg-white/10'
                : 'border-white/10 bg-white/5 group-hover:border-[#D4AF37]/50'
              }`}>
              <svg className={`w-6 h-6 md:w-7 md:h-7 ${selectedCategory === null ? 'text-[#D4AF37]' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className={`text-xs md:text-sm font-black text-center transition-colors uppercase tracking-widest ${selectedCategory === null ? 'text-[#D4AF37]' : 'text-white/60'
              }`}>{t('common.all')}</span>
          </button>

          {/* Category Items */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`flex-shrink-0 flex flex-col items-center p-2 rounded-2xl transition-all duration-500 group ${selectedCategory === category._id
                  ? 'text-white scale-105'
                  : 'text-white/60 hover:text-white hover:scale-105'
                }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden mb-1.5 border transition-all duration-500 ${selectedCategory === category._id
                  ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] bg-white/10'
                  : 'border-white/10 bg-white/5 group-hover:border-[#D4AF37]/50'
                }`}>
                <img
                  src={category.image || '/placeholder.svg'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <span className={`text-xs md:text-sm font-black text-center transition-colors uppercase tracking-widest ${selectedCategory === category._id ? 'text-[#D4AF37]' : 'text-white/60'
                }`}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

