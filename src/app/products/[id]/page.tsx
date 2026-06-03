import { Suspense } from "react";
import ProductDetailContent from "@/components/ProductDetailContent";
import { getProduct } from "@/services/clientApi";
import { Metadata } from "next";
import { getSeoLanguage, getSeoText } from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const language = await getSeoLanguage();
  const seo = getSeoText(language);
  try {
    const response = await getProduct(id);
    const product = response.data;
    
    return {
      title: `${product.title} | ${seo.siteName}`,
      description: product.description,
      openGraph: {
        title: product.title,
        description: product.description,
        images: [product.imageCover],
      },
    };
  } catch {
    return {
      title: seo.productsTitle,
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a1832]"></div>
      </div>
    }>
      <ProductDetailContent productId={id} />
    </Suspense>
  );
}