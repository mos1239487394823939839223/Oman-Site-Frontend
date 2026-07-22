"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getProduct, getProducts, getGift, getProductReviews, createReview, updateReview, deleteReview, Product } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import { FaStar, FaShoppingCart, FaArrowRight, FaPlus, FaMinus, FaHeart, FaUserCircle, FaTrash, FaEdit } from "react-icons/fa";
import Heart from "@/components/Heart";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import ProductCard from "@/components/ProductCard";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useCurrency } from "@/components/CurrencyProvider";
import { priceForCurrency } from "@/lib/currency";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";

interface ReviewData {
  _id: string;
  user: { _id: string; name: string } | string;
  rating: number;
  title?: string;
  createdAt: string;
}

interface ProductDetailContentProps {
  productId: string;
  isGift?: boolean;
}

export default function ProductDetailContent({ productId, isGift = false }: ProductDetailContentProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [isGiftItem, setIsGiftItem] = useState(isGift);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const { dir, isArabic } = useLanguage();
  const { currency, format } = useCurrency();

  const fetchProductData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      let result;
      let loadedAsGift = isGift;
      if (isGift) {
        result = await getGift(productId);
      } else {
        try {
          result = await getProduct(productId);
          loadedAsGift = false;
        } catch {
          result = await getGift(productId);
          loadedAsGift = true;
        }
      }
      setIsGiftItem(loadedAsGift);
      const productData = result.data;
      const mediaFolder = loadedAsGift ? "gifts" : "products";
      setProduct({
        ...productData,
        imageCover: resolveMediaUrl(productData.imageCover, mediaFolder),
        images: (productData.images || []).map((img: string) =>
          resolveMediaUrl(img, mediaFolder)
        ),
      });

      // Fetch related products (gifts skip related list)
      const categoryId = typeof productData.category === 'object' ? productData.category?._id : productData.category;
      if (categoryId && !loadedAsGift) {
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
  }, [productId, isGift]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const fetchReviews = useCallback(async () => {
    if (!productId || isGiftItem) return;
    setReviewsLoading(true);
    try {
      const res = await getProductReviews(productId);
      setReviews(res.data || []);
    } catch {
      // silently ignore — reviews are non-critical
    } finally {
      setReviewsLoading(false);
    }
  }, [productId, isGiftItem]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!newComment.trim()) { setReviewError(isArabic ? "يرجى كتابة تقييم" : "Please write a review"); return; }
    setReviewError("");
    setReviewSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { setReviewError(isArabic ? "سجّل دخولك لإضافة تقييم" : "Log in to write a review"); return; }
      if (editingReview) {
        await updateReview(editingReview._id, { rating: newRating, title: newComment }, token);
      } else {
        await createReview(productId, { rating: newRating, title: newComment }, token);
      }
      setShowReviewForm(false);
      setEditingReview(null);
      setNewRating(5); setNewComment("");
      await fetchReviews();
    } catch (e: any) {
      setReviewError(e.message || t("common.retry"));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await deleteReview(reviewId, token);
      await fetchReviews();
    } catch {}
  };

  const openEdit = (review: ReviewData) => {
    setEditingReview(review);
    setNewRating(review.rating);
    setNewComment(review.title || "");
    setShowReviewForm(true);
  };

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
      const redirectPath = isGiftItem ? `/gifts/${productId}` : `/products/${productId}`;
      router.push(`/login?redirect=${redirectPath}`);
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product._id, quantity, undefined, { isGift: isGiftItem });
      
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
              sizes="(max-width: 1024px) 100vw, 50vw"
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
                  <Image src={img} alt={`Slide ${i}`} fill sizes="96px" className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            {(() => {
              const { amount, amountAfterDiscount } = priceForCurrency(product, currency);
              const discounted =
                amountAfterDiscount !== undefined && amountAfterDiscount < amount;
              return (
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-[#5a1832]">
                    {format(discounted ? amountAfterDiscount : amount)}
                  </span>
                  {discounted && (
                    <span className="text-xl text-gray-300 line-through font-bold">
                      {format(amount)}
                    </span>
                  )}
                </div>
              );
            })()}
            {!isGift && <CurrencySwitcher />}
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

      {/* ── Reviews Section ── */}
      {!isGiftItem && (
        <section className="mt-24" dir={dir}>
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                {isArabic ? "آراء العملاء" : "Customer Reviews"}
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5 text-[#D4AF37]">
                    {[1,2,3,4,5].map(s => (
                      <FaStar key={s} size={14} className={s <= Math.round(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length) ? "fill-current" : "text-gray-200"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-500">
                    {(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1)} · {reviews.length} {isArabic ? "تقييم" : "reviews"}
                  </span>
                </div>
              )}
            </div>
            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => { setEditingReview(null); setNewRating(5); setNewComment(""); setReviewError(""); setShowReviewForm(true); }}
                className="flex items-center gap-2 bg-[#5a1832] text-white font-black px-5 py-3 rounded-2xl hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all text-sm shadow-lg shadow-[#5a1832]/20"
              >
                <FaEdit size={12} /> {isArabic ? "اكتب تقييماً" : "Write a Review"}
              </button>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => router.push(`/login?redirect=/products/${productId}`)}
                className="text-sm font-bold text-[#5a1832] underline underline-offset-2"
              >
                {isArabic ? "سجّل دخولك لإضافة تقييم" : "Log in to write a review"}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-8 mb-8">
              <h3 className="text-lg font-black text-gray-900 mb-6">
                {editingReview
                  ? (isArabic ? "تعديل تقييمك" : "Edit Your Review")
                  : (isArabic ? "اكتب تقييماً" : "Write a Review")}
              </h3>

              {/* Star picker */}
              <div className="mb-5">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  {isArabic ? "تقييمك" : "Your Rating"}
                </p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setNewRating(s)}
                      className={`text-3xl transition-transform hover:scale-110 ${s <= newRating ? "text-[#D4AF37]" : "text-gray-200"}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Review text */}
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={isArabic ? "شاركنا تجربتك مع هذا المنتج..." : "Share your experience with this product..."}
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-800 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all placeholder:text-gray-400 resize-none mb-4"
              />

              {reviewError && (
                <p className="text-red-500 text-sm font-bold mb-3">{reviewError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  className="flex-1 h-12 bg-[#5a1832] text-white rounded-xl font-black hover:bg-[#D4AF37] hover:text-[#5a1832] transition-all disabled:opacity-50"
                >
                  {reviewSubmitting
                    ? (isArabic ? "جاري الإرسال..." : "Submitting...")
                    : editingReview
                      ? (isArabic ? "تحديث التقييم" : "Update Review")
                      : (isArabic ? "إرسال التقييم" : "Submit Review")}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReviewForm(false); setEditingReview(null); setReviewError(""); }}
                  className="px-6 h-12 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#5a1832]/20 border-t-[#5a1832] rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <div className="text-5xl mb-4">⭐</div>
              <p className="text-gray-500 font-medium">
                {isArabic ? "لا توجد تقييمات بعد. كن أول من يشارك تجربته!" : "No reviews yet. Be the first to share your experience!"}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map(review => {
                const reviewUser = typeof review.user === "object" ? review.user : null;
                const isOwn = user && reviewUser && reviewUser._id === user._id;
                return (
                  <div key={review._id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5a1832]/10 flex items-center justify-center shrink-0">
                          <FaUserCircle className="text-[#5a1832] text-xl" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-sm">{reviewUser?.name || (isArabic ? "عملية شراء موثّقة" : "Verified Purchase")}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#D4AF37] shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <FaStar key={s} size={12} className={s <= review.rating ? "fill-current" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>

                    {review.title && (
                      <p className="text-gray-600 leading-relaxed font-medium mt-3">{review.title}</p>
                    )}

                    {isOwn && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button onClick={() => openEdit(review)}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#5a1832] hover:text-[#D4AF37] transition-colors">
                          <FaEdit size={10} /> {isArabic ? "تعديل" : "Edit"}
                        </button>
                        <span className="text-gray-200">|</span>
                        <button onClick={() => handleDeleteReview(review._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                          <FaTrash size={10} /> {isArabic ? "حذف" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

