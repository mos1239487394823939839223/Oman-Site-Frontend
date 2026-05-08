"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider, useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaConciergeBell } from "react-icons/fa";

interface Service {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  active: boolean;
}

const STORAGE_KEY = "admin_services";

const defaultServices: Service[] = [
  { id: "s1", title: "Free Shipping", titleAr: "شحن مجاني", description: "Free delivery on orders over 50 OMR", descriptionAr: "توصيل مجاني للطلبات فوق 50 ر.ع", icon: "🚚", active: true },
  { id: "s2", title: "Handmade Quality", titleAr: "جودة يدوية", description: "All products are handcrafted with care", descriptionAr: "جميع المنتجات مصنوعة يدوياً بعناية", icon: "✋", active: true },
  { id: "s3", title: "Easy Returns", titleAr: "إرجاع سهل", description: "30-day hassle-free return policy", descriptionAr: "سياسة إرجاع سهلة خلال 30 يوماً", icon: "🔄", active: true },
  { id: "s4", title: "Secure Payment", titleAr: "دفع آمن", description: "100% secure payment methods", descriptionAr: "طرق دفع آمنة 100%", icon: "🔒", active: true },
];

function ServicesContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const blank = { title: "", titleAr: "", description: "", descriptionAr: "", icon: "⭐", active: true };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setServices(saved ? JSON.parse(saved) : defaultServices);
    } catch { setServices(defaultServices); }
  }, []);

  const persist = (updated: Service[]) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); setServices(updated); };

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error("Required", "Title and description are required"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (editing) {
      persist(services.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success("Updated");
    } else {
      persist([...services, { id: `s_${Date.now()}`, ...form }]);
      toast.success("Created", "New service added");
    }
    setShowForm(false);
    setSaving(false);
  };

  const commonInputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors";

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Services</h1>
              <p className="text-gray-500 text-sm mt-1">Manage service highlights shown on the store homepage</p>
            </div>
            <button onClick={() => { setForm(blank); setEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all">
              <FaPlus className="w-3.5 h-3.5" /> Add Service
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="font-black text-lg mb-6">{editing ? "Edit Service" : "New Service"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Icon (Emoji)</label>
                  <input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className={commonInputClass} placeholder="🚚" />
                </div>
                <div />
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Title (English)</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={commonInputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Title (Arabic)</label>
                  <input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} dir="rtl" className={commonInputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description (English)</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={`${commonInputClass} resize-none`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description (Arabic)</label>
                  <textarea value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})} dir="rtl" rows={2} className={`${commonInputClass} resize-none`} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-6 py-2.5 rounded-xl font-black text-sm disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
                <button onClick={() => setShowForm(false)} className="bg-white/5 text-gray-400 hover:bg-white/10 px-6 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {services.map(s => (
              <div key={s.id} className={`bg-white/[0.02] border border-white/5 rounded-2xl p-5 ${!s.active && "opacity-50"}`}>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-black text-white text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{s.description}</p>
                <p className="text-xs text-gray-600 text-right" dir="rtl">{s.titleAr}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <button onClick={() => { persist(services.map(sv => sv.id === s.id ? { ...sv, active: !sv.active } : sv)); toast.info("Status Updated"); }}>
                    {s.active ? <FaToggleOn className="w-5 h-5 text-emerald-400" /> : <FaToggleOff className="w-5 h-5 text-gray-600" />}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setForm({ title: s.title, titleAr: s.titleAr, description: s.description, descriptionAr: s.descriptionAr, icon: s.icon, active: s.active }); setEditing(s); setShowForm(true); }}
                      className="w-7 h-7 flex items-center justify-center bg-[#c5a059]/10 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/20">
                      <FaEdit className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleting(s)} className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <ConfirmModal isOpen={!!deleting} title="Delete Service" message={`Delete "${deleting?.title}"?`}
        confirmText="Delete" cancelText="Cancel"
        onConfirm={() => { if (deleting) { persist(services.filter(s => s.id !== deleting.id)); setDeleting(null); toast.success("Deleted"); } }}
        onCancel={() => setDeleting(null)} isDanger />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <ToastProvider>
      <AdminRouteGuard><ServicesContent /></AdminRouteGuard>
    </ToastProvider>
  );
}
