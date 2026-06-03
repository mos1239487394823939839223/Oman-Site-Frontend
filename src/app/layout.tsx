import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getSeoText, getSeoLanguage } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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

  return (
    <html lang={language} dir={dir}>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex min-h-[100dvh] flex-col">
            <Header />
            <main className="flex-1 bg-gray-50">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

