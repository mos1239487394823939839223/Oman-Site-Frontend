"use client";

import { useState, useEffect } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/ToastProvider";
import { adminApi } from "@/services/adminApi";
import { getCategories, getBrands, Product } from "@/services/clientApi";
import ProductForm from "@/components/admin/ProductForm";
import { FaPlus, FaTimes, FaGift, FaSearch, FaTrash, FaEdit } from "react-icons/fa";

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGift, setEditingGift] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [giftsRes, catsRes, brandsRes, subCatsRes] = await Promise.all([
        adminApi.getAllGifts().catch(() => ({ data: [] })),
        adminApi.getAllCategories().catch(() => getCategories()),
        adminApi.getAllBrands().catch(() => getBrands()),
        adminApi.getAllSubcategories().catch(() => ({ data: [] })),
      ]);
      setGifts(giftsRes?.data || []);
      setCategories(catsRes?.data || []);
      setBrands(brandsRes?.data || []);
      setSubcategories(subCatsRes?.data || []);
    } catch {
      toast.error("Load Error", "Failed to load gifts");
    } finally {
      setLoading(false);
    }
  };

  const filtered = gifts.filter(g => !search || g.title?.toLowerCase().includes(search.toLowerCase()));

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteGift(deleteTarget._id);
      setGifts(prev => prev.filter(g => g._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Deleted", `"${deleteTarget.title}" permanently removed`);
    } catch {
      toast.error("Delete Failed", "Could not delete gift");
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      setFormLoading(true);
      if (editingGift) {
        await adminApi.updateGift(editingGift._id, data);
        toast.success("Updated", "Gift updated successfully");
      } else {
        await adminApi.createGift(data);
        toast.success("Created", "New gift added to store");
      }
      setShowForm(false);
      setEditingGift(null);
      fetchData();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Save failed";
      toast.error("Save Failed", message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gifts</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">{gifts.length} free gifts</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingGift(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <FaPlus className="w-3.5 h-3.5" /> Add Gift
          </button>
        )}
      </div>

      {!showForm && (
        <div className="relative max-w-md mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search gifts..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 placeholder-gray-400 shadow-sm"
          />
        </div>
      )}

      {showForm ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">{editingGift ? "Edit Gift" : "Create New Gift"}</h2>
            <button
              onClick={() => { setShowForm(false); setEditingGift(null); }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <ProductForm
            product={editingGift || undefined}
            categories={categories}
            subcategories={subcategories}
            brands={brands}
            isGift
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingGift(null); }}
            loading={formLoading}
          />
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaGift className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">No gifts found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Image</span>
            <span>Gift</span>
            <span className="text-right">Stock</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.map(gift => (
              <div key={gift._id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={
                      gift.imageCover?.includes("/gifts/") && !gift.imageCover.includes("/uploads/gifts/")
                        ? gift.imageCover.replace("/gifts/", "/uploads/gifts/")
                        : gift.imageCover || "/placeholder.svg"
                    }
                    alt={gift.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">{gift.title}</p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">Free gift</p>
                </div>
                <div className="text-right text-gray-900 font-bold text-sm">{gift.quantity ?? 0}</div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => { setEditingGift(gift); setShowForm(true); }}
                    className="w-8 h-8 flex items-center justify-center bg-[#5C2E3A]/10 text-[#5C2E3A] rounded-lg hover:bg-[#5C2E3A]/15 transition-colors border border-[#5C2E3A]/15"
                  >
                    <FaEdit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(gift)}
                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Gift"
        message={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDanger
      />
    </>
  );
}
