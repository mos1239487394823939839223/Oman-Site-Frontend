import { Suspense } from "react";
import HomePageContent from "@/components/HomePageContent";
import { Metadata } from "next";
import { getSeoLanguage, getSeoText } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoText(await getSeoLanguage());

  return {
    title: seo.homeTitle,
    description: seo.homeDescription,
    openGraph: {
      title: seo.homeTitle,
      description: seo.homeDescription,
      images: ["/logo.png"],
    },
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#D4AF37] mx-auto mb-6"></div>
          <h2 className="text-2xl font-black text-white mb-2">جاري التحميل...</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">يرجى الانتظار</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
