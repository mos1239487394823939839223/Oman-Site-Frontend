"use client";

import { useState, useEffect, useCallback } from "react";
import type { ComponentType } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import { adminApi } from "@/services/adminApi";
import {
  FooterLink,
  FooterSettings,
  FooterTranslation,
} from "@/types/footer";
import {
  FaSave, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaInstagram, FaWhatsapp, FaFacebook, FaTwitter, FaPlus, FaTrash,
} from "react-icons/fa";

const emptyTranslation = (): FooterTranslation => ({ en: "", ar: "" });

const defaultFooter: FooterSettings = {
  phone: "", whatsapp: "", email: "", address: "", addressAr: "",
  hours: "", hoursAr: "", instagram: "", facebook: "", twitter: "",
  brand: emptyTranslation(), description: emptyTranslation(),
  quickLinks: emptyTranslation(), contactInfo: emptyTranslation(),
  home: emptyTranslation(), products: emptyTranslation(),
  reviews: emptyTranslation(), favorites: emptyTranslation(),
  cart: emptyTranslation(), rights: emptyTranslation(), links: [],
};

function footerPayload(data: FooterSettings): Record<string, unknown> {
  const { _id, __v, createdAt, updatedAt, ...rest } = data;
  return rest;
}

function mergeFooterData(data: FooterSettings): FooterSettings {
  return {
    ...defaultFooter, ...data,
    brand: { ...emptyTranslation(), ...data.brand },
    description: { ...emptyTranslation(), ...data.description },
    quickLinks: { ...emptyTranslation(), ...data.quickLinks },
    contactInfo: { ...emptyTranslation(), ...data.contactInfo },
    home: { ...emptyTranslation(), ...data.home },
    products: { ...emptyTranslation(), ...data.products },
    reviews: { ...emptyTranslation(), ...data.reviews },
    favorites: { ...emptyTranslation(), ...data.favorites },
    cart: { ...emptyTranslation(), ...data.cart },
    rights: { ...emptyTranslation(), ...data.rights },
    links: data.links ?? [],
  };
}

type FooterFieldProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
  type?: string;
};

function FooterField({ label, icon: Icon, value, onChange, dir = "ltr", type = "text" }: FooterFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
        <Icon className="w-3.5 h-3.5 text-[#5C2E3A]" /> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        dir={dir}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 transition-colors"
      />
    </div>
  );
}

type FooterTranslationFieldProps = {
  label: string;
  value: FooterTranslation;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
};

function FooterTranslationField({ label, value, onChangeEn, onChangeAr }: FooterTranslationFieldProps) {
  return (
    <div className="md:col-span-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={value.en ?? ""}
          onChange={e => onChangeEn(e.target.value)}
          placeholder="English"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-blue-400 placeholder-gray-400"
        />
        <input
          value={value.ar ?? ""}
          onChange={e => onChangeAr(e.target.value)}
          placeholder="Arabic"
          dir="rtl"
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 placeholder-gray-400"
        />
      </div>
    </div>
  );
}

