"use client";

import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";
import {
  FaHome, FaShoppingBag, FaGift, FaStar, FaHeart,
  FaShoppingCart, FaUser, FaBox, FaTag, FaUsers, FaBell,
  FaPhone, FaEnvelope, FaInfo, FaCog, FaStore, FaBars
} from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadNavItems, NavItem, DEFAULT_NAV_ITEMS } from "@/lib/navbarConfig";

// Icon map
const ICON_MAP: Record<string, React.ElementType> = {
  FaHome, FaShoppingBag, FaGift, FaStar, FaHeart,
  FaShoppingCart, FaBox, FaTag, FaUsers, FaBell,
  FaPhone, FaEnvelope, FaInfo, FaCog, FaStore
};

function NavIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] || FaBars;
  return <Icon />;
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);

  // Load from localStorage (dynamic config from admin dashboard)
  useEffect(() => {
    setNavItems(loadNavItems());
    // Also listen for storage changes (if admin saves in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admin_navbar_config") setNavItems(loadNavItems());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const visibleItems = navItems.filter(i => i.visible);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1a3a3a] border-b border-white/5 shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-[#e6c35f] to-[#b89b4d]">
              <span className="text-2xl font-bold text-[#1a3a3a]">{isAr ? "و" : "W"}</span>
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {isAr ? "وطني" : "Watani"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.key === "cart" && pathname === "/cart");
            const label = isAr ? item.labelAr : item.labelEn;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[15px] font-bold transition-all duration-300 group
                  hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]
                  ${isActive ? "text-[#e6c35f]" : "text-white/70"}
                `}
              >
                <span className={`text-xl transition-colors duration-300 ${
                  isActive ? "text-[#e6c35f]" : "text-white/40 group-hover:text-white"
                }`}>
                  <NavIcon name={item.icon} />
                </span>
                <span>{label}</span>

                {/* Cart badge */}
                {item.showBadge && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e6c35f] text-[10px] font-bold text-[#1a3a3a]">
                    {cartCount}
                  </span>
                )}

                {/* Active underline */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-[#e6c35f] rounded-full shadow-[0_0_10px_#e6c35f] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* User Dropdown */}
          <div className="relative group">
            <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-inner">
              <FaUser className="text-lg" />
            </button>
            <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] border border-gray-100">
              {isAuthenticated ? (
                <>
                  <div className="px-5 py-3 border-b border-gray-50 mb-2">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                      {isAr ? "مسجل دخول كـ" : "Signed in as"}
                    </p>
                    <p className="text-base font-bold text-[#1a3a3a] truncate">{user?.name}</p>
                  </div>
                  {/* Admin link if admin */}
                  {user?.role === "admin" && (
                    <Link href="/admin" className="block px-5 py-2.5 text-sm font-bold text-[#c5a059] hover:bg-[#c5a059]/5 transition-colors">
                      🛡️ {isAr ? "لوحة التحكم" : "Admin Dashboard"}
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    {isAr ? "تسجيل الخروج" : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-5 py-3 text-sm font-bold text-[#1a3a3a] hover:bg-gray-50 transition-colors">
                    {isAr ? "تسجيل الدخول" : "Login"}
                  </Link>
                  <Link href="/register" className="block px-5 py-3 text-sm font-bold text-[#1a3a3a] hover:bg-gray-50 transition-colors">
                    {isAr ? "إنشاء حساب" : "Register"}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="scale-110">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden flex items-center justify-around border-t border-white/5 bg-black/10 px-2 py-3 backdrop-blur-sm">
        {visibleItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const label = isAr ? item.labelAr : item.labelEn;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? "text-[#e6c35f]" : "text-white/50"
              }`}
            >
              <span className="text-xl"><NavIcon name={item.icon} /></span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
