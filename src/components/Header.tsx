"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";
import {
  FaHome, FaShoppingBag, FaGift, FaStar, FaHeart,
  FaShoppingCart, FaUser, FaBox, FaTag, FaUsers, FaBell,
  FaPhone, FaEnvelope, FaInfo, FaCog, FaStore, FaBars, FaTimes
} from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import Link from "next/link";
import Image from "next/image";
import { loadNavItems, NavItem, DEFAULT_NAV_ITEMS } from "@/lib/navbarConfig";
import { useLanguage } from "./LanguageProvider";

// Icon map for dynamic icons
const ICON_MAP: Record<string, React.ElementType> = {
  FaHome, FaShoppingBag, FaGift, FaStar, FaHeart,
  FaShoppingCart, FaBox, FaTag, FaUsers, FaBell,
  FaPhone, FaEnvelope, FaInfo, FaCog, FaStore
};

const NavIcon = React.memo(({ name }: { name: string }) => {
  const Icon = ICON_MAP[name] || FaBars;
  return <Icon />;
});
NavIcon.displayName = "NavIcon";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const isAr = isArabic;

  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load from localStorage (dynamic config from admin dashboard)
  useEffect(() => {
    setNavItems(loadNavItems());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "admin_navbar_config") setNavItems(loadNavItems());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const visibleItems = useMemo(() => navItems.filter(i => i.visible), [navItems]);

  const toggleMobileMenu = useCallback(() => setMobileOpen(prev => !prev), []);

  return (
    <nav className="relative z-50 w-full bg-[#5a1832] border-b border-white/10 shadow-lg flex-shrink-0" role="navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105 active:scale-95" aria-label={t('header.home')}>
          <Image
            src="/watani-logo.png"
            alt={t('seo.siteName')}
            width={120}
            height={60}
            className="h-12 md:h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.key === "cart" && pathname === "/cart");
            const label = item.labelKey ? t(item.labelKey) : (isAr ? item.labelAr : item.labelEn);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-[16px] font-semibold text-white tracking-wide transition-all duration-300 group
                  hover:bg-white/5 hover:opacity-95
                  ${isActive ? "bg-white/10" : "opacity-80 hover:opacity-100"}
                `}
              >
                <span className={`text-xl transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <NavIcon name={item.icon} />
                </span>
                <span>{label}</span>

                {item.showBadge && cartCount > 0 && (
                  <span className={`absolute -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37] text-[13px] font-bold text-white shadow-lg border border-white/20 animate-in zoom-in duration-300 ${isAr ? '-left-1.5' : '-right-1.5'}`}>
                    {cartCount}
                  </span>
                )}

                {/* Active underline */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full" 
                       style={{ background: 'linear-gradient(90deg, #D4AF37, #E8C547)', boxShadow: '0 0 12px rgba(212, 175, 55, 0.4)' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* User Dropdown */}
          <div ref={userMenuRef} className="relative group">
            <button 
              className="w-11 h-11 bg-white/5 rounded-lg flex items-center justify-center text-white opacity-90 hover:opacity-100 hover:bg-white/10 transition-all duration-300 border border-white/5"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              <FaUser className="text-lg" />
            </button>
            <div
              className={`absolute right-0 top-full mt-3 w-56 bg-[#5C2E3A] rounded-2xl shadow-2xl py-3 transition-all duration-300 z-[100] border border-white/10 overflow-hidden
                ${userMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}
                group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
              `}
            >
              {isAuthenticated ? (
                <>
                  <div className="px-6 py-4 border-b border-white/5 bg-black/10">
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">{t('header.signedInAs')}</p>
                    <p className="text-[16px] font-bold text-white truncate">{user?.name}</p>
                  </div>
                  <div className="py-2">
                    {user?.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-3 px-6 py-3 text-[15px] font-bold text-white hover:bg-white/5 transition-colors">
                        <FaCog className="text-[#D4AF37]" /> {t('header.adminDashboard')}
                      </Link>
                    )}
                    <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-3 text-[15px] font-bold text-red-400 hover:bg-white/5 transition-colors">
                      <FaTimes className="opacity-70" /> {t('header.logout')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <Link href="/login" className="block px-6 py-3 text-[15px] font-bold text-white hover:bg-white/5 transition-colors">{t('header.login')}</Link>
                  <Link href="/register" className="block px-6 py-3 text-[15px] font-bold text-white hover:bg-white/5 transition-colors">{t('header.register')}</Link>
                </div>
              )}
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Mobile Hamburger */}
          <button
            aria-label={mobileOpen ? t('header.closeMenu') : t('header.openMenu')}
            onClick={toggleMobileMenu}
            className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-lg text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 active:scale-90"
          >
            {mobileOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300" onClick={toggleMobileMenu}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className={`absolute top-0 bottom-0 w-80 max-w-[85%] ${isAr ? 'left-0' : 'right-0'} bg-[#5a1832] px-8 py-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-2xl border-l border-white/10 animate-in slide-in-from-${isAr ? 'left' : 'right'} duration-500`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-10">
              <Image src="/watani-logo.png" alt={t('seo.siteName')} width={100} height={50} className="h-10 w-auto object-contain" />
              <button onClick={toggleMobileMenu} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 active:scale-90 transition-all">
                <FaTimes size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                const label = item.labelKey ? t(item.labelKey) : (isAr ? item.labelAr : item.labelEn);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10 text-[#D4AF37]' : 'text-white/90 hover:bg-white/5'}`}
                  >
                    <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                      <NavIcon name={item.icon} />
                    </span>
                    <span className="text-[17px] font-bold tracking-tight">{label}</span>
                    {item.showBadge && cartCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-[#D4AF37] text-[11px] font-black text-white px-2.5 py-1 min-w-[24px]">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-10 border-t border-white/10">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-white/50 font-black uppercase tracking-widest mb-1">{t('header.signedInAs')}</p>
                    <p className="text-[20px] font-bold text-white truncate">{user?.name}</p>
                  </div>
                  <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[17px] font-black transition-all active:scale-[0.98]">
                    <FaTimes className="opacity-70" /> {t('header.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={toggleMobileMenu} className="w-full text-center py-4 rounded-2xl bg-white/5 border border-white/10 text-[17px] font-bold">{t('header.login')}</Link>
                  <Link href="/register" onClick={toggleMobileMenu} className="w-full text-center py-4 rounded-2xl bg-[#D4AF37] text-[#5a1832] text-[17px] font-black shadow-lg shadow-[#D4AF37]/20">{t('header.register')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
