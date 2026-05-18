"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  FaChartBar,
  FaCommentDots,
  FaFilter,
  FaPen,
  FaSearch,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  device?: string;
}

const clampRating = (value: number) => Math.max(1, Math.min(5, value));

export default function ReviewsPage() {
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [newReview, setNewReview] = useState({ user: user?.name || "", rating: 5, comment: "" });

  const isArabic = (i18n.language || "ar").toLowerCase().startsWith("ar");
  const dir = isArabic ? "rtl" : "ltr";
  const languageClass = isArabic ? "font-[family-name:var(--font-cairo)]" : "font-[family-name:var(--font-inter)]";

  const text = useMemo(() => ({
    headerTitle: isArabic ? "كل التقييمات" : "All Reviews",
    headerSubtitle: isArabic
      ? "شاهد ما يقوله عملاؤنا عن تجربتهم مع موقعنا"
      : "See what our customers are saying about our website",
    writeReview: isArabic ? "اكتب مراجعة" : "Write Review",
    closeForm: isArabic ? "إغلاق" : "Close",
    statsTitle: isArabic ? "إحصائيات المراجعات" : "Review Statistics",
    averageRating: isArabic ? "متوسط التقييم" : "Average Rating",
    totalReviews: isArabic ? "إجمالي المراجعات" : "Total Reviews",
    distributionTitle: isArabic ? "توزيع التقييمات" : "Rating Distribution",
    filtersTitle: isArabic ? "الفرز والتصفية" : "Filters & Sorting",
    ratingFilter: isArabic ? "التقييم" : "Rating",
    sortBy: isArabic ? "الترتيب" : "Sort by",
    search: isArabic ? "ابحث داخل المراجعات" : "Search reviews",
    allRatings: isArabic ? "كل التقييمات" : "All Ratings",
    newest: isArabic ? "الأحدث" : "Newest",
    highestRated: isArabic ? "الأعلى تقييمًا" : "Highest Rated",
    lowestRated: isArabic ? "الأقل تقييمًا" : "Lowest Rated",
    noReviewsTitle: isArabic ? "لا توجد مراجعات بعد" : "No reviews yet",
    noReviewsSubtitle: isArabic
      ? "كن أول من يشارك تجربته معنا ويترك انطباعه حول الخدمة أو المنتجات."
      : "Be the first to share your experience with our service or products.",
    submitReview: isArabic ? "إرسال المراجعة" : "Submit Review",
    reviewTitle: isArabic ? "اكتب مراجعتك" : "Write your review",
    reviewLabel: isArabic ? "تقييمك" : "Your rating",
    commentLabel: isArabic ? "مراجعتك" : "Your review",
    nameLabel: isArabic ? "اسمك" : "Your name",
    commentPlaceholder: isArabic ? "شاركنا تجربتك هنا..." : "Share your experience here...",
    namePlaceholder: isArabic ? "الاسم أو Guest" : "Name or Guest",
    ctaEmpty: isArabic ? "اكتب أول مراجعة" : "Write the first review",
    showMore: isArabic ? "عرض المزيد" : "Show more",
    totalLabel: isArabic ? "مراجعة" : "reviews",
    deviceLabel: isArabic ? "لوحة التحكم" : "Dashboard",
    close: isArabic ? "إغلاق" : "Close",
  }), [isArabic]);

  useEffect(() => {
    const loadReviews = () => {
      try {
        const saved = localStorage.getItem("admin_testimonials");
        if (!saved) {
          setReviews([]);
          return;
        }

        const adminData = JSON.parse(saved);
        const mapped: Review[] = adminData
          .filter((t: any) => t.active !== false)
          .map((t: any) => ({
            id: t.id,
            user: isArabic ? t.nameAr || t.name || "Guest" : t.name || t.nameAr || "Guest",
            rating: clampRating(Number(t.rating) || 5),
            comment: isArabic ? t.reviewAr || t.review || "" : t.review || t.reviewAr || "",
            date: new Date(t.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
              day: "numeric",
              month: "long",
            }),
            device: isArabic ? "لوحة التحكم" : "Dashboard",
          }));

        setReviews(mapped);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
    window.addEventListener("reviewsUpdated", loadReviews);
    return () => window.removeEventListener("reviewsUpdated", loadReviews);
  }, [isArabic]);

  // Sync user name when user logs in
  useEffect(() => {
    if (user) {
      setNewReview(prev => ({ ...prev, user: user.name }));
    }
  }, [user]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;

    return {
      total,
      average: average.toFixed(1),
      distribution: [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((review) => review.rating === stars).length;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return { stars, count, percent };
      }),
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const items = reviews.filter((review) => {
      const ratingMatch = filterRating === "all" || review.rating.toString() === filterRating;
      const searchMatch =
        normalizedSearch.length === 0 ||
        review.user.toLowerCase().includes(normalizedSearch) ||
        review.comment.toLowerCase().includes(normalizedSearch);

      return ratingMatch && searchMatch;
    });

    if (sortBy === "highest") {
      return [...items].sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "lowest") {
      return [...items].sort((a, b) => a.rating - b.rating);
    }

    return items;
  }, [filterRating, reviews, searchQuery, sortBy]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!newReview.comment.trim()) return;

    const testimonialId = `t_${Date.now()}`;
    const testimonial = {
      id: testimonialId,
      name: newReview.user.trim() || (isArabic ? "ضيف" : "Guest"),
      nameAr: newReview.user.trim() || (isArabic ? "ضيف" : "Guest"),
      review: newReview.comment.trim(),
      reviewAr: newReview.comment.trim(),
      rating: clampRating(newReview.rating),
      avatar: "",
      active: true,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem("admin_testimonials");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("admin_testimonials", JSON.stringify([testimonial, ...existing]));

      setReviews((current) => [
        {
          id: testimonialId,
          user: testimonial.name,
          rating: testimonial.rating,
          comment: testimonial.review,
          date: isArabic ? "الآن" : "Just now",
          device: text.deviceLabel,
        },
        ...current,
      ]);

      setNewReview({ user: "", rating: 5, comment: "" });
      setShowForm(false);
      window.dispatchEvent(new CustomEvent("reviewsUpdated"));
    } catch (error) {
      console.error("Error saving review:", error);
      alert(isArabic ? "تعذر حفظ المراجعة. حاول مرة أخرى." : "Unable to save the review. Please try again.");
    }
  };

  return (
    <div dir={dir} className={`min-h-screen bg-[#F6F7FB] ${languageClass}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_20px_65px_rgba(17,24,39,0.08)] ring-1 ring-black/5 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#fafafa] to-[#f4ecff] opacity-90"></div>
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

            {isAuthenticated ? (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#4a1429] px-6 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(74,20,41,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] hover:shadow-[0_18px_40px_rgba(74,20,41,0.28)] active:translate-y-0 sm:px-8"
              >
                <FaPen className="text-xs" />
                {text.writeReview}
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#4a1429] px-6 text-sm font-extrabold !text-white shadow-[0_14px_30px_rgba(74,20,41,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] hover:shadow-[0_18px_40px_rgba(74,20,41,0.28)] active:translate-y-0 sm:px-8"
              >
                <FaUserCircle className="text-lg text-white" />
                {isArabic ? "سجل دخول لتكتب مراجعة" : "Login to write review"}
              </Link>
            )}
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(17,24,39,0.22)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-[#f8f2ff]" />
              <div className="relative border-b border-gray-100 px-6 py-5 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 text-start">
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#4a1429]">{text.reviewTitle}</div>
                    <h2 className="text-2xl font-black text-[#111827]">{text.writeReview}</h2>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:text-[#4a1429]"
                    aria-label={text.close}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="relative space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                {!isAuthenticated ? (
                  <div className="rounded-2xl bg-amber-50 p-6 text-center shadow-sm border border-amber-100">
                    <div className="flex flex-col items-center gap-4">
                      <FaUserCircle className="text-4xl text-amber-600 opacity-50" />
                      <div className="space-y-1">
                        <p className="text-base font-bold text-amber-900">
                          {isArabic ? "تسجيل الدخول مطلوب" : "Login Required"}
                        </p>
                        <p className="text-sm text-amber-700">
                          {isArabic ? "يرجى تسجيل الدخول لكتابة مراجعة." : "Please login to write a review."}
                        </p>
                      </div>
                      <Link
                        href="/login"
                        className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-amber-600 px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-700"
                      >
                        {isArabic ? "تسجيل الدخول" : "Login Now"}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#111827]">{text.nameLabel}</label>
                        <input
                          value={newReview.user}
                          readOnly={!!user}
                          onChange={(e) => !user && setNewReview((current) => ({ ...current, user: e.target.value }))}
                          placeholder={text.namePlaceholder}
                          className={`h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 placeholder:text-[#9CA3AF] focus:border-[#4a1429] focus:ring-4 focus:ring-[#4a1429]/10 ${user ? 'opacity-70 bg-gray-50' : 'hover:border-[#D1D5DB]'}`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#111827]">{text.reviewLabel}</label>
                        <div className="flex h-14 items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 shadow-sm transition-all duration-300 hover:border-[#D1D5DB] focus-within:border-[#5B1E35] focus-within:ring-4 focus-within:ring-[#5B1E35]/10">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview((current) => ({ ...current, rating: star }))}
                              className="transition-transform duration-200 active:scale-90"
                            >
                              <FaStar className={`text-xl transition-colors ${newReview.rating >= star ? "text-[#FFCE00]" : "text-gray-200"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#111827]">{text.commentLabel}</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview((current) => ({ ...current, comment: e.target.value }))}
                        placeholder={text.commentPlaceholder}
                        rows={5}
                        className="min-h-[160px] w-full resize-none rounded-[24px] border border-[#E5E7EB] bg-white px-4 py-4 text-start text-sm font-medium text-[#111827] shadow-sm transition-all duration-300 placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#4a1429] focus:ring-4 focus:ring-[#4a1429]/10"
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="inline-flex h-14 items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-sm font-bold text-[#111827] transition-all hover:border-gray-300 hover:bg-gray-50"
                      >
                        {text.close}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#4a1429] px-7 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(74,20,41,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] hover:shadow-[0_18px_40px_rgba(74,20,41,0.30)]"
                      >
                        {text.submitReview}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Redesigned Statistics Section */}
        <section className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-md sm:p-10">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-black text-[#2C2C2C]">
              <FaChartBar className="text-[#5C2E3A]" />
              {text.statsTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Average Rating Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#5C2E3A] to-[#4A2330] p-8 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white/15 p-3">
                    <FaStar className="text-2xl text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold !text-white opacity-90">{text.averageRating}</p>
                    <h3 className="text-4xl font-black !text-white">{stats.average}</h3>
                  </div>
                </div>
                <FaStar className="text-5xl opacity-15 text-[#D4AF37]" />
              </div>
            </div>

            {/* Total Reviews Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#4A2330] to-[#5C2E3A] p-8 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-white/15 p-3">
                    <FaCommentDots className="text-2xl text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold !text-white opacity-90">{text.totalReviews}</p>
                    <h3 className="text-4xl font-black !text-white">{stats.total}</h3>
                  </div>
                </div>
                <FaCommentDots className="text-5xl opacity-15 text-[#D4AF37]" />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-8 flex items-center gap-3">
              <FaChartBar className="text-[#5C2E3A]" />
              <h3 className="text-xl font-bold text-[#2C2C2C]">{text.distributionTitle}</h3>
            </div>

            <div className="space-y-6">
              {stats.distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-4">
                  <div className="w-16 text-start text-sm font-bold text-gray-500">
                    {item.percent.toFixed(1)}%
                  </div>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-gray-50 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7b6d41] via-[#4d6a5e] to-[#2c4c44] transition-all duration-1000 ease-out"
                      style={{ width: `${item.percent}%` }}
                    />
                    {item.count > 0 && (
                      <span className={`absolute ${isArabic ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/90`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                  <div className="flex w-12 items-center justify-end gap-1 text-[#5C2E3A]">
                    <span className="text-sm font-black">{item.stars}</span>
                    <FaStar className="text-xs text-[#D4AF37]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                <select
                  value={filterRating}
                  onChange={(event) => setFilterRating(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 hover:border-[#D1D5DB] focus:border-[#5B1E35] focus:ring-4 focus:ring-[#5B1E35]/10"
                >
                  <option value="all">{text.allRatings}</option>
                  <option value="5">5 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="4">4 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="3">3 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="2">2 {isArabic ? "نجوم" : "Stars"}</option>
                  <option value="1">1 {isArabic ? "نجمة" : "Star"}</option>
                </select>
              </label>

              <label className="group relative">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">{text.sortBy}</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 hover:border-[#D1D5DB] focus:border-[#5B1E35] focus:ring-4 focus:ring-[#5B1E35]/10"
                >
                  <option value="latest">{text.newest}</option>
                  <option value="highest">{text.highestRated}</option>
                  <option value="lowest">{text.lowestRated}</option>
                </select>
              </label>

              <label className="group relative sm:col-span-3 lg:col-span-1">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6B7280]">{isArabic ? "بحث" : "Search"}</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 flex items-center text-[#9CA3AF] transition-colors group-focus-within:text-[#5B1E35]" style={{ insetInlineStart: "1rem" }}>
                    <FaSearch className="text-sm" />
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={text.search}
                    className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white text-start text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 placeholder:text-[#9CA3AF] hover:border-[#D1D5DB] focus:border-[#4a1429] focus:ring-4 focus:ring-[#4a1429]/10"
                    style={{ paddingInlineStart: "3rem", paddingInlineEnd: "1rem" }}
                  />
                </div>
              </label>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.07)]">
                  <div className="animate-pulse space-y-4">
                    <div className="h-5 w-48 rounded-full bg-gray-100" />
                    <div className="h-4 w-full rounded-full bg-gray-100" />
                    <div className="h-4 w-11/12 rounded-full bg-gray-100" />
                    <div className="h-24 rounded-[24px] bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <article
                key={review.id}
                className="group rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(17,24,39,0.1)] sm:p-8"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4 text-start">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4a1429]/10 via-white to-[#FFCE00]/10 text-[#4a1429] shadow-[0_10px_30px_rgba(74,20,41,0.10)] ring-1 ring-white/70">
                      <FaUserCircle className="text-3xl" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-black text-[#111827]">{review.user}</h4>
                        <span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#6B7280]">{review.date}</span>
                        {review.device ? (
                          <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-bold text-[#6B7280]">
                            {review.device}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <FaStar
                            key={starIndex}
                            className={`text-sm transition-colors ${starIndex < review.rating ? "text-[#FFCE00]" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-gray-100 bg-[#FAFAFB] p-6 text-start shadow-inner transition-colors group-hover:border-[#E5E7EB]">
                  <p className="text-base leading-relaxed text-[#4B5563] sm:text-lg">{review.comment}</p>
                </div>
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
                <p className="mx-auto max-w-xl text-base leading-7 text-[#6B7280]">
                  {text.noReviewsSubtitle}
                </p>
              </div>
              <div className="relative mt-10">
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#4a1429] px-7 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(74,20,41,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] hover:shadow-[0_18px_40px_rgba(74,20,41,0.22)] sm:w-auto sm:min-w-[280px]"
                  >
                    <FaPen className="mr-2 text-xs" />
                    {text.ctaEmpty}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#4a1429] px-7 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(74,20,41,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5b1b35] hover:shadow-[0_18px_40px_rgba(74,20,41,0.22)] sm:w-auto sm:min-w-[280px]"
                  >
                    <FaUserCircle className="mr-2 text-lg" />
                    {isArabic ? "سجل دخول للمشاركة" : "Login to participate"}
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
