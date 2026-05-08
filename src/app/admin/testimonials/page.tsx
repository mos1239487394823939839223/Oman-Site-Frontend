"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider, useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaEdit, FaTrash, FaStar, FaQuoteLeft, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface Testimonial {
  id: string;
  name: string;
  nameAr: string;
  review: string;
  reviewAr: string;
  rating: number;
  avatar: string;
  active: boolean;
  createdAt: string;
}

const STORAGE_KEY = "admin_testimonials";

const defaultTestimonials: Testimonial[] = [
  { id: "t1", name: "Ahmed Al-Rashidi", nameAr: "أحمد الراشدي", review: "Excellent quality Mussar, exactly as described. Fast delivery!", reviewAr: "جودة ممتازة للمصر، بالضبط كما وُصف. توصيل سريع!", rating: 5, avatar: "", active: true, createdAt: new Date().toISOString() },
  { id: "t2", name: "Khalid Al-Balushi", nameAr: "خالد البلوشي", review: "Beautiful Dishdasha, premium fabric and elegant design.", reviewAr: "دشداشة جميلة، قماش فاخر وتصميم أنيق.", rating: 5, avatar: "", active: true, createdAt: new Date().toISOString() },
];

function TestimonialsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const blankForm = { name: "", nameAr: "", review: "", reviewAr: "", rating: 5, avatar: "", active: true };
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setItems(saved ? JSON.parse(saved) : defaultTestimonials);
    } catch { setItems(defaultTestimonials); }
  }, []);

  const save = (updated: Testimonial[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setItems(updated);
  };

  const openCreate = () => { setForm(blankForm); setEditing(null); setShowForm(true); };
  const openEdit = (t: Testimonial) => { setForm({ name: t.name, nameAr: t.nameAr, review: t.review, reviewAr: t.reviewAr, rating: t.rating, avatar: t.avatar, active: t.active }); setEditing(t); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.review) { toast.error("Required Fields", "Name and review are required"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (editing) {
      save(items.map(t => t.id === editing.id ? { ...t, ...form } : t));
      toast.success("Updated", "Review updated successfully");
    } else {
      save([...items, { id: `t_${Date.now()}`, ...form, createdAt: new Date().toISOString() }]);
      toast.success("Added", "New review added");
    }
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    save(items.filter(t => t.id !== deleting.id));
    setDeleting(null);
    toast.success("Deleted", "Review removed");
  };

  const handleToggle = (id: string) => {
    save(items.map(t => t.id === id ? { ...t, active: !t.active } : t));
    toast.info("Status Updated");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Testimonials & Reviews</h1>
              <p className="text-gray-500 text-sm mt-1">Manage customer reviews shown on the website</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all">
              <FaPlus className="w-3.5 h-3.5" /> Add Review
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="font-black text-lg mb-6">{editing ? "Edit Review" : "Add New Review"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[["Name (EN)", "name", "ltr"], ["Name (AR)", "nameAr", "rtl"]].map(([label, field, dir]) => (
                  <div key={field as string}>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
                    <input value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})} dir={dir as string}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" />
                  </div>
                ))}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[["Review (EN)", "review", "ltr"], ["Review (AR)", "reviewAr", "rtl"]].map(([label, field, dir]) => (
                    <div key={field as string}>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
                      <textarea value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})} dir={dir as string} rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors resize-none" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Rating (1-5)</label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setForm({...form, rating: star})}
                        className={`text-2xl transition-colors ${star <= form.rating ? "text-[#c5a059]" : "text-gray-600"}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Avatar URL (Optional)</label>
                  <input value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors" placeholder="https://..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving} className="bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-6 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-50">
                  {saving ? "Saving..." : editing ? "Update Review" : "Add Review"}
                </button>
                <button onClick={() => setShowForm(false)} className="bg-white/5 hover:bg-white/10 text-gray-400 px-6 py-2.5 rounded-xl font-bold text-sm transition-all">Cancel</button>
              </div>
            </div>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className={`bg-white/[0.02] border rounded-2xl p-5 ${item.active ? "border-white/5" : "border-white/5 opacity-60"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 flex items-center justify-center flex-shrink-0 text-[#c5a059] font-black">
                    {item.avatar ? <img src={item.avatar} className="w-full h-full object-cover rounded-xl" alt={item.name} /> : item.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs" dir="rtl">{item.nameAr}</p>
                    <div className="flex mt-1">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= item.rating ? "text-[#c5a059]" : "text-gray-700"}`}>★</span>)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 mb-3">
                  <FaQuoteLeft className="text-[#c5a059]/30 text-sm flex-shrink-0 mt-1" />
                  <p className="text-gray-400 text-xs leading-relaxed">{item.review}</p>
                </div>
                <p className="text-gray-600 text-xs text-right mb-4" dir="rtl">{item.reviewAr}</p>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <button onClick={() => handleToggle(item.id)} className="text-gray-500 hover:text-white transition-colors">
                    {item.active ? <FaToggleOn className="w-5 h-5 text-emerald-400" /> : <FaToggleOff className="w-5 h-5" />}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="w-7 h-7 flex items-center justify-center bg-[#c5a059]/10 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/20 transition-colors">
                      <FaEdit className="w-3 h-3" />
                    </button>
                    <button onClick={() => setDeleting(item)} className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <ConfirmModal isOpen={!!deleting} title="Delete Review" message={`Delete review by "${deleting?.name}"?`}
        confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} onCancel={() => setDeleting(null)} isDanger />
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <ToastProvider>
      <AdminRouteGuard><TestimonialsContent /></AdminRouteGuard>
    </ToastProvider>
  );
}
