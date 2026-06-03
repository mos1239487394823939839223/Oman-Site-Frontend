"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider, useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaTimes, FaTags, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { adminApi } from "@/services/adminApi";
import CategoryForm from "@/components/admin/CategoryForm";

function CategoriesContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      fetchData(); // re-sync on failure so the list is accurate
    }
  };

  const filtered = categories.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Categories</h1>
              <p className="text-gray-500 text-sm mt-1">{categories.length} categories total</p>
            </div>
            {!showForm && (
              <button onClick={() => { setEditing(null); setShowForm(true); }}
                className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all">
                <FaPlus className="w-3.5 h-3.5" /> Add Category
              </button>
            )}
          </div>

          {!showForm && (
            <div className="mb-6">
              <div className="relative max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/40 placeholder-gray-600" />
              </div>
            </div>
          )}

          {showForm ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-lg">{editing ? "Edit Category" : "New Category"}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-xl">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <CategoryForm category={editing || undefined} onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditing(null); }} loading={formLoading} />
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white/[0.02] rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered.map(cat => (
                <div key={cat._id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="h-28 overflow-hidden">
                    <img src={cat.image || '/placeholder.svg'} alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm text-white truncate mb-2">{cat.name}</p>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditing(cat); setShowForm(true); }}
                        className="flex-1 text-center py-1.5 bg-[#c5a059]/10 text-[#c5a059] rounded-lg text-xs font-bold hover:bg-[#c5a059]/20 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDeleting(cat)}
                        className="flex-1 text-center py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-600">
                  <FaTags className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">{search ? "No matching categories" : "No categories yet"}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <ConfirmModal isOpen={!!deleting} title="Delete Category" message={`Delete "${deleting?.name}"? This may affect products.`}
        confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} onCancel={() => setDeleting(null)} isDanger />
    </div>
  );
}

export default function CategoriesPage() {
  return <CategoriesContent />;
}
