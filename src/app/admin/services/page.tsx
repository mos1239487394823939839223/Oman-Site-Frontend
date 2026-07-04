"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { adminApi } from "@/services/adminApi";

interface Service {
  _id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const blank = { title: "", titleAr: "", description: "", descriptionAr: "", icon: "⭐", active: true };
  const [form, setForm] = useState(blank);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllServices();
      setServices(res?.data || []);
    } catch (e: any) {
      toast.error("Failed to load", e?.message || "Could not fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error("Required", "Title and description are required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminApi.updateService(editing._id, form);
        toast.success("Updated");
      } else {
        await adminApi.createService(form);
        toast.success("Created", "New service added");
      }
      setShowForm(false);
      await fetchServices();
    } catch (e: any) {
      toast.error("Save failed", e?.message || "Could not save service");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      await adminApi.updateService(s._id, { ...s, active: !s.active });
      setServices(prev => prev.map(sv => sv._id === s._id ? { ...sv, active: !sv.active } : sv));
      toast.info("Status Updated");
    } catch (e: any) {
      toast.error("Update failed", e?.message || "Could not update status");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteService(deleting._id);
      setServices(prev => prev.filter(s => s._id !== deleting._id));
      setDeleting(null);
      toast.success("Deleted");
    } catch (e: any) {
      toast.error("Delete failed", e?.message || "Could not delete service");
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 transition-colors placeholder-gray-400";

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-1">Manage service highlights shown on the store homepage</p>
        </div>
        <button
          onClick={() => { setForm(blank); setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
        >
          <FaPlus className="w-3.5 h-3.5" /> Add Service
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="font-black text-lg text-gray-900 mb-6">{editing ? "Edit Service" : "New Service"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Title (English)</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Title (Arabic)</label>
              <input value={form.titleAr} onChange={e => setForm({...form, titleAr: e.target.value})} dir="rtl" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Description (English)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Description (Arabic)</label>
              <textarea value={form.descriptionAr} onChange={e => setForm({...form, descriptionAr: e.target.value})} dir="rtl" rows={2} className={`${inputClass} resize-none`} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving} className="bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 shadow-sm transition-all">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-6 py-2.5 rounded-xl font-bold text-sm transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No services yet. Add your first service.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {services.map(s => (
            <div key={s._id} className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-opacity ${!s.active && "opacity-50"}`}>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{s.description}</p>
              <p className="text-xs text-gray-400 text-right" dir="rtl">{s.titleAr}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button onClick={() => toggleActive(s)}>
                  {s.active ? <FaToggleOn className="w-5 h-5 text-amber-500" /> : <FaToggleOff className="w-5 h-5 text-gray-300" />}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setForm({ title: s.title, titleAr: s.titleAr, description: s.description, descriptionAr: s.descriptionAr, icon: s.icon, active: s.active }); setEditing(s); setShowForm(true); }}
                    className="w-7 h-7 flex items-center justify-center bg-[#5C2E3A]/10 text-[#5C2E3A] rounded-lg hover:bg-[#5C2E3A]/15 border border-[#5C2E3A]/15"
                  >
                    <FaEdit className="w-3 h-3" />
                  </button>
                  <button onClick={() => setDeleting(s)} className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-100">
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleting}
        title="Delete Service"
        message={`Delete "${deleting?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        isDanger
      />
    </>
  );
}
