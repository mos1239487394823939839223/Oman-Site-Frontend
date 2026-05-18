"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProduct, getProducts, Product } from "@/services/clientApi";
import { FaStar, FaShoppingCart, FaArrowRight, FaPlus, FaMinus, FaHeart } from "react-icons/fa";
import Heart from "@/components/Heart";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import ProductCard from "@/components/ProductCard.tsx";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";

interface ProductDetailContentProps {
  productId: string;
}

export default function ProductDetailContent({ productId }: ProductDetailContentProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { dir } = useLanguage();

  const fetchProductData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const result = await getProduct(productId);
      const productData = result.data;
      setProduct(productData);

      // Fetch related products
      const categoryId = typeof productData.category === 'object' ? productData.category?._id : productData.category;
      if (categoryId) {
        setRelatedLoading(true);
        try {
          const relatedRes = await getProducts();
          const all: Product[] = relatedRes.data || [];
          const similar = all
            .filter((p: any) => p._id !== productData._id)
            .filter((p: any) => (typeof p.category === 'object' ? p.category?._id : p.category) === categoryId)
            .slice(0, 4);
          setRelatedProducts(similar);
        } catch (e) {
          console.error("Error fetching related:", e);
        } finally {
          setRelatedLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase' && quantity < (product?.quantity || 1)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product._id, quantity);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-[#5a1832] text-white px-8 py-4 rounded-2xl shadow-2xl z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-4 font-black';
      notification.textContent = t('product.addToCartSuccess');
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-100 aspect-square rounded-[3rem]"></div>
          <div className="space-y-6 pt-8">
            <div className="h-10 bg-gray-100 rounded-full w-3/4"></div>
            <div className="h-6 bg-gray-100 rounded-full w-1/2"></div>
            <div className="h-32 bg-gray-100 rounded-[2rem]"></div>
            <div className="h-16 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const allImages = [product.imageCover, ...(product.images || [])];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" dir={dir}>
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-3 text-[#5a1832] font-black mb-10 hover:gap-5 transition-all group"
      >
        <FaArrowRight className="text-sm group-hover:scale-110" /> {t('product.backToShopping')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Gallery Section */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 group">
            <Image
              src={allImages[selectedImage]}
              alt={product.title}
              fill
              className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute top-8 left-8">
              <Heart productId={product._id} size="lg" />
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-24 h-24 flex-shrink-0 bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? "border-[#D4AF37] shadow-lg scale-105" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`Slide ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-10 pt-4">
          <div className="space-y-4">
            <p className="text-[#D4AF37] font-black tracking-widest uppercase text-xs">
              {typeof product.category === 'object' ? product.category?.name : t('seo.siteName')}
            </p>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tighter">
              {product.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(product.ratingsAverage) ? "fill-current" : "text-gray-200"} />
                ))}
              </div>
              <span className="text-gray-400 font-bold text-sm">({product.ratingsQuantity || 0} {t('product.reviews')})</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-black text-[#5a1832]">
              {(product.priceAfterDiscount || product.price).toLocaleString()}
            </span>
            <span className="text-xl font-bold text-gray-400">ر.ع</span>
            {product.priceAfterDiscount && (
              <span className="text-xl text-gray-300 line-through font-bold">
                {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">{t('product.aboutProduct')}</h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="font-black text-gray-900">{t('product.quantity')}</span>
              <span className="text-xs font-bold text-gray-400">{t('product.availableStock')}: {product.quantity}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center bg-gray-100 rounded-2xl p-2 h-16 sm:w-48 justify-between border border-gray-200">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  disabled={quantity <= 1}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-[#5a1832] disabled:opacity-20 transition-all"
                >
                  <FaMinus />
                </button>
                <span className="text-xl font-black text-gray-900">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  disabled={quantity >= (product.quantity || 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-[#5a1832] disabled:opacity-20 transition-all"
                >
                  <FaPlus />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.quantity || isAddingToCart}
                className="flex-1 h-16 bg-[#5a1832] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all active:scale-95 shadow-xl shadow-[#5a1832]/20 disabled:bg-gray-300"
              >
                <FaShoppingCart />
                {isAddingToCart ? t('common.loading') : t('common.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {!relatedLoading && relatedProducts.length > 0 && (
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">منتجات قد تعجبك</h2>
            <div className="w-20 h-1.5 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
