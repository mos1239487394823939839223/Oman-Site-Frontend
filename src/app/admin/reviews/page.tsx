"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { adminApi } from "@/services/adminApi";
import { FaStar, FaTrash, FaUserCircle } from "react-icons/fa";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  user?: { _id: string; name: string; profileImage?: string } | string;
  product?: { _id: string; title: string; imageCover?: string } | string;
  createdAt: string;
}

function ReviewsManagementContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAllReviews();
      setReviews(res?.data || []);
    } catch (err: any) {
      setError(err.message || "فشل تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteReview(deleteTarget._id);
      setReviews(prev => prev.filter(r => r._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || "فشل حذف التقييم");
    } finally {
      setDeleting(false);
    }
  };

  const userName = (r: Review) =>
    typeof r.user === "object" && r.user ? r.user.name : "—";

  const productName = (r: Review) =>
    typeof r.product === "object" && r.product ? r.product.title : "—";

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    return (
      userName(r).toLowerCase().includes(q) ||
      productName(r).toLowerCase().includes(q) ||
      (r.title || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-5 lg:p-8">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black">Reviews</h1>
              <p className="text-gray-500 text-sm mt-1">View and moderate customer product reviews</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-[#c5a059] hover:bg-[#e6c35f] text-[#0a0f1a] px-4 py-2.5 rounded-xl font-black text-sm transition-all"
            >
              ↻ Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 font-bold">×</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Reviews",    value: reviews.length },
              { label: "Average Rating",   value: reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)+" ★" : "—" },
              { label: "5-Star Reviews",   value: reviews.filter(r=>r.rating===5).length },
              { label: "1-2 Star Reviews", value: reviews.filter(r=>r.rating<=2).length },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <p className="text-2xl font-black text-[#c5a059]">{s.value}</p>
                <p className="text-xs font-bold text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by user, product, or review text..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors placeholder:text-gray-600"
            />
          </div>

          {/* Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#c5a059] rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-600">
                <FaStar className="text-4xl mx-auto mb-3" />
                <p className="font-bold">{search ? "No results found" : "No reviews yet"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Product</th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Rating</th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Review</th>
                      <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Date</th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map(review => (
                      <tr key={review._id} className="hover:bg-white/[0.02] transition-colors">
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#c5a059]/20 flex items-center justify-center shrink-0 text-[#c5a059] font-black text-xs">
                              <FaUserCircle className="text-base" />
                            </div>
                            <span className="font-bold text-white truncate max-w-[120px]">{userName(review)}</span>
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-5 py-4">
                          <span className="text-gray-400 font-medium truncate max-w-[150px] block">{productName(review)}</span>
                        </td>

                        {/* Rating */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-xs ${s <= review.rating ? "text-[#c5a059]" : "text-gray-700"}`}>★</span>
                            ))}
                            <span className="text-xs font-bold text-gray-500 ml-1">({review.rating})</span>
                          </div>
                        </td>

                        {/* Title / Review text */}
                        <td className="px-5 py-4">
                          <p className="text-gray-400 font-medium max-w-[200px] truncate">
                            {review.title || <span className="text-gray-700 italic">—</span>}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setDeleteTarget(review)}
                            className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="Delete review"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Delete Review"
          message={`Delete review by "${userName(deleteTarget)}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDanger
        />
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <AdminRouteGuard>
      <ReviewsManagementContent />
    </AdminRouteGuard>
  );
}
