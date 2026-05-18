import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";
import { Metadata } from "next";
import { getSeoLanguage, getSeoText } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoText(getSeoLanguage());

  return {
    title: seo.registerTitle,
    description: seo.homeDescription,
  };
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
