"use client";

import { useState, useEffect } from "react";
import { FaGift, FaTrash, FaPlus, FaImage, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useToast } from "@/components/admin/ToastProvider";

export default function AdminGiftsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const [newGift, setNewGift] = useState({
    name: "",
    description: "",
    image: "",
    link: "",
  });

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await fetch("/api/admin/gifts");
      const data = await res.json();
      setGifts(data.data || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGift.name || !newGift.image) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGift),
      });
      if (res.ok) {
        setNewGift({ name: "", description: "", image: "", link: "" });
        toast.success("تمت الإضافة", "تم إضافة الهدية بنجاح");
        fetchGifts();
      }
    } catch (error) {
      toast.error("خطأ", "فشل إضافة الهدية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGift = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gifts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setGifts(prev => prev.filter(g => g._id !== id));
        toast.success("تم الحذف", "تم حذف الهدية نهائياً");
      }
    } catch (error) {
      toast.error("خطأ", "فشل حذف الهدية");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-5 lg:p-8 min-h-screen overflow-x-hidden" dir="rtl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">إدارة الهدايا</h1>
              <p className="text-gray-500 text-sm mt-1">تحكم في الهدايا المجانية التي تظهر لعملائك</p>
            </div>
            <div className="p-3 bg-[#c5a059]/10 rounded-2xl text-[#c5a059]">
              <FaGift size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="xl:col-span-1">
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl sticky top-8">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                  <FaPlus className="text-[#c5a059]" /> إضافة هدية جديدة
                </h2>
                
                <form onSubmit={handleAddGift} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-1">اسم الهدية</label>
                    <input
                      type="text"
                      required
                      value={newGift.name}
                      onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#c5a059]/20 outline-none transition-all text-white text-sm"
                      placeholder="اسم الهدية هنا..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-1">رابط الصورة</label>
                    <input
                      type="text"
                      required
                      value={newGift.image}
                      onChange={(e) => setNewGift({ ...newGift, image: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#c5a059]/20 outline-none transition-all text-white text-sm"
                      placeholder="رابط صورة الهدية..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-1">رابط التوجيه (اختياري)</label>
                    <input
                      type="text"
                      value={newGift.link}
                      onChange={(e) => setNewGift({ ...newGift, link: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#c5a059]/20 outline-none transition-all text-white text-sm"
                      placeholder="مثال: /products أو https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mr-1">وصف الهدية</label>
                    <textarea
                      value={newGift.description}
                      onChange={(e) => setNewGift({ ...newGift, description: e.target.value })}
                      className="w-full bg-white/[0.05] border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#c5a059]/20 outline-none transition-all text-white text-sm h-24"
                      placeholder="وصف الهدية..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#c5a059] hover:bg-[#d4b57a] text-[#0a0f1a] px-8 py-3.5 rounded-xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/10 mt-2"
                  >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                    إضافة الهدية
                  </button>
                </form>
              </div>
            </div>

            {/* List Column */}
            <div className="xl:col-span-2">
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl min-h-[500px]">
                <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                  قائمة الهدايا الحالية
                  <span className="text-xs font-bold px-3 py-1 bg-[#c5a059]/10 text-[#c5a059] rounded-full">
                    {gifts.length} هدايا
                  </span>
                </h2>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <FaSpinner className="animate-spin text-3xl mb-4" />
                    <p>جاري تحميل البيانات...</p>
                  </div>
                ) : gifts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-600 border-2 border-dashed border-white/5 rounded-3xl">
                    <FaGift size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">لا يوجد هدايا حالياً</p>
                    <p className="text-sm">ابدأ بإضافة أول هدية من النموذج الجانبي</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gifts.map((gift) => (
                      <div key={gift._id} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#c5a059]/30 transition-all flex flex-col">
                        <div className="relative h-40">
                          <Image
                            src={gift.image}
                            alt={gift.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent opacity-60"></div>
                          <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            مجانية
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-white font-black text-base mb-1">{gift.name}</h3>
                          <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-1">{gift.description || 'لا يوجد وصف متاح.'}</p>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                            <span className="text-[#c5a059] text-xs font-black">مجاني</span>
                            <button
                              onClick={() => handleDeleteGift(gift._id)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-2"
                              title="حذف الهدية"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
