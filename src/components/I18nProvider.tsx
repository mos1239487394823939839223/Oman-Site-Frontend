"use client";

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update the HTML dir attribute whenever the language changes
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return <>{children}</>;
}
