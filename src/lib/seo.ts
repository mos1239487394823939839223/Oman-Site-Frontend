import { cookies } from "next/headers";

export type SeoLanguage = "ar" | "en";

const SEO_TEXT = {
  ar: {
    siteName: "وطني",
    homeTitle: "وطني | متجر الزي العماني الفاخر",
    homeDescription: "اكتشف الزي العماني التقليدي وتجربة تسوق راقية.",
    productTitleSuffix: "وطني",
    productsTitle: "المنتجات | وطني",
    cartTitle: "السلة | وطني",
    wishlistTitle: "المفضلة | وطني",
    loginTitle: "تسجيل الدخول | وطني",
    registerTitle: "إنشاء حساب | وطني",
  },
  en: {
    siteName: "Watani",
    homeTitle: "Watani | Premium Omani Traditional Wear",
    homeDescription: "Discover premium Omani traditional wear and a polished shopping experience.",
    productTitleSuffix: "Watani",
    productsTitle: "Products | Watani",
    cartTitle: "Cart | Watani",
    wishlistTitle: "Wishlist | Watani",
    loginTitle: "Login | Watani",
    registerTitle: "Register | Watani",
  },
} as const;

export async function getSeoLanguage(): Promise<SeoLanguage> {
  const cookieStore = await cookies();
  const language = cookieStore.get("app_language")?.value;
  return language === "en" ? "en" : "ar";
}

export function getSeoText(language: SeoLanguage) {
  return SEO_TEXT[language];
}