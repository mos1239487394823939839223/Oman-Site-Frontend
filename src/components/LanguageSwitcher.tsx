"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './LanguageProvider';

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ar' : 'en';
    setLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-bold text-white transition-all duration-300 hover:bg-white/15 hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
      aria-label={t('common.language')}
    >
      <span className={`rounded-full px-2 py-1 text-xs transition-colors ${language === 'ar' ? 'bg-[#D4AF37] text-[#5a1832] shadow-sm' : 'bg-transparent text-white/70'}`}>{t('common.arabic')}</span>
      <span className={`rounded-full px-2 py-1 text-xs transition-colors ${language === 'en' ? 'bg-[#D4AF37] text-[#5a1832] shadow-sm' : 'bg-transparent text-white/70'}`}>{t('common.english')}</span>
    </button>
  );
}
