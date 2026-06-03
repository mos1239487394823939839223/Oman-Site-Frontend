"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  FaChartBar,
  FaCommentDots,
  FaFilter,
  FaSearch,
  FaStar,
  FaUserCircle,
  FaBox,
} from "react-icons/fa";
import { getReviews } from "@/services/clientApi";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  user?: { _id: string; name: string } | string;
  product?: { _id: string; title: string } | string;
  createdAt: string;
}

const clampRating = (value: number) => Math.max(1, Math.min(5, value));

export default function ReviewsPage() {
  const { i18n } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const isArabic = (i18n.language || "ar").toLowerCase().startsWith("ar");
  const dir = isArabic ? "rtl" : "ltr";
  const languageClass = isArabic ? "font-[family-name:var(--font-cairo)]" : "font-[family-name:var(--font-inter)]";

  useEffect(() => {
    getReviews()
      .then((res) => setReviews(res?.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const userName = (r: Review) =>
    typeof r.user === "object" && r.user ? r.user.name : (isArabic ? "عميل" : "Customer");

  const productName = (r: Review) =>
    typeof r.product === "object" && r.product ? r.product.title : null;

  const productId = (r: Review) =>
    typeof r.product === "object" && r.product ? r.product._id : null;

  const stats = useMemo(() => {
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    return {
      total,
      average: average.toFixed(1),
      distribution: [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((r) => r.rating === stars).length;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return { stars, count, percent };
      }),
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let items = reviews.filter((r) => {
      const ratingMatch = filterRating === "all" || r.rating.toString() === filterRating;
      const searchMatch =
        q.length === 0 ||
        userName(r).toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (productName(r) || "").toLowerCase().includes(q);
      return ratingMatch && searchMatch;
    });
    if (sortBy === "highest") return [...items].sort((a, b) => b.rating - a.rating);
    if (sortBy === "lowest") return [...items].sort((a, b) => a.rating - b.rating);
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filterRating, reviews, searchQuery, sortBy, isArabic]);

  const text = {
    headerTitle: isArabic ? "كل التقييمات" : "All Reviews",
    headerSubtitle: isArabic
      ? "شاهد ما يقوله عملاؤنا عن منتجاتنا"
      : "See what our customers are saying about our products",
    statsTitle: isArabic ? "إحصائيات التقييمات" : "Review Statistics",
    averageRating: isArabic ? "متوسط التقييم" : "Average Rating",
    totalReviews: isArabic ? "إجمالي التقييمات" : "Total Reviews",
    distributionTitle: isArabic ? "توزيع التقييمات" : "Rating Distribution",
    filtersTitle: isArabic ? "الفرز والتصفية" : "Filters & Sorting",
    ratingFilter: isArabic ? "التقييم" : "Rating",
    sortByLabel: isArabic ? "الترتيب" : "Sort by",
    allRatings: isArabic ? "كل التقييمات" : "All Ratings",
    newest: isArabic ? "الأحدث" : "Newest",
    highestRated: isArabic ? "الأعلى تقييمًا" : "Highest Rated",
    lowestRated: isArabic ? "الأقل تقييمًا" : "Lowest Rated",
    noReviewsTitle: isArabic ? "لا توجد تقييمات بعد" : "No reviews yet",
    noReviewsSubtitle: isArabic
      ? "تصفح منتجاتنا واترك تقييمك من صفحة المنتج."
      : "Browse our products and leave a review from the product page.",
    browseProducts: isArabic ? "تصفح المنتجات" : "Browse Products",
  };

  return (
    <div dir={dir} className={`min-h-screen bg-[#F6F7FB] ${languageClass}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_20px_65px_rgba(17,24,39,0.08)] ring-1 ring-black/5 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#fafafa] to-[#f4ecff] opacity-90" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5 text-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold tracking-[0.22em] text-[#4a1429] shadow-sm uppercase">
                <FaCommentDots className="text-[10px]" />
                {isArabic ? "آراء العملاء" : "Customer Voices"}
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
                  {text.headerTitle}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-[#6B7280] sm:text-xl">
                  {text.headerSubtitle}
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#4a1429] px-6 text-sm font-extrabold text-white/90 shadow-[0_14px_30px_rgba(74,20,41,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] hover:shadow-[0_18px_40px_rgba(74,20,41,0.28)] active:translate-y-0 sm:px-8"
            >
              <FaBox className="text-xs text-[#D4AF37]" />
              <span className="text-white/90">{text.browseProducts}</span>
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-md sm:p-10">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-black text-[#2C2C2C]">
              <FaChartBar className="text-[#4a1429]" />
              {text.statsTitle}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl bg-[#4a1429] p-8 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white/15 p-3"><FaStar className="text-2xl text-[#D4AF37]" /></div>
                  <div>
                    <p className="text-white/90 font-bold">{text.averageRating}</p>
                    <h3 className="text-4xl font-black text-white/90">{stats.average}</h3>
                  </div>
                </div>
                <FaStar className="text-5xl opacity-15 text-[#D4AF37]" />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-[#4a1429] p-8 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white/15 p-3"><FaCommentDots className="text-2xl text-[#D4AF37]" /></div>
                  <div>
                    <p className="text-sm font-bold opacity-90">{text.totalReviews}</p>
                    <h3 className="text-4xl font-black text-white/90 important">{stats.total}</h3>
                  </div>
                </div>
                <FaCommentDots className="text-5xl opacity-15 text-[#D4AF37]" />
              </div>
            </div>
          </div>
          <div className="mt-12">
            <div className="mb-8 flex items-center gap-3">
              <FaChartBar className="text-[#4a1429]" />
              <h3 className="text-xl font-bold text-[#2C2C2C]">{text.distributionTitle}</h3>
            </div>
            <div className="space-y-6">
              {stats.distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-4">
                  <div className="w-16 text-start text-sm font-bold text-gray-500">{item.percent.toFixed(1)}%</div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-[#f3e9ee] shadow-inner">
                    <div
                      className="h-full rounded-full bg-[#4a1429] transition-all duration-1000 ease-out"
                      style={{ width: `${item.percent}%` }}
                    />
                    {item.count > 0 && (
                      <span className={`absolute ${isArabic ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                  <div className="flex w-12 items-center justify-end gap-1 text-[#4a1429]">
                    <span className="text-sm font-black">{item.stars}</span>
                    <FaStar className="text-xs text-[#D4AF37]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-8 rounded-xl border border-white bg-white p-6 shadow-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2 text-start">
              <div className="flex items-center gap-2 text-[#5C2E3A]">
                <FaFilter className="text-xs" />
                <span className="text-xs font-bold uppercase tracking-[0.22em]">{text.filtersTitle}</span>
              </div>
              <h3 className="text-2xl font-black text-[#2C2C2C]">{text.distributionTitle}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[64%]">
              <label className="group relative">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">{text.ratingFilter}</span>
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 hover:border-[#D1D5DB] focus:border-[#5B1E35] focus:ring-4 focus:ring-[#5B1E35]/10">
                  <option value="all">{text.allRatings}</option>
                  <option value="5">5 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="4">4 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="3">3 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="2">2 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="1">1 {isArabic ? "نجمة" : "Star"}</option>
                </select>
              </label>
              <label className="group relative">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">{text.sortByLabel}</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 hover:border-[#D1D5DB] focus:border-[#5B1E35] focus:ring-4 focus:ring-[#5B1E35]/10">
                  <option value="latest">{text.newest}</option>
                  <option value="highest">{text.highestRated}</option>
                  <option value="lowest">{text.lowestRated}</option>
                </select>
              </label>
              <label className="group relative sm:col-span-3 lg:col-span-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">{isArabic ? "بحث" : "Search"}</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 flex items-center text-[#9CA3AF]" style={{ insetInlineStart: "1rem" }}>
                    <FaSearch className="text-sm" />
                  </span>
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isArabic ? "ابحث داخل التقييمات..." : "Search reviews..."}
                    className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#4a1429] focus:ring-4 focus:ring-[#4a1429]/10"
                    style={{ paddingInlineStart: "3rem", paddingInlineEnd: "1rem" }}
                  />
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Reviews list */}
        <section className="mt-8 space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.07)]">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 w-48 rounded-full bg-gray-100" />
                    <div className="h-4 w-full rounded-full bg-gray-100" />
                    <div className="h-16 rounded-[24px] bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <article key={review._id}
                className="group rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(17,24,39,0.1)] sm:p-8">
                <div className="flex items-start gap-4 text-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4a1429]/10 via-white to-[#FFCE00]/10 text-[#4a1429] shadow-[0_10px_30px_rgba(74,20,41,0.10)] ring-1 ring-white/70">
                    <FaUserCircle className="text-3xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black text-[#111827]">{userName(review)}</h4>
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#6B7280]">
                        {new Date(review.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {productName(review) && (
                        <Link href={`/products/${productId(review)}`}
                          className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-bold text-[#4a1429] hover:bg-[#4a1429]/5 transition-colors">
                          <FaBox className="text-[8px]" />
                          {productName(review)}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-sm ${i < review.rating ? "text-[#FFCE00]" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.title && (
                  <div className="mt-5 rounded-[24px] border border-gray-100 bg-[#FAFAFB] p-6 text-start shadow-inner transition-colors group-hover:border-[#E5E7EB]">
                    <p className="text-base leading-relaxed text-[#4B5563] sm:text-lg">{review.title}</p>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="relative overflow-hidden rounded-[28px] border border-white bg-white p-8 text-center shadow-[0_20px_65px_rgba(17,24,39,0.08)] sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F4ECFF] via-white to-[#EC4899]/5 opacity-80" />
              <div className="relative mx-auto flex w-fit items-center justify-center rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(17,24,39,0.08)] ring-1 ring-white/80">
                <FaCommentDots className="text-6xl text-[#4a1429]" />
              </div>
              <div className="relative mt-8 space-y-4">
                <h3 className="text-3xl font-black tracking-tight text-[#111827]">{text.noReviewsTitle}</h3>
                <p className="mx-auto max-w-xl text-base leading-7 text-[#6B7280]">{text.noReviewsSubtitle}</p>
              </div>
              <div className="relative mt-10">
                <Link href="/products"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#4a1429] px-7 text-sm font-extrabold text-white/90 shadow-[0_14px_30px_rgba(74,20,41,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] sm:w-auto sm:min-w-[280px]">
                  <FaBox className="text-xs text-[#D4AF37]" />
                  <span className="text-white/90">{text.browseProducts}</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
