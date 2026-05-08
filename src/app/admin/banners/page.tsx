"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider, useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaEdit, FaTrash, FaImages, FaLink, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface Banner {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  link: string;
  active: boolean;
  order: number;
  createdAt: string;
}

const STORAGE_KEY = "admin_banners";

function loadBanners(): Banner[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [
    { id: "b1", name: "Luxury Mussar Collection", nameAr: "تشكيلة المصر الفاخر", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800", link: "/products", active: true, order: 1, createdAt: new Date().toISOString() },
    { id: "b2", name: "Omani Dishdasha", nameAr: "الدشداشة العمانية", image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800", link: "/products", active: true, order: 2, createdAt: new Date().toISOString() },
  ];
}

function saveBanners(banners: Banner[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
}

function BannersContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [form, setForm] = useState({ name: "", nameAr: "", image: "", link: "/products", active: true, order: 1 });

  useEffect(() => { setBanners(loadBanners()); }, []);

  const openCreate = () => {
    setForm({ name: "", nameAr: "", image: "", link: "/products", active: true, order: banners.length + 1 });
    setEditingBanner(null);
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setForm({ name: b.name, nameAr: b.nameAr, image: b.image, link: b.link, active: b.active, order: b.order });
    setEditingBanner(b);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.image) { toast.error("Validation Error", "Name and Image URL are required"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));

    let updated: Banner[];
    if (editingBanner) {
      updated = banners.map(b => b.id === editingBanner.id ? { ...b, ...form } : b);
      toast.success("Banner Updated", "Changes saved successfully");
    } else {
      const newBanner: Banner = { id: `b_${Date.now()}`, ...form, createdAt: new Date().toISOString() };
      updated = [...banners, newBanner];
      toast.success("Banner Created", "New banner added successfully");
    }
    saveBanners(updated);
    setBanners(updated);
    setShowForm(false);
    setSaving(false);
  };

  const handleToggle = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    saveBanners(updated);
    setBanners(updated);
    toast.info("Status Updated", "Banner status changed");
  };

  const confirmDelete = () => {
    if (!deleteBanner) return;
    const updated = banners.filter(b => b.id !== deleteBanner.id);
    saveBanners(updated);
    setBanners(updated);
    setDeleteBanner(null);
    toast.success("Deleted", "Banner removed successfully");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Banners & Sliders</h1>
              <p className="text-gray-500 text-sm mt-1">Manage homepage banners and promotional sliders</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all">
              <FaPlus className="w-3.5 h-3.5" /> Add Banner
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-black mb-6">{editingBanner ? "Edit Banner" : "Create New Banner"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Name (English)</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Name (Arabic)</label>
                  <input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} dir="rtl"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Image URL</label>
                  <input value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Link</label>
                  <input value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: +e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                </div>
                {/* Preview */}
                {form.image && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Preview</label>
                    <img src={form.image} alt="preview" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving}
                  className="bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-6 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
                </button>
                <button onClick={() => setShowForm(false)} className="bg-white/5 hover:bg-white/10 text-gray-400 px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Banners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {banners.sort((a, b) => a.order - b.order).map(banner => (
              <div key={banner.id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden group">
                <div className="relative h-44">
                  <img src={banner.image} alt={banner.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-black text-sm">{banner.name}</p>
                    {banner.nameAr && <p className="text-gray-300 text-xs" dir="rtl">{banner.nameAr}</p>}
                  </div>
                  <span className={`absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full ${banner.active ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <FaLink className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{banner.link}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(banner.id)} className="text-gray-400 hover:text-white transition-colors">
                      {banner.active ? <FaToggleOn className="w-5 h-5 text-emerald-400" /> : <FaToggleOff className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openEdit(banner)} className="w-8 h-8 flex items-center justify-center bg-[#c5a059]/10 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/20 transition-colors">
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteBanner(banner)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                      <FaTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <ConfirmModal isOpen={!!deleteBanner} title="Delete Banner" message={`Delete "${deleteBanner?.name}"?`}
        confirmText="Delete" cancelText="Cancel" onConfirm={confirmDelete} onCancel={() => setDeleteBanner(null)} isDanger />
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
