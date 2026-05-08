"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="w-12 h-12 flex items-center justify-center bg-white/[0.07] hover:bg-[#c5a059] border border-white/10 rounded-xl transition-all duration-300 font-bold text-lg text-white"
      aria-label="Toggle Language"
    >
      {i18n.language === 'en' ? 'ع' : 'EN'}
    </button>
  );
}
