"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Heart from "./Heart";
import { FaShoppingCart, FaStar } from "react-icons/fa";
import { Product } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [imgSrc, setImgSrc] = useState(resolveMediaUrl(product.imageCover, "products"));

  const handleViewDetails = () => {
    router.push(`/products/${product._id}`);
  };

  const hasDiscount =
    product.priceAfterDiscount !== undefined &&
    product.priceAfterDiscount > 0 &&
    product.priceAfterDiscount < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.priceAfterDiscount || 0)) / product.price) * 100)
    : 0;

  const displayPrice = hasDiscount ? product.priceAfterDiscount : product.price;

  return (
    <div
      onClick={handleViewDetails}
      className="group flex flex-col min-h-[360px] sm:min-h-[420px] bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:border-[#5a1832]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-sm"
    >
      {/* Image Section */}
      <div className="relative w-full bg-gray-100 aspect-[4/3]">
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          onError={() => setImgSrc("/placeholder.svg")}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full z-10 shadow-lg">
            {discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <Heart
            productId={product._id}
            className="w-11 h-11 bg-[#1a1f2e]/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10"
            size="sm"
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand Label */}
        <p className="text-[11px] font-bold text-[#5a1832] uppercase tracking-widest">
          {product.category?.name || t('seo.siteName')}
        </p>

        {/* Title - Fixed height to keep alignment */}
        <div className="h-[40px]">
          <h3 className="text-gray-900 font-black text-sm leading-tight line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* Rating - Placeholder if missing to keep height */}
        <div className="h-[20px] flex items-center">
          {product.ratingsAverage > 0 ? (
            <div className="flex items-center gap-1.5">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-gray-500 text-[10px] font-semibold">
                ({product.ratingsQuantity || 0})
              </span>
            </div>
          ) : (
            <div className="h-4" /> // Invisible placeholder
          )}
        </div>

        {/* Price Row - Fixed height */}
        <div className="h-[30px] flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-[#5a1832] font-black text-base">
              {displayPrice?.toLocaleString()}
            </span>
            <span className="text-gray-600 text-[10px] font-bold">ر.ع</span>
            {hasDiscount && (
              <span className="text-gray-400 text-[10px] line-through font-medium">
                {product.price?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="w-full bg-[#5a1832] hover:bg-[#4A2330] text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 text-xs shadow-md"
          >
            <FaShoppingCart className="text-xs" />
            {t('common.viewDetails')}
          </button>
        </div>
      </div>
    </div>
  );
}
