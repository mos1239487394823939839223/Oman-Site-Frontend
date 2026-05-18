import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getSeoText, getSeoLanguage } from "@/lib/seo";

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
  const language = getSeoLanguage();
  const seo = getSeoText(language);

  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
  };
}

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const language = cookies().get("app_language")?.value === "en" ? "en" : "ar";
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <html lang={language} dir={dir}>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased overflow-hidden`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto custom-scrollbar-container">
              <main className="min-h-[calc(100vh-80px)] bg-gray-50">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

