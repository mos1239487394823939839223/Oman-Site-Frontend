import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../locales/en/common.json';
import arTranslation from '../locales/ar/common.json';

// On the client, initialize with the same `app_language` cookie the server read
// (see src/app/layout.tsx). This makes the first client render start on the
// correct language with NO render-time changeLanguage() call — which both
// prevents SSR hydration mismatches and avoids setState-in-render warnings from
// components subscribed to i18next. On the server document is undefined and
// LanguageProvider pins the per-request language during render instead.
function readCookieLanguage(): 'ar' | 'en' {
  if (typeof document === 'undefined') return 'ar';
  const match = document.cookie.match(/(?:^|;\s*)app_language=(ar|en)\b/);
  return (match?.[1] as 'ar' | 'en') || 'ar';
}

// NOTE: The active language is driven explicitly by LanguageProvider from the
// `app_language` cookie (see src/components/LanguageProvider.tsx). We do NOT use
// i18next-browser-languagedetector here: on the client it would auto-detect a
// language that can differ from the cookie value the server rendered with,
// causing SSR hydration mismatches. `lng` below is only the deterministic
// default before LanguageProvider syncs the real language.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enTranslation },
      ar: { common: arTranslation },
    },
    lng: readCookieLanguage(),
    fallbackLng: 'ar',
    defaultNS: 'common',
    fallbackNS: 'common',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
