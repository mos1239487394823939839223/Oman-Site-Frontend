"use client";

import { useState, useEffect } from "react";
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

  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect(categoryId);
  };

  if (loading) {
    return (
      <div className="bg-white py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto rtl:space-x-reverse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-4 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-2 rtl:space-x-reverse">
          {/* All Categories Button */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg transition-all ${
              selectedCategory === null
                ? 'bg-[#1a3a3a]/10 text-[#1a3a3a]'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${
              selectedCategory === null
                ? 'bg-green-200'
                : 'bg-gray-200'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
              </svg>
            </div>
            <span className="text-xs font-medium">{t('common.all')}</span>
          </button>

          {/* Category Items */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg transition-all ${
                selectedCategory === category._id
                  ? 'bg-[#1a3a3a]/10 text-[#1a3a3a]'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-full overflow-hidden mb-1 border-2 ${
                selectedCategory === category._id
                  ? 'border-green-500'
                  : 'border-gray-200'
              }`}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-center line-clamp-2 max-w-16">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

