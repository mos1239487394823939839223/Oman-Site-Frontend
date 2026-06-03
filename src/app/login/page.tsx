import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { Metadata } from "next";
import { getSeoLanguage, getSeoText } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoText(await getSeoLanguage());

  return {
    title: seo.loginTitle,
    description: seo.homeDescription,
  };
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
