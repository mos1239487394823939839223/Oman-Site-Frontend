"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaTimes, FaTags, FaSearch } from "react-icons/fa";
import { adminApi } from "@/services/adminApi";
import CategoryForm from "@/components/admin/CategoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllCategories().catch(() => ({ data: [] }));
      setCategories(res?.data || []);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (editing) {
        await adminApi.updateCategory(editing._id, data);
        toast.success("Category Updated");
      } else {
        await adminApi.createCategory(data);
        toast.success("Category Created");
      }
      setShowForm(false); setEditing(null); fetchData();
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      await adminApi.deleteCategory(target._id);
      setCategories(prev => prev.filter(c => c._id !== target._id));
      toast.success("Deleted", `"${target.name}" removed`);
    } catch (e: any) {
      toast.error("Failed to delete", e.message);
      fetchData();
    }
  };

  const filtered = categories.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories total</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <FaPlus className="w-3.5 h-3.5" /> Add Category
          </button>
        )}
      </div>

      {!showForm && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 placeholder-gray-400 shadow-sm" />
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-lg text-gray-900">{editing ? "Edit Category" : "New Category"}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <CategoryForm category={editing || undefined} onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }} loading={formLoading} />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtered.map(cat => (
            <div key={cat._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-[#5C2E3A]/20 hover:shadow-md transition-all shadow-sm">
              <div className="h-28 overflow-hidden">
                <img src={cat.image || '/placeholder.svg'} alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 truncate mb-2">{cat.name}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing(cat); setShowForm(true); }}
                    className="flex-1 text-center py-1.5 bg-[#5C2E3A]/10 text-[#5C2E3A] rounded-lg text-xs font-bold hover:bg-[#5C2E3A]/15 transition-colors border border-[#5C2E3A]/15">
                    Edit
                  </button>
                  <button onClick={() => setDeleting(cat)}
                    className="flex-1 text-center py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <FaTags className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-bold">{search ? "No matching categories" : "No categories yet"}</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal isOpen={!!deleting} title="Delete Category" message={`Delete "${deleting?.name}"? This may affect products.`}
        confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} onCancel={() => setDeleting(null)} isDanger />
    </>
  );
}
