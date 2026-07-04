"use client";

import { useState, useEffect } from "react";
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

export default function ReviewsPage() {
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
      setError(err.message || "Failed to load reviews");
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
      setError(err.message || "Failed to delete review");
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
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">View and moderate customer product reviews</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">×</button>
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
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-[#5C2E3A]">{s.value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{s.label}</p>
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
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 transition-colors placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#5C2E3A] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <FaStar className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="font-bold">{search ? "No results found" : "No reviews yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Rating</th>
                  <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Review</th>
                  <th className="text-left px-5 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(review => (
                  <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#5C2E3A]/10 flex items-center justify-center shrink-0 text-[#5C2E3A] font-black text-xs">
                          <FaUserCircle className="text-base" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[120px]">{userName(review)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-gray-600 font-medium truncate max-w-[150px] block">{productName(review)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-xs ${s <= review.rating ? "text-[#5C2E3A]" : "text-gray-200"}`}>★</span>
                        ))}
                        <span className="text-xs font-bold text-gray-400 ml-1">({review.rating})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-600 font-medium max-w-[200px] truncate">
                        {review.title || <span className="text-gray-300 italic">—</span>}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDeleteTarget(review)}
                        className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
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
    </>
  );
}
