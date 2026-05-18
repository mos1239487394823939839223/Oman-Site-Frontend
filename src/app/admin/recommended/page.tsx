"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useToast } from "@/components/admin/ToastProvider";
import { adminApi } from "@/services/adminApi";
import { FaStar, FaBox, FaSearch, FaDatabase, FaPlus } from "react-icons/fa";
import Link from "next/link";

export default function BestSellersManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllProducts().catch(() => ({ data: [] }));
      const products = res?.data || [];
      setAllProducts(products);
      setBestSellingProducts(products.filter((p: any) => p.isRecommended));
    } catch {
      toast.error("Load Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleBestSeller = async (product: any) => {
    try {
      const newState = !product.isRecommended;
      await adminApi.updateProduct(product._id, { isRecommended: newState });
      
      // Update local states
      const updatedAll = allProducts.map(p => 
        p._id === product._id ? { ...p, isRecommended: newState } : p
      );
      setAllProducts(updatedAll);
      setBestSellingProducts(updatedAll.filter(p => p.isRecommended));
      
      toast.success(
        newState ? "Added" : "Removed",
        `"${product.title}" updated successfully.`
      );
    } catch {
      toast.error("Update Failed", "Could not update product status");
    }
  };

  const searchResults = search.trim() === "" ? [] : allProducts.filter(p => 
    !p.isRecommended && p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-[#c5a059]">إدارة الأكثر مبيعاً</h1>
              <p className="text-xs font-bold text-gray-500 mt-1">قسم "المنتجات الأكثر مبيعاً" في الصفحة الرئيسية</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-[#c5a059]/10"
            >
              {showAddForm ? "إغلاق النموذج" : "إضافة منتجات للقسم"}
            </button>
          </div>

          {/* Dedicated Add Form */}
          {showAddForm && (
            <div className="bg-white/[0.03] border border-[#c5a059]/20 rounded-2xl p-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
              <h2 className="text-lg font-black mb-4">نموذج إضافة الأكثر مبيعاً</h2>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="ابحث عن المنتج الذي تريد إضافته..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-sm focus:outline-none focus:border-[#c5a059] placeholder-gray-600 transition-all" 
                />
              </div>
              
              {search.trim() !== "" && (
                <div className="mt-4 bg-black/40 rounded-xl overflow-hidden border border-white/5 max-h-60 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">لم يتم العثور على منتجات غير مضافة</div>
                  ) : (
                    searchResults.map(product => (
                      <div key={product._id} className="flex items-center justify-between p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <img src={product.imageCover} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-sm font-bold">{product.title}</span>
                        </div>
                        <button 
                          onClick={() => toggleBestSeller(product)}
                          className="bg-[#c5a059] text-[#0a0f1a] px-3 py-1.5 rounded-lg text-xs font-black hover:bg-[#e6c35f]"
                        >
                          إضافة الآن
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <FaStar className="text-yellow-500" />
                <h2 className="text-xl font-black">المنتجات المعروضة حالياً ({bestSellingProducts.length})</h2>
              </div>
              
              {bestSellingProducts.length === 0 ? (
                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] py-20 text-center text-gray-600">
                  <FaStar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold text-lg">لا توجد منتجات مضافة للأكثر مبيعاً</p>
                  <p className="text-sm mt-1">استخدم النموذج أعلاه لإضافة منتجات جديدة لهذا القسم</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {bestSellingProducts.map((product) => (
                    <div key={product._id} className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 group hover:border-[#c5a059]/30 transition-all">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                          <img src={product.imageCover || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-base truncate">{product.title}</h3>
                          <p className="text-[#c5a059] font-black text-sm mt-1">{product.price?.toLocaleString()} OMR</p>
                          <button 
                            onClick={() => toggleBestSeller(product)}
                            className="mt-3 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            إزالة من القسم ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductRow({ product, onToggle }: { product: any, onToggle: () => void }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
        <img src={product.imageCover || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="text-white font-bold text-sm truncate">{product.title}</p>
        <span className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-wider">
          {product.price?.toLocaleString()} OMR
        </span>
      </div>
      <button 
        onClick={onToggle}
        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
          product.isRecommended 
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
            : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
        }`}
      >
        {product.isRecommended ? "Remove" : "Add to Recommended"}
      </button>
    </div>
  );
}
