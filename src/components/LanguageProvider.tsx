"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

export type AppLanguage = "ar" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  dir: "rtl" | "ltr";
  isArabic: boolean;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
};

const LANGUAGE_STORAGE_KEY = "app_language";
const SUPPORTED_LANGUAGES: AppLanguage[] = ["ar", "en"];

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getDocumentLanguage(): AppLanguage {
  if (typeof document === "undefined") return "ar";
  const htmlLang = document.documentElement.lang?.toLowerCase();
  return htmlLang === "en" ? "en" : "ar";
}

function persistLanguage(language: AppLanguage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.cookie = `app_language=${language}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

function readInitialLanguage(fallback: AppLanguage = "ar"): AppLanguage {
  if (typeof window === "undefined") return fallback;

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;

  const htmlLang = document.documentElement.lang?.toLowerCase();
  if (htmlLang === "ar" || htmlLang === "en") return htmlLang;

  return fallback;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<AppLanguage>(() => readInitialLanguage());

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
    persistLanguage(language);
  }, [language, i18n]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    dir: language === "ar" ? "rtl" : "ltr",
    isArabic: language === "ar",
    setLanguage: (nextLanguage: AppLanguage) => setLanguageState(nextLanguage),
    toggleLanguage: () => setLanguageState((current) => (current === "ar" ? "en" : "ar")),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}