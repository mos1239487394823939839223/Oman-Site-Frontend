"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTachometerAlt, FaBox, FaShoppingBag, FaUsers, FaTags,
  FaStar, FaTimes, FaLayerGroup, FaImages, FaGlobe,
  FaPhoneAlt, FaConciergeBell, FaBars, FaStore, FaQuoteLeft,
  FaLanguage, FaChevronDown, FaChevronRight
} from "react-icons/fa";
import { useState } from "react";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: FaTachometerAlt, exact: true },
    ]
  },
  {
    label: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: FaBox },
      { name: "Categories", href: "/admin/categories", icon: FaTags },
      { name: "Subcategories", href: "/admin/subcategories", icon: FaLayerGroup },
      { name: "Brands", href: "/admin/brands", icon: FaStar },
    ]
  },
  {
    label: "Commerce",
    items: [
      { name: "Orders", href: "/admin/orders", icon: FaShoppingBag },
      { name: "Users", href: "/admin/users", icon: FaUsers },
    ]
  },
  {
    label: "Content",
    items: [
      { name: "Banners & Sliders", href: "/admin/banners", icon: FaImages },
      { name: "Services", href: "/admin/services", icon: FaConciergeBell },
      { name: "Testimonials", href: "/admin/testimonials", icon: FaQuoteLeft },
      { name: "Contact Info", href: "/admin/contact", icon: FaPhoneAlt },
    ]
  },
  {
    label: "Settings",
    items: [
      { name: "Navbar Manager", href: "/admin/navbar", icon: FaBars },
      { name: "Translations", href: "/admin/translations", icon: FaLanguage },
      { name: "Site Settings", href: "/admin/settings", icon: FaGlobe },
    ]
  },

];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
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
              <p className="text-white font-black text-sm tracking-tight">النزيج</p>
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
            const isCollapsed = collapsed.includes(group.label);
            const hasActiveItem = group.items.some(item => isActive(item.href, (item as any).exact));

            return (
              <div key={group.label} className="mb-1">
                {/* Group Label */}
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 mb-1 group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                    {group.label}
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
                      const active = isActive(item.href, (item as any).exact);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
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
                          <span>{item.name}</span>
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
            <span>View Live Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
