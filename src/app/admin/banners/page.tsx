"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider, useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaEdit, FaTrash, FaLink } from "react-icons/fa";
import { adminApi } from "@/services/adminApi";

interface Banner {
  _id: string;
  name: string;
  images: string[];
  link: string;
}

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1.*/, "");

function getBannerImageSrc(banner: Banner): string {
  const raw = banner.images?.[0];
  if (!raw) return "/placeholder.svg";
  if (/^https?:\/\//i.test(raw)) return raw;
  // raw is a bare filename saved by sharp — construct full backend static URL
  return `${BACKEND_ORIGIN}/uploads/banners/${raw}`;
}

function BannersContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", link: "/products" });
  const toast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllBanners().catch(() => ({ data: [] }));
      setBanners(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ name: "", link: "/products" });
    setImageFile(null);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setForm({ name: b.name, link: b.link || "/products" });
    setImageFile(null);
    setEditing(b);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Validation Error", "Banner name is required"); return; }
    if (!editing && !imageFile) { toast.error("Validation Error", "Please select an image file"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("link", form.link);
      fd.append("isActive", "true");
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await adminApi.updateBanner(editing._id, fd);
        toast.success("Banner Updated");
      } else {
        await adminApi.createBanner(fd);
        toast.success("Banner Created");
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
    } catch (e: any) {
      toast.error("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      await adminApi.deleteBanner(target._id);
      setBanners(prev => prev.filter(b => b._id !== target._id));
      toast.success("Deleted", `"${target.name}" removed`);
    } catch (e: any) {
      toast.error("Failed to delete", e.message);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Banners &amp; Sliders</h1>
              <p className="text-gray-500 text-sm mt-1">{banners.length} banners total</p>
            </div>
            {!showForm && (
              <button onClick={openCreate} className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all">
                <FaPlus className="w-3.5 h-3.5" /> Add Banner
              </button>
            )}
          </div>

          {showForm && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-black mb-6">{editing ? "Edit Banner" : "Create New Banner"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Link</label>
                  <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Image {editing && <span className="text-gray-500">(leave empty to keep current)</span>}
                  </label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors file:mr-3 file:bg-[#c5a059] file:text-[#0a0f1a] file:border-0 file:rounded-lg file:px-3 file:py-1 file:font-bold file:text-xs cursor-pointer" />
                </div>
                {editing && !imageFile && getBannerImageSrc(editing) !== '/placeholder.svg' && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Current Image</label>
                    <img src={getBannerImageSrc(editing)} alt="current" className="w-full h-48 object-cover rounded-xl border border-white/10" onError={e => { e.currentTarget.src = '/placeholder.svg'; }} />
                  </div>
                )}
                {imageFile && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Preview</label>
                    <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving}
                  className="bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-6 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Banner" : "Create Banner"}
                </button>
                <button onClick={() => { setShowForm(false); setEditing(null); }}
                  className="bg-white/5 hover:bg-white/10 text-gray-400 px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-white/[0.02] rounded-2xl animate-pulse" />)}
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No banners yet. Add your first banner.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {banners.map(banner => (
                <div key={banner._id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group">
                  <div className="relative h-44">
                    <img src={getBannerImageSrc(banner)} alt={banner.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => { e.currentTarget.src = '/placeholder.svg'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-black text-sm">{banner.name}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <FaLink className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{banner.link}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(banner)} className="w-8 h-8 flex items-center justify-center bg-[#c5a059]/10 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/20 transition-colors">
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleting(banner)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <ConfirmModal isOpen={!!deleting} title="Delete Banner" message={`Delete "${deleting?.name}"?`}
        confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} onCancel={() => setDeleting(null)} isDanger />
    </div>
  );
}

export default function BannersPage() {
  return (
    <ToastProvider>
      <AdminRouteGuard><BannersContent /></AdminRouteGuard>
    </ToastProvider>
  );
}

