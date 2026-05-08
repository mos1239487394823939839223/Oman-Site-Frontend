"use client";

import { useState, useEffect } from "react";
import { FaStar, FaUserCircle, FaPen, FaFilter } from "react-icons/fa";

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  device?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = () => {
      try {
        const saved = localStorage.getItem("admin_testimonials");
        if (saved) {
          const adminData = JSON.parse(saved);
          // Filter only active reviews and map them
          const mapped: Review[] = adminData
            .filter((t: any) => t.active !== false)
            .map((t: any) => ({
              id: t.id,
              user: t.name, // You can add logic here to pick nameAr if language is Arabic
              rating: t.rating,
              comment: t.review,
              date: new Date(t.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }),
              device: "Dashboard"
            }));
          setReviews(mapped);
        }
      } catch (e) {
        console.error("Error loading reviews:", e);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
    // Listen for updates
    window.addEventListener('wishlistUpdated', loadReviews); // Reusing event or create new one
    return () => window.removeEventListener('wishlistUpdated', loadReviews);
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState("All Ratings");
  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment) return;

    // Create the review in the format the admin dashboard expects
    const testimonialId = `t_${Date.now()}`;
    const newTestimonial = {
      id: testimonialId,
      name: newReview.user || "Guest",
      nameAr: "", // Empty for now, can be edited in admin
      review: newReview.comment,
      reviewAr: "", // Empty for now, can be edited in admin
      rating: newReview.rating,
      avatar: "",
      active: true, // Auto-active or set to false for moderation
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Get existing testimonials from localStorage
      const saved = localStorage.getItem("admin_testimonials");
      const adminData = saved ? JSON.parse(saved) : [];
      
      // 2. Add new testimonial to the list
      const updatedAdminData = [newTestimonial, ...adminData];
      
      // 3. Save back to localStorage
      localStorage.setItem("admin_testimonials", JSON.stringify(updatedAdminData));
      
      // 4. Update local state to show immediately
      const mappedReview: Review = {
        id: testimonialId,
        user: newTestimonial.name,
        rating: newTestimonial.rating,
        comment: newTestimonial.review,
        date: "الآن",
        device: "web"
      };
      setReviews([mappedReview, ...reviews]);
      
      // 5. Reset form and close
      setNewReview({ user: "", rating: 5, comment: "" });
      setShowForm(false);
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (e) {
      console.error("Error saving review:", e);
      alert("Failed to save review. Please try again.");
    }
  };

  const stats = {
    total: reviews.length,
    average: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
    distribution: [5, 4, 3, 2, 1].map(stars => {
      const count = reviews.filter(r => r.rating === stars).length;
      return {
        stars,
        percent: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
      };
    })
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating === "All Ratings") return true;
    return review.rating.toString() === filterRating;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
              💬
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#1a3a3a] tracking-tight">All Reviews</h1>
              <p className="text-gray-500 font-medium">See what our customers are saying about our website</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1a3a3a] text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 transition-all hover:bg-[#6f1e3d] hover:scale-105 active:scale-95 shadow-xl shadow-[#1a3a3a]/10 whitespace-nowrap text-sm"
          >
            <FaPen className="text-xs" />
            {showForm ? "Close Form" : "Write Review"}
          </button>
        </div>

        {/* Review Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="p-5 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2 text-lg font-black text-[#1a3a3a]">
                  <FaPen className="text-xs" />
                  <span>Write Review</span>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Rating */}
                <div className="space-y-3">
                  <label className="text-base font-black text-[#1a3a3a]">Your Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="transition-transform active:scale-90"
                      >
                        <FaStar className={`text-3xl ${newReview.rating >= star ? "text-[#e6c35f]" : "text-gray-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <label className="text-base font-black text-[#1a3a3a]">Your Review *</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1a3a3a]/5 focus:border-[#1a3a3a] transition-all resize-none outline-none text-[#1a3a3a] text-sm font-medium placeholder:text-gray-400"
                  />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Min. 10 characters</p>
                </div>

                {/* General Notes */}
                <div className="space-y-2">
                  <label className="text-base font-black text-[#1a3a3a]">General Notes <span className="text-gray-400 font-medium">(Optional)</span></label>
                  <textarea
                    placeholder="Additional comments..."
                    rows={2}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1a3a3a]/5 focus:border-[#1a3a3a] transition-all resize-none outline-none text-[#1a3a3a] text-sm font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-gray-50/50 flex flex-col gap-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 rounded-lg border-2 border-[#1a3a3a] text-[#1a3a3a] text-xs font-black hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    Cancel
                  </button>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#1a3a3a] text-white py-4 rounded-xl font-black shadow-lg shadow-[#1a3a3a]/10 hover:bg-[#6f1e3d] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4 transform rotate-45 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl">📊</span>
            <h2 className="text-xl font-black text-[#1a3a3a] uppercase tracking-tight">Review Statistics</h2>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-r from-[#6b4fa3] to-[#8a70c0] rounded-[1.25rem] p-6 text-white relative flex items-center gap-4 shadow-lg shadow-purple-500/10">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{stats.total}</span>
                <span className="text-base font-medium opacity-80 uppercase tracking-wide">Total Reviews</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#f472b6] to-[#fb7185] rounded-[1.25rem] p-6 text-white relative flex items-center gap-4 shadow-lg shadow-pink-500/10">
              <div className="bg-white/20 p-3 rounded-xl">
                <FaStar className="w-8 h-8" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{stats.average}</span>
                <span className="text-base font-medium opacity-80 uppercase tracking-wide">Average Rating</span>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">📈</span>
              <h3 className="font-black text-[#1a3a3a] uppercase tracking-tight">Rating Distribution</h3>
            </div>
            
            {stats.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-10 shrink-0">
                  <span className="text-base font-bold text-gray-700">{item.stars}</span>
                  <FaStar className="text-[#8b7355] text-xs" />
                </div>
                
                <div className="flex-1 h-10 bg-gray-50 rounded-full relative overflow-hidden border border-gray-100/50">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out flex items-center justify-end px-4 rounded-full ${
                      item.stars === 5 ? "bg-[#5c5c3d]" : "bg-gray-100"
                    }`}
                    style={{ width: `${item.percent}%` }}
                  >
                    {item.percent > 0 && (
                      <span className="text-white font-bold text-xs opacity-60">{reviews.filter(r => r.rating === item.stars).length}</span>
                    )}
                  </div>
                </div>
                
                <span className="w-14 text-right text-xs font-bold text-gray-400">
                  {item.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 font-black text-[#1a3a3a]">
            <FaStar className="text-xs" />
            <span>Filter by Rating</span>
          </div>
          <div className="w-full max-w-sm relative group">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-6 py-3.5 bg-white border-2 border-[#1a3a3a]/10 rounded-2xl focus:ring-4 focus:ring-[#1a3a3a]/5 focus:border-[#1a3a3a] transition-all text-center font-bold text-gray-700 appearance-none cursor-pointer text-sm"
            >
              <option value="All Ratings">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Reviews List or Empty State */}
        <div className="space-y-6 mb-20">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md group animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#6f1e3d]/5 rounded-2xl flex items-center justify-center text-[#6f1e3d] text-2xl group-hover:bg-[#6f1e3d] group-hover:text-white transition-colors">
                      <FaUserCircle />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-black text-[#1a3a3a]">{review.user}</h3>
                        <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{review.date}</span>
                        {review.device && (
                          <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-gray-100">
                            📱 {review.device}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-sm ${i < review.rating ? "text-[#e6c35f]" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 font-medium leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-50 group-hover:border-[#6f1e3d]/10 transition-colors">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2.5rem] p-16 shadow-sm border border-gray-100 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-5xl">
                💬
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-[#1a3a3a]">No reviews yet. Be the first to share your thoughts!</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto">Be the first to share your thoughts about our products!</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-[#1a3a3a] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#1a3a3a]/10 hover:bg-[#6f1e3d] transition-all flex items-center justify-center gap-3"
              >
                <FaPen className="text-sm" />
                Be the First to Review
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
