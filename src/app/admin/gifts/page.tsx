"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/ToastProvider";
import { adminApi } from "@/services/adminApi";
import { getCategories, getBrands, Product } from "@/services/clientApi";
import ProductForm from "@/components/admin/ProductForm";
import {
  FaPlus,
  FaTimes,
  FaGift,
  FaSearch,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

function GiftsManagementContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

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

  const filtered = gifts.filter(
    (g) =>
      !search || g.title?.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteGift(deleteTarget._id);
      setGifts((prev) => prev.filter((g) => g._id !== deleteTarget._id));
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
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-5 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Gifts</h1>
              <p className="text-xs font-bold text-gray-500 mt-1">
                {gifts.length} free gifts — same fields as products
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setEditingGift(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all"
              >
                <FaPlus className="w-3.5 h-3.5" /> Add Gift
              </button>
            )}
          </div>

          {!showForm && (
            <div className="relative max-w-md mb-6">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gifts..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/40 placeholder-gray-600"
              />
            </div>
          )}

          {showForm ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">
                  {editingGift ? "Edit Gift" : "Create New Gift"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingGift(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
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
                onCancel={() => {
                  setShowForm(false);
                  setEditingGift(null);
                }}
                loading={formLoading}
              />
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <FaGift className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">No gifts found</p>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3 border-b border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-600">
                <span>Image</span>
                <span>Gift</span>
                <span className="text-right">Stock</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {filtered.map((gift) => (
                  <div
                    key={gift._id}
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img
                        src={
                          gift.imageCover?.includes("/gifts/") &&
                          !gift.imageCover.includes("/uploads/gifts/")
                            ? gift.imageCover.replace("/gifts/", "/uploads/gifts/")
                            : gift.imageCover || "/placeholder.svg"
                        }
                        alt={gift.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {gift.title}
                      </p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase mt-1">
                        Free gift
                      </p>
                    </div>
                    <div className="text-right text-white font-black text-sm">
                      {gift.quantity ?? 0}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingGift(gift);
                          setShowForm(true);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-[#c5a059]/10 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/20 transition-colors"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(gift)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

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
    </div>
  );
}

export default function AdminGiftsPage() {
  return (
    <AdminRouteGuard>
      <GiftsManagementContent />
    </AdminRouteGuard>
  );
}