export default function FooterPage() {
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await adminApi.getFooter();
        if (!cancelled && response?.data) {
          setFooter(mergeFooterData(response.data));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "Could not load footer settings.";
          toast.error("Load Failed", message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await adminApi.updateFooter(footerPayload(footer));
      if (response?.data) {
        setFooter(mergeFooterData(response.data));
      }
      toast.success("Footer Saved", "Changes will appear on the website immediately.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not save footer settings.";
      toast.error("Save Failed", message);
    } finally {
      setSaving(false);
    }
  };

  const setField = useCallback((field: keyof FooterSettings, value: string) => {
    setFooter(prev => ({ ...prev, [field]: value }));
  }, []);

  const setTranslation = useCallback((field: keyof FooterSettings, lang: "en" | "ar", value: string) => {
    setFooter(prev => ({
      ...prev,
      [field]: { ...((prev[field] as FooterTranslation) || emptyTranslation()), [lang]: value },
    }));
  }, []);

  const updateLink = useCallback((index: number, patch: Partial<FooterLink>) => {
    setFooter(prev => ({
      ...prev,
      links: (prev.links ?? []).map((link, i) => i === index ? { ...link, ...patch } : link),
    }));
  }, []);

  const addLink = useCallback(() => {
    setFooter(prev => ({
      ...prev,
      links: [...(prev.links ?? []), { href: "/", labelEn: "", labelAr: "", order: (prev.links?.length ?? 0) + 1, isActive: true }],
    }));
  }, []);

  const removeLink = useCallback((index: number) => {
    setFooter(prev => ({ ...prev, links: (prev.links ?? []).filter((_, i) => i !== index) }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        Loading footer settings...
      </div>
    );
  }

  const sectionClass = "bg-white border border-gray-200 rounded-2xl p-6 shadow-sm";
  const headingClass = "font-black text-sm uppercase tracking-widest text-[#5C2E3A] mb-5";

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Footer Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage footer content shown on the website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-sm"
        >
          <FaSave className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        <div className={sectionClass}>
          <h2 className={headingClass}>Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FooterField label="Phone Number" icon={FaPhone} value={footer.phone ?? ""} onChange={v => setField("phone", v)} />
            <FooterField label="WhatsApp" icon={FaWhatsapp} value={footer.whatsapp ?? ""} onChange={v => setField("whatsapp", v)} />
            <FooterField label="Email Address" icon={FaEnvelope} type="email" value={footer.email ?? ""} onChange={v => setField("email", v)} />
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FooterField label="Address (English)" icon={FaMapMarkerAlt} value={footer.address ?? ""} onChange={v => setField("address", v)} />
            <FooterField label="Address (Arabic)" icon={FaMapMarkerAlt} value={footer.addressAr ?? ""} onChange={v => setField("addressAr", v)} dir="rtl" />
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Working Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FooterField label="Hours (English)" icon={FaClock} value={footer.hours ?? ""} onChange={v => setField("hours", v)} />
            <FooterField label="Hours (Arabic)" icon={FaClock} value={footer.hoursAr ?? ""} onChange={v => setField("hoursAr", v)} dir="rtl" />
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FooterField label="Instagram URL" icon={FaInstagram} value={footer.instagram ?? ""} onChange={v => setField("instagram", v)} />
            <FooterField label="Facebook URL" icon={FaFacebook} value={footer.facebook ?? ""} onChange={v => setField("facebook", v)} />
            <FooterField label="Twitter URL" icon={FaTwitter} value={footer.twitter ?? ""} onChange={v => setField("twitter", v)} />
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Footer Text</h2>
          <div className="grid grid-cols-1 gap-5">
            <FooterTranslationField label="Brand Name" value={footer.brand ?? emptyTranslation()} onChangeEn={v => setTranslation("brand", "en", v)} onChangeAr={v => setTranslation("brand", "ar", v)} />
            <FooterTranslationField label="Description" value={footer.description ?? emptyTranslation()} onChangeEn={v => setTranslation("description", "en", v)} onChangeAr={v => setTranslation("description", "ar", v)} />
            <FooterTranslationField label="Quick Links Heading" value={footer.quickLinks ?? emptyTranslation()} onChangeEn={v => setTranslation("quickLinks", "en", v)} onChangeAr={v => setTranslation("quickLinks", "ar", v)} />
            <FooterTranslationField label="Contact Info Heading" value={footer.contactInfo ?? emptyTranslation()} onChangeEn={v => setTranslation("contactInfo", "en", v)} onChangeAr={v => setTranslation("contactInfo", "ar", v)} />
            <FooterTranslationField label="Copyright" value={footer.rights ?? emptyTranslation()} onChangeEn={v => setTranslation("rights", "en", v)} onChangeAr={v => setTranslation("rights", "ar", v)} />
          </div>
        </div>

        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={headingClass.replace("mb-5", "")}>Quick Links</h2>
            <button type="button" onClick={addLink} className="flex items-center gap-2 text-sm font-bold text-[#5C2E3A] hover:text-[#4A2330]">
              <FaPlus className="w-3 h-3" /> Add Link
            </button>
          </div>
          <div className="space-y-4">
            {(footer.links ?? []).map((link, index) => (
              <div key={link._id ?? `link-${index}`} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Link #{index + 1}</span>
                  <button type="button" onClick={() => removeLink(index)} className="text-red-400 hover:text-red-600" aria-label="Remove link">
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={link.href} onChange={e => updateLink(index, { href: e.target.value })} placeholder="Path e.g. /products"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60" />
                  <input type="number" value={link.order ?? 0} onChange={e => updateLink(index, { order: Number(e.target.value) })} placeholder="Order"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60" />
                  <input value={link.labelEn} onChange={e => updateLink(index, { labelEn: e.target.value })} placeholder="English label"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60" />
                  <input value={link.labelAr} onChange={e => updateLink(index, { labelAr: e.target.value })} placeholder="Arabic label" dir="rtl"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={link.isActive !== false} onChange={e => updateLink(index, { isActive: e.target.checked })} className="rounded accent-[#5C2E3A]" />
                  Active
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
