"use client";

import { useState, useEffect, useRef } from "react";
import { searchProducts, Product } from "@/services/clientApi";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const displayPlaceholder = placeholder || t('common.searchForProducts');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const fetchSuggestions = async () => {
    if (query.length < 2) return;
    
    setLoading(true);
    try {
      const response = await searchProducts(query);
      setSuggestions((response.data || []).slice(0, 5)); // Show only first 5 suggestions
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.title);
    handleSearch(product.title);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={displayPlaceholder}
            inputMode="search"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="w-full px-6 py-4 pl-14 pr-14 text-[#0F2137] font-medium bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-maroon-main/10 focus:border-maroon-main placeholder:text-gray-400 transition-all"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-5">
            <svg className="w-6 h-6 text-maroon-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute inset-y-0 right-12 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1a3a3a]"></div>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <div className="bg-maroon-main hover:bg-maroon-dark text-white w-11 h-11 rounded-xl transition-all shadow-md flex items-center justify-center active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[60vh] md:max-h-80 overflow-y-auto">
          {suggestions.map((product) => (
            <div
              key={product._id}
              onClick={() => handleSuggestionClick(product)}
              className="flex items-center p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0"
            >
              <img
                src={product.imageCover}
                alt={product.title}
                className="w-12 h-12 object-cover rounded-md mr-3"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-[#0F2137] line-clamp-1">
                  {product.title}
                </h4>
                <p className="text-xs text-gray-500 font-normal">{product.category.name}</p>
                <p className="text-sm font-medium text-maroon-main">
                  {product.priceAfterDiscount ? product.priceAfterDiscount.toLocaleString() : product.price.toLocaleString()} {t('common.egp')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-gray-500 text-center">{t('common.noProductsFound', { query })}</p>
        </div>
      )}
    </div>
  );
}

