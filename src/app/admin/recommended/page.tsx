"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminApi } from "@/services/adminApi";
import { FaStar, FaSearch } from "react-icons/fa";

export default function BestSellersManagementPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllProducts().catch(() => ({ data: [] }));
      const products = res?.data || [];
      setAllProducts(products);
      setBestSellingProducts(products.filter((p: any) => p.bestSeller));
    } catch {
      toast.error("Load Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleBestSeller = async (product: any) => {
    try {
      const newState = !product.bestSeller;
      await adminApi.updateProduct(product._id, { bestSeller: newState });

      const updatedAll = allProducts.map((p: any) =>
        p._id === product._id ? { ...p, bestSeller: newState } : p
      );
      setAllProducts(updatedAll);
      setBestSellingProducts(updatedAll.filter((p: any) => p.bestSeller));

      toast.success(
        newState ? "Added" : "Removed",
        `"${product.title}" updated successfully.`
      );
    } catch {
      toast.error("Update Failed", "Could not update product status");
    }
  };

  const searchResults = search.trim() === "" ? [] : allProducts.filter(p =>
    !p.bestSeller && p.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Best Sellers</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Manage products shown in the best sellers section</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
        >
          {showAddForm ? "Close Form" : "Add Products to Section"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-[#5C2E3A]/20 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Search &amp; Add Products</h2>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for a product to add..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 placeholder-gray-400 transition-all"
            />
          </div>

          {search.trim() !== "" && (
            <div className="mt-4 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 max-h-60 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
              ) : (
                searchResults.map(product => (
                  <div key={product._id} className="flex items-center justify-between p-3 hover:bg-white border-b border-gray-100 last:border-0 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={product.imageCover} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt={product.title} />
                      <span className="text-sm font-semibold text-gray-900">{product.title}</span>
                    </div>
                    <button
                      onClick={() => toggleBestSeller(product)}
                      className="bg-[#5C2E3A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#4A2330] transition-colors"
                    >
                      Add Now
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
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <FaStar className="text-[#5C2E3A]" />
            <h2 className="text-lg font-bold text-gray-900">Currently Featured ({bestSellingProducts.length})</h2>
          </div>

          {bestSellingProducts.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-20 text-center text-gray-400">
              <FaStar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">No best sellers added yet</p>
              <p className="text-sm mt-1">Use the form above to add products</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {bestSellingProducts.map(product => (
                <div key={product._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-[#5C2E3A]/20 hover:shadow-md transition-all group">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={product.imageCover || '/placeholder.svg'} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-gray-900 font-bold text-sm truncate">{product.title}</h3>
                      <p className="text-[#5C2E3A] font-bold text-sm mt-1">{product.price?.toLocaleString()}</p>
                      <button
                        onClick={() => toggleBestSeller(product)}
                        className="mt-3 text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        Remove from section ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
