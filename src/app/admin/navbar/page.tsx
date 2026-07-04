"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import {
  DEFAULT_NAV_ITEMS, NavItem, NAVBAR_STORAGE_KEY, ICON_OPTIONS
} from "@/lib/navbarConfig";
import {
  FaSave, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown,
  FaRedo, FaBars, FaHome, FaShoppingBag, FaGift, FaStar,
  FaHeart, FaShoppingCart, FaBox, FaTag, FaUsers, FaBell,
  FaPhone, FaEnvelope, FaInfo, FaCog, FaStore, FaEdit
} from "react-icons/fa";

const ICON_MAP: Record<string, React.ElementType> = {
  FaHome, FaShoppingBag, FaGift, FaStar, FaHeart,
  FaShoppingCart, FaBox, FaTag, FaUsers, FaBell,
  FaPhone, FaEnvelope, FaInfo, FaCog, FaStore
};

function IconPreview({ name }: { name: string }) {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon className="w-4 h-4" /> : <FaBars className="w-4 h-4" />;
}

export default function NavbarManagerPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAVBAR_STORAGE_KEY);
      if (saved) {
        const parsed: NavItem[] = JSON.parse(saved);
        const savedKeys = parsed.map(i => i.key);
        const missing = DEFAULT_NAV_ITEMS.filter(d => !savedKeys.includes(d.key));
        setItems([...parsed, ...missing].sort((a, b) => a.order - b.order));
      } else {
        setItems([...DEFAULT_NAV_ITEMS]);
      }
    } catch {
      setItems([...DEFAULT_NAV_ITEMS]);
    }
  }, []);

  const updateItem = (key: string, patch: Partial<NavItem>) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, ...patch } : i));
  };

  const moveItem = (key: string, dir: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(i => i.key === key);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sorted.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const newOrder = sorted[swapIdx].order;
    sorted[swapIdx].order = sorted[idx].order;
    sorted[idx].order = newOrder;
    setItems([...sorted]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    localStorage.setItem(NAVBAR_STORAGE_KEY, JSON.stringify(items));
    toast.success("Navbar Saved", "Changes will reflect immediately after page reload.");
    setSaving(false);
  };

  const handleReset = () => {
    setItems([...DEFAULT_NAV_ITEMS]);
    localStorage.removeItem(NAVBAR_STORAGE_KEY);
    toast.info("Reset", "Navbar restored to default settings.");
  };

  const sorted = [...items].sort((a, b) => a.order - b.order);
  const visibleCount = items.filter(i => i.visible).length;

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Navbar Manager</h1>
          <p className="text-gray-500 text-sm mt-1">
            Control which links appear in the navigation bar — {visibleCount} of {items.length} visible
          </p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <FaRedo className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-sm"
          >
            <FaSave className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Live Preview Bar */}
      <div className="mb-8 bg-gray-900 rounded-2xl p-4 border border-gray-800">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Live Preview</p>
        <div className="flex items-center gap-1 flex-wrap">
          {sorted.filter(i => i.visible).map(item => (
            <div key={item.key} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <IconPreview name={item.icon} />
              <span>{item.labelEn}</span>
            </div>
          ))}
          {sorted.filter(i => i.visible).length === 0 && (
            <p className="text-gray-500 text-sm">No items visible — add some below</p>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {sorted.map((item, idx) => (
          <div
            key={item.key}
            className={`bg-white border rounded-2xl transition-all duration-200 shadow-sm ${
              item.visible ? "border-gray-200" : "border-gray-100 opacity-60"
            } ${editingKey === item.key ? "border-[#5C2E3A]/30 shadow-[#5C2E3A]/10" : ""}`}
          >
            {/* Item Row */}
            <div className="flex items-center gap-3 p-4">
              {/* Order Buttons */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveItem(item.key, "up")} disabled={idx === 0}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors">
                  <FaArrowUp className="w-2.5 h-2.5" />
                </button>
                <button onClick={() => moveItem(item.key, "down")} disabled={idx === sorted.length - 1}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors">
                  <FaArrowDown className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.visible ? "bg-[#5C2E3A]/10 text-[#5C2E3A]" : "bg-gray-100 text-gray-400"
              }`}>
                <IconPreview name={item.icon} />
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 text-sm">{item.labelEn}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-gray-500 text-sm" dir="rtl">{item.labelAr}</span>
                </div>
                <p className="text-gray-400 text-xs mt-0.5 font-mono">{item.href}</p>
              </div>

              {/* Order badge */}
              <span className="text-[10px] font-black text-gray-500 bg-gray-100 w-7 h-7 rounded-lg flex items-center justify-center">
                {idx + 1}
              </span>

              {/* Visibility toggle */}
              <button
                onClick={() => updateItem(item.key, { visible: !item.visible })}
                title={item.visible ? "Hide from navbar" : "Show in navbar"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  item.visible
                    ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100"
                    : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100"
                }`}
              >
                {item.visible ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
                {item.visible ? "Visible" : "Hidden"}
              </button>

              {/* Edit toggle */}
              <button
                onClick={() => setEditingKey(editingKey === item.key ? null : item.key)}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                  editingKey === item.key
                    ? "bg-[#5C2E3A] text-white"
                    : "bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Edit Panel */}
            {editingKey === item.key && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Label (English)</label>
                  <input value={item.labelEn} onChange={e => updateItem(item.key, { labelEn: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Label (Arabic)</label>
                  <input value={item.labelAr} onChange={e => updateItem(item.key, { labelAr: e.target.value })} dir="rtl"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Link (href)</label>
                  <input value={item.href} onChange={e => updateItem(item.key, { href: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm font-mono focus:outline-none focus:border-[#5C2E3A]/60" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Icon</label>
                  <select value={item.icon} onChange={e => updateItem(item.key, { icon: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60">
                    {ICON_OPTIONS.map(ic => (
                      <option key={ic} value={ic}>{ic.replace("Fa", "")}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info tip */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-[#5C2E3A]/10 border border-[#5C2E3A]/20 rounded-2xl">
        <span className="text-[#5C2E3A] text-lg flex-shrink-0">💡</span>
        <div>
          <p className="text-sm font-bold text-[#5C2E3A]">How it works</p>
          <p className="text-xs text-[#5C2E3A] mt-1 leading-relaxed">
            Changes save to your browser storage and apply immediately after reload.
            Use <strong>↑↓</strong> to reorder, the eye button to show/hide links, and the edit button to rename or change links.
          </p>
        </div>
      </div>
    </>
  );
}
