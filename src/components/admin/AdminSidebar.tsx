"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaTags,
  FaStar, FaTimes, FaLayerGroup, FaImages, FaGlobe,
  FaConciergeBell, FaBars, FaStore,
  FaLanguage, FaChevronDown, FaChevronRight, FaGift, FaTicketAlt, FaCrown
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
      { nameKey: "admin.sidebar.brands", href: "/admin/brands", icon: FaCrown },
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
      { nameKey: "admin.sidebar.coupons", href: "/admin/coupons", icon: FaTicketAlt },
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
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
          bg-white border-r border-gray-200 shadow-sm
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#5C2E3A] rounded-xl flex items-center justify-center shadow-sm">
              <FaStore className="text-white text-sm" />
            </div>
            <div>
              <p className="text-[#5C2E3A] text-[10px] font-bold uppercase tracking-widest">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div role="navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuGroups.map((group) => {
            const isCollapsed = collapsed.includes(group.labelKey);

            return (
              <div key={group.labelKey} className="mb-1">
                {/* Group Label */}
                <button
                  onClick={() => toggleGroup(group.labelKey)}
                  className="w-full flex items-center justify-between px-3 py-2 mb-1 group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#747373] group-hover:text-gray-700 transition-colors">
                    {t(group.labelKey)}
                  </span>
                  {isCollapsed
                    ? <FaChevronRight className="text-gray-300 text-[9px]" />
                    : <FaChevronDown className="text-gray-300 text-[9px]" />
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
                              ? "bg-[#5C2E3A]/10 text-[#5C2E3A] border border-[#5C2E3A]/20"
                              : "text-[#747373] hover:text-gray-900 hover:bg-gray-100"
                            }
                          `}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#5C2E3A]" : ""}`} />
                          <span>{t(item.nameKey)}</span>
                          {active && <div className="ml-auto w-1.5 h-1.5 bg-[#5C2E3A] rounded-full" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <FaStore className="w-4 h-4" />
            <span>{t('admin.viewStore')}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
