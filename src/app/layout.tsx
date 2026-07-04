import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies, headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import { getSeoText, getSeoLanguage } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// `viewport-fit=cover` is what makes env(safe-area-inset-*) resolve to real
// values on notched/rounded devices — without it every safe-area token in the
// app (Header drawer, body padding-bottom, bottom bars) silently reads as 0.
// initialScale/width keep the layout at device width; we intentionally allow
// user zoom (accessibility — never set maximumScale=1 / user-scalable=no).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#5a1832",
};

// Weights trimmed to those actually used in the app (400/500/600/700/800/900).
// The unused "300" (light) was dropped from both families/subsets to cut
// render-blocking font payload. display:swap avoids invisible text on mobile.
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const language = await getSeoLanguage();
  const seo = getSeoText(language);

  return {
    metadataBase: new URL(siteUrl),
    title: seo.homeTitle,
    description: seo.homeDescription,
  };
}

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const language = cookieStore.get("app_language")?.value === "en" ? "en" : "ar";
  const dir = language === "ar" ? "rtl" : "ltr";

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang={language} dir={dir}>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Providers initialLanguage={language}>
          {isAdmin ? (
            children
          ) : (
            <div className="flex min-h-[100dvh] flex-col">
              <Header />
              <main className="flex-1 bg-gray-50">
                {children}
              </main>
              <Footer />
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}

