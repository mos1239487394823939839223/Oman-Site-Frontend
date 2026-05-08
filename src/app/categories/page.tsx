"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getCategories, Category } from "@/services/clientApi";
import { FaSearch, FaGift, FaArrowRight, FaSync } from "react-icons/fa";

export default function GiftsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  const filteredGifts = useMemo(() => {
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-2xl w-1/4 mx-auto"></div>
            <div className="h-16 bg-white rounded-3xl w-full max-w-4xl mx-auto shadow-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[400px] border border-gray-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Page Title & Search Section */}
        <div className="text-center space-y-10 mb-16">
          <div className="space-y-4">
            <p className="text-[#e6c35f] font-black tracking-widest uppercase text-xs">Exquisite Collections</p>
            <h1 className="text-5xl font-black text-[#1a3a3a] tracking-tight">Our Gifts</h1>
            <div className="w-24 h-1.5 bg-[#e6c35f] mx-auto rounded-full shadow-[0_0_15px_rgba(230,195,95,0.4)]"></div>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a3a3a] transition-colors">
              <FaSearch className="text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search for gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white border-none rounded-[2rem] shadow-xl shadow-black/5 focus:ring-4 focus:ring-[#1a3a3a]/5 transition-all outline-none text-lg font-medium text-[#1a3a3a] placeholder:text-gray-300"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#1a3a3a] text-white p-4 rounded-2xl hover:bg-[#6f1e3d] transition-all shadow-lg">
              <FaArrowRight />
            </button>
          </div>
        </div>

        {/* Gifts Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            {filteredGifts.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className="group relative bg-white rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100/50 overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_70px_-15px_rgba(0,0,0,0.1)]"
              >
                {/* Image Section */}
                <div className="relative h-80 p-3">
                  <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                    <img
                      src={category.image || '/placeholder-image.jpg'}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a3a]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                      <span className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest border border-white/20">
                        Explore Collection
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 text-center bg-white">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <FaGift className="text-[#e6c35f] text-sm" />
                    <h3 className="text-2xl font-black text-[#1a3a3a] group-hover:text-[#6f1e3d] transition-colors duration-300 uppercase tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                  <div className="w-12 h-1 bg-gray-100 mx-auto rounded-full group-hover:w-20 group-hover:bg-[#e6c35f] transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - Matched to Screenshot */
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-20 shadow-sm border border-gray-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-100">
                <FaGift className="text-7xl" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
                🎁
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-[#1a3a3a]">No gifts available</h2>
              <p className="text-gray-500 font-medium max-w-md mx-auto text-lg leading-relaxed">
                Check back soon for new gift items curated specifically for your needs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => router.push('/products')}
                className="bg-[#1a3a3a] text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-[#1a3a3a]/10 hover:bg-[#6f1e3d] transition-all hover:scale-105 active:scale-95"
              >
                Browse All Products
              </button>
              <button
                onClick={fetchCategories}
                className="bg-white text-[#1a3a3a] border-2 border-[#1a3a3a]/5 px-10 py-4 rounded-2xl font-black transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <FaSync className={loading ? "animate-spin" : ""} />
                Try Refreshing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


