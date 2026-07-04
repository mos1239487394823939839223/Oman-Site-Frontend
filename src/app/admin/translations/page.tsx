"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import { FaSave, FaLanguage, FaSearch } from "react-icons/fa";

const DEFAULT_TRANSLATIONS = {
  "header.home": { en: "Home", ar: "الرئيسية" },
  "header.products": { en: "Products", ar: "المنتجات" },
  "header.gifts": { en: "Gifts", ar: "الهدايا" },
  "header.reviews": { en: "Reviews", ar: "التقييمات" },
  "header.favorites": { en: "Favorites", ar: "المفضلة" },
  "header.cart": { en: "Cart", ar: "السلة" },
  "header.login": { en: "Login", ar: "تسجيل الدخول" },
  "header.register": { en: "Register", ar: "إنشاء حساب" },
  "header.logout": { en: "Logout", ar: "تسجيل الخروج" },
  "footer.brand": { en: "Alnaseej", ar: "النزيج" },
  "footer.description": { en: "Specialized in Omani traditional wear since 2010.", ar: "متخصصون في الزي العماني التقليدي منذ عام 2010." },
  "footer.quickLinks": { en: "Quick Links", ar: "روابط سريعة" },
  "footer.contactInfo": { en: "Contact Information", ar: "معلومات التواصل" },
  "footer.rights": { en: "© 2024 Alnaseej. All rights reserved.", ar: "© 2024 النزيج. جميع الحقوق محفوظة." },
  "home.findStyle": { en: "Find your perfect traditional style", ar: "اكتشف أناقتك التقليدية" },
  "home.categories": { en: "Traditional Categories", ar: "الأقسام التقليدية" },
  "home.addedToCart": { en: "Product added to cart successfully!", ar: "تم إضافة المنتج إلى السلة بنجاح!" },
  "home.authRequired": { en: "Please login to add items to cart", ar: "يرجى تسجيل الدخول لإضافة المنتجات للسلة" },
  "common.all": { en: "All Collections", ar: "كل المجموعات" },
  "common.addToCart": { en: "Add to Cart", ar: "أضف إلى السلة" },
  "common.egp": { en: "", ar: "" },
  "common.search": { en: "Search for Mussar, Shal...", ar: "ابحث عن مصر، شال..." },
};

const STORAGE_KEY = "admin_translations";

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Record<string, { en: string; ar: string }>>(DEFAULT_TRANSLATIONS);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTranslations({ ...DEFAULT_TRANSLATIONS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const handleChange = (key: string, lang: "en" | "ar", value: string) => {
    setTranslations(prev => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(translations));
    toast.success("Translations Saved", "All changes have been saved. Refresh the store to see updates.");
    setSaving(false);
  };

  const filtered = Object.entries(translations).filter(([key]) =>
    key.toLowerCase().includes(search.toLowerCase()) ||
    translations[key].en.toLowerCase().includes(search.toLowerCase()) ||
    translations[key].ar.includes(search)
  );

  const groups = filtered.reduce((acc: Record<string, typeof filtered>, [key, val]) => {
    const group = key.split(".")[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push([key, val]);
    return acc;
  }, {});

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Translation Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Edit all website text in Arabic &amp; English from one place</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 self-start sm:self-auto shadow-sm"
        >
          <FaSave className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search translations..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 transition-colors placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([group, entries]) => (
          <div key={group} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Group Header */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <FaLanguage className="text-[#5C2E3A] w-4 h-4" />
              <h2 className="font-black text-sm uppercase tracking-widest text-[#5C2E3A]">{group}</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">{entries.length} keys</span>
            </div>
            {/* Entries */}
            <div className="divide-y divide-gray-100">
              {entries.map(([key, val]) => (
                <div key={key} className="grid grid-cols-1 lg:grid-cols-[200px_1fr_1fr] gap-0 lg:gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start lg:items-center mb-2 lg:mb-0">
                    <code className="text-[11px] text-[#5C2E3A] bg-[#5C2E3A]/10 px-2 py-1 rounded-lg font-mono break-all border border-[#5C2E3A]/15">{key}</code>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block flex items-center gap-1">
                      🇬🇧 English
                    </label>
                    <input
                      value={val.en}
                      onChange={e => handleChange(key, "en", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block flex items-center gap-1">
                      🇸🇦 Arabic
                    </label>
                    <input
                      value={val.ar}
                      onChange={e => handleChange(key, "ar", e.target.value)}
                      dir="rtl"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
