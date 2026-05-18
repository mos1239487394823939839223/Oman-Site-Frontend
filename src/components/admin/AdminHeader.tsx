"use client";

import { FaBars, FaBell, FaSearch, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useAuth } from "@/components/AuthProvider";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-[#0f1623]/95 backdrop-blur-xl border-b border-white/5 px-4 lg:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            <FaBars className="w-4 h-4" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2 w-72 focus-within:border-[#c5a059]/40 transition-colors">
            <FaSearch className="text-gray-500 text-sm flex-shrink-0" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          {/* Notifications */}
          <button className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <FaBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c5a059] rounded-full" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 bg-gradient-to-br from-[#c5a059] to-[#e6c35f] rounded-xl flex items-center justify-center shadow-lg">
              <FaUser className="text-[#0f1623] text-xs" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-xs font-bold leading-none">{user?.name || "Admin"}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{t('header.adminDashboard')}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all ml-1"
          >
            <FaSignOutAlt className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{t('header.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
