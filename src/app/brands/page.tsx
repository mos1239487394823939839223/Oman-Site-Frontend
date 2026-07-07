"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrands, Brand } from "@/services/clientApi";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await getBrands();
      setBrands(response.data || []);
      setFilteredBrands(response.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter brands based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const handleBrandClick = (brandId: string) => {
    router.push(`/products?brand=${brandId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">All Brands</h1>
            <p className="text-gray-600">Loading brands...</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array(24).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="bg-gray-200 h-16 w-16 rounded-lg mx-auto mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">All Brands</h1>
          <p className="text-gray-600">{filteredBrands.length} of {brands.length} brands available</p>
          <div className="mt-4 flex justify-center">
            <div className="bg-primary/10 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
              🏷️ {filteredBrands.length} Premium Brands
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search brands..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              onClick={() => handleBrandClick(brand._id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group p-6 text-center"
            >
              {/* Brand Logo */}
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-50 transition-colors overflow-hidden">
                  <div className="w-full h-full bg-primary/10 rounded flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Name */}
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                {brand.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBrands.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? "No brands found" : "No brands available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No brands match "${searchQuery}". Try a different search term.`
                : "There are no brands available at the moment"
              }
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
