"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaTags,
  FaStar, FaTimes, FaLayerGroup, FaImages, FaGlobe,
  FaConciergeBell, FaBars, FaStore,
  FaLanguage, FaChevronDown, FaChevronRight, FaGift
} from "react-icons/fa";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ElementType } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuGroups: Array<{
  labelKey: string;
  items: Array<{
    nameKey: string;
    href: string;
    icon: ElementType;
    exact?: boolean;
  }>;
}> = [
  {
    labelKey: "admin.sidebar.overview",
    items: [
      { nameKey: "admin.sidebar.dashboard", href: "/admin", icon: FaTachometerAlt, exact: true },
    ]
  },
  {
    labelKey: "admin.sidebar.catalog",
    items: [
      { nameKey: "admin.sidebar.products", href: "/admin/products", icon: FaBox },
      { nameKey: "admin.sidebar.bestSellers", href: "/admin/recommended", icon: FaStar },
      { nameKey: "admin.sidebar.categories", href: "/admin/categories", icon: FaTags },
      { nameKey: "admin.sidebar.subcategories", href: "/admin/subcategories", icon: FaLayerGroup },
      { nameKey: "admin.sidebar.gifts", href: "/admin/gifts", icon: FaGift },
    ]
  },
  {
    labelKey: "admin.sidebar.commerce",
    items: [
      { nameKey: "admin.sidebar.orders", href: "/admin/orders", icon: FaShoppingBag },
      { nameKey: "admin.sidebar.users", href: "/admin/users", icon: FaUsers },
      { nameKey: "admin.sidebar.reviews", href: "/admin/reviews", icon: FaStar },
    ]
  },
  {
    labelKey: "admin.sidebar.content",
    items: [
      { nameKey: "admin.sidebar.banners", href: "/admin/banners", icon: FaImages },
      { nameKey: "admin.sidebar.services", href: "/admin/services", icon: FaConciergeBell },
    ]
  },
  {
    labelKey: "admin.sidebar.settings",
    items: [
      { nameKey: "admin.sidebar.navbar", href: "/admin/navbar", icon: FaBars },
      { nameKey: "admin.sidebar.translations", href: "/admin/translations", icon: FaLanguage },
      { nameKey: "admin.sidebar.siteSettings", href: "/admin/footer", icon: FaGlobe },
    ]
  },

];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setCollapsed(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:h-screen lg:sticky lg:top-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 flex-shrink-0 flex flex-col
          bg-[#0f1623] border-r border-white/5
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#c5a059] to-[#e6c35f] rounded-xl flex items-center justify-center shadow-lg">
              <FaStore className="text-[#0f1623] text-sm" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight">Alnaseej</p>
              <p className="text-[#c5a059] text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
          <button onClick={onToggle} className="lg:hidden text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {menuGroups.map((group) => {
            const isCollapsed = collapsed.includes(group.labelKey);

            return (
              <div key={group.labelKey} className="mb-1">
                {/* Group Label */}
                <button
                  onClick={() => toggleGroup(group.labelKey)}
                  className="w-full flex items-center justify-between px-3 py-2 mb-1 group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                    {t(group.labelKey)}
                  </span>
                  {isCollapsed
                    ? <FaChevronRight className="text-gray-600 text-[9px]" />
                    : <FaChevronDown className="text-gray-600 text-[9px]" />
                  }
                </button>

                {/* Group Items */}
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href, item.exact);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.nameKey}
                          href={item.href}
                          onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                            ${active
                              ? "bg-gradient-to-r from-[#c5a059]/20 to-transparent text-[#c5a059] border border-[#c5a059]/20"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                            }
                          `}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#c5a059]" : ""}`} />
                          <span>{t(item.nameKey)}</span>
                          {active && <div className="ml-auto w-1.5 h-1.5 bg-[#c5a059] rounded-full" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <FaStore className="w-4 h-4" />
            <span>{t('admin.viewStore')}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
