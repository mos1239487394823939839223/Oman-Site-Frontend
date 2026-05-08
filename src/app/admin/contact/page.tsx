"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ToastProvider, useToast } from "@/components/admin/ToastProvider";
import { FaSave, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaInstagram, FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";

const STORAGE_KEY = "admin_contact";

const defaultContact = {
  phone: "+968 98866635",
  whatsapp: "+968 98866635",
  email: "info@alnaseej.com",
  address: "Muscat, Sultanate of Oman",
  addressAr: "مسقط، سلطنة عمان",
  hours: "Sun-Thu: 9AM-10PM, Fri-Sat: 2PM-10PM",
  hoursAr: "الأحد-الخميس: 9 ص - 10 م، الجمعة-السبت: 2 م - 10 م",
  instagram: "https://instagram.com/owtfactory",
  facebook: "",
  twitter: "",
};

function ContactContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contact, setContact] = useState(defaultContact);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setContact({ ...defaultContact, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
    toast.success("Contact Info Saved", "Changes will appear on the website immediately.");
    setSaving(false);
  };

  const Field = ({ label, icon: Icon, field, dir = "ltr", type = "text" }: any) => (
    <div>
      <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
        <Icon className="w-3.5 h-3.5 text-[#c5a059]" /> {label}
      </label>
      <input
        type={type} value={(contact as any)[field]}
        onChange={e => setContact(prev => ({ ...prev, [field]: e.target.value }))}
        dir={dir}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Contact Information</h1>
              <p className="text-gray-500 text-sm mt-1">Manage store contact details shown on the website</p>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-5 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-50">
              <FaSave className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Contact */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-black text-sm uppercase tracking-widest text-[#c5a059] mb-5">📞 Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Phone Number" icon={FaPhone} field="phone" />
                <Field label="WhatsApp" icon={FaWhatsapp} field="whatsapp" />
                <Field label="Email Address" icon={FaEnvelope} field="email" type="email" />
              </div>
            </div>

            {/* Address */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-black text-sm uppercase tracking-widest text-[#c5a059] mb-5">📍 Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Address (English)" icon={FaMapMarkerAlt} field="address" />
                <Field label="Address (Arabic)" icon={FaMapMarkerAlt} field="addressAr" dir="rtl" />
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-black text-sm uppercase tracking-widest text-[#c5a059] mb-5">🕐 Working Hours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Hours (English)" icon={FaClock} field="hours" />
                <Field label="Hours (Arabic)" icon={FaClock} field="hoursAr" dir="rtl" />
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="font-black text-sm uppercase tracking-widest text-[#c5a059] mb-5">📱 Social Media</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Instagram URL" icon={FaInstagram} field="instagram" />
                <Field label="Facebook URL" icon={FaFacebook} field="facebook" />
                <Field label="Twitter URL" icon={FaTwitter} field="twitter" />
                <Field label="WhatsApp Link" icon={FaWhatsapp} field="whatsapp" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <ToastProvider>
      <AdminRouteGuard><ContactContent /></AdminRouteGuard>
    </ToastProvider>
  );
}
