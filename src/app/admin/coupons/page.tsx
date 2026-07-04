"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/services/adminApi";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { FaPlus, FaTimes, FaEdit, FaTrashAlt, FaTicketAlt, FaPercent } from "react-icons/fa";

type Ref = string | { _id: string; name?: string; title?: string };

interface Coupon {
  _id: string;
  name: string;
  discount: number;
  expire: string;
  product?: Ref;
  category?: Ref;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductLite { _id: string; title: string; }
interface CategoryLite { _id: string; name: string; }

type Scope = "cart" | "product" | "category";

/** Extract the id from a possibly-populated reference. */
function refId(ref?: Ref): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id || "";
}

/** Format an ISO date string into the `YYYY-MM-DD` value a date input expects. */
function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Human-readable date for the table. */
function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const emptyForm = { name: "", discount: "", expire: "", scope: "cart" as Scope, product: "", category: "" };

export default function CouponsManagementPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [categories, setCategories] = useState<CategoryLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponRes, productRes, categoryRes] = await Promise.all([
        adminApi.getAllCoupons(),
        adminApi.getAllProducts({ limit: "1000" }).catch(() => ({ data: [] })),
        adminApi.getAllCategories().catch(() => ({ data: [] })),
      ]);
      setCoupons(couponRes?.data || []);
      setProducts(productRes?.data || []);
      setCategories(categoryRes?.data || []);
    } catch (e) {
      console.error("Error fetching coupons:", e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    const pid = refId(coupon.product);
    const cid = refId(coupon.category);
    setEditing(coupon);
    setForm({
      name: coupon.name || "",
      discount: String(coupon.discount ?? ""),
      expire: toDateInputValue(coupon.expire),
      scope: pid ? "product" : cid ? "category" : "cart",
      product: pid,
      category: cid,
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setError("");
  };

  const validate = (): string | null => {
    const name = form.name.trim();
    const discount = Number(form.discount);
    if (name.length < 3 || name.length > 30) return "Coupon code must be 3–30 characters.";
    if (!form.discount || isNaN(discount) || discount < 1 || discount > 100)
      return "Discount must be a number between 1 and 100 (percent).";
    if (!form.expire) return "Please choose an expiry date.";
    if (new Date(form.expire).getTime() <= Date.now()) return "Expiry date must be in the future.";
    if (form.scope === "product" && !form.product) return "Please choose which product this coupon applies to.";
    if (form.scope === "category" && !form.category) return "Please choose which category this coupon applies to.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    // Backend stores the coupon name UPPERCASE; send it that way for consistency.
    const payload: {
      name: string; discount: number; expire: string; product?: string; category?: string;
    } = {
      name: form.name.trim().toUpperCase(),
      discount: Number(form.discount),
      // Send a full ISO-8601 datetime (end of the chosen day) so it validates as future.
      expire: new Date(`${form.expire}T23:59:59`).toISOString(),
    };
    // Scope: attach product OR category id; a cart-wide coupon sends neither.
    if (form.scope === "product") payload.product = form.product;
    if (form.scope === "category") payload.category = form.category;

    try {
      setFormLoading(true);
      setError("");
      if (editing) {
        // When editing, clear the other scope fields so a change of scope sticks.
        await adminApi.updateCoupon(editing._id, {
          ...payload,
          product: form.scope === "product" ? form.product : null,
          category: form.scope === "category" ? form.category : null,
        });
      } else {
        await adminApi.createCoupon(payload);
      }
      closeForm();
      fetchData();
    } catch (e: any) {
      setError(e?.message || "Failed to save coupon.");
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminApi.deleteCoupon(deleteTarget._id);
      setCoupons(prev => prev.filter(c => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e?.message || "Failed to delete coupon.");
    } finally {
      setDeleting(false);
    }
  };

  /** Label describing what a coupon applies to, for the table. */
  const scopeLabel = (c: Coupon): string => {
    const pid = refId(c.product);
    const cid = refId(c.category);
    if (pid) {
      const p = products.find(x => x._id === pid);
      const title = (typeof c.product === "object" && c.product.title) || p?.title;
      return title ? `Product: ${title}` : "Specific product";
    }
    if (cid) {
      const cat = categories.find(x => x._id === cid);
      const name = (typeof c.category === "object" && c.category.name) || cat?.name;
      return name ? `Category: ${name}` : "Specific category";
    }
    return "Entire cart";
  };

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5C2E3A]/30 focus:border-[#5C2E3A] outline-none transition-all";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1 text-sm">Create discount codes — cart-wide or scoped to a product/category</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5C2E3A] text-white rounded-xl hover:bg-[#4A2330] transition-colors font-bold text-sm shadow-sm"
          >
            <FaPlus className="w-4 h-4" />
            Add Coupon
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editing ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <button
              onClick={closeForm}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Coupon code / name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaTicketAlt className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. SUMMER25"
                  autoComplete="off"
                  className={inputCls + " pl-10 uppercase"}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">3–30 characters. Stored in UPPERCASE and must be unique.</p>
            </div>

            {/* Discount percentage */}
            <div>
              <label htmlFor="discount" className="block text-sm font-bold text-gray-700 mb-1">
                Discount (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPercent className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 text-xs" />
                <input
                  id="discount"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discount}
                  onChange={(e) => setForm(f => ({ ...f, discount: e.target.value }))}
                  placeholder="e.g. 25"
                  className={inputCls + " pl-10"}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">A whole number between 1 and 100.</p>
            </div>

            {/* Scope — cart-wide vs product/category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Applies To <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "cart", label: "Entire cart" },
                  { key: "product", label: "One product" },
                  { key: "category", label: "One category" },
                ] as { key: Scope; label: string }[]).map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, scope: opt.key }))}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      form.scope === opt.key
                        ? "border-[#5C2E3A] bg-[#5C2E3A]/10 text-[#5C2E3A]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {form.scope === "product" && (
                <select
                  value={form.product}
                  onChange={(e) => setForm(f => ({ ...f, product: e.target.value }))}
                  className={inputCls + " mt-3"}
                >
                  <option value="">Select a product…</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              )}

              {form.scope === "category" && (
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  className={inputCls + " mt-3"}
                >
                  <option value="">Select a category…</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Scoped coupons discount only the matching items, not the whole cart.
              </p>
            </div>

            {/* Expiry date */}
            <div>
              <label htmlFor="expire" className="block text-sm font-bold text-gray-700 mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                id="expire"
                type="date"
                value={form.expire}
                min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                onChange={(e) => setForm(f => ({ ...f, expire: e.target.value }))}
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">The coupon stops working after this date.</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 bg-[#5C2E3A] text-white rounded-xl hover:bg-[#4A2330] transition-colors font-bold text-sm shadow-sm disabled:opacity-50"
              >
                {formLoading ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading coupons…</div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <FaTicketAlt className="mx-auto text-3xl text-gray-300 mb-3" />
              <p className="text-gray-500 font-bold">No coupons yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first discount code to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-black">Code</th>
                    <th className="px-6 py-3 font-black">Discount</th>
                    <th className="px-6 py-3 font-black">Applies To</th>
                    <th className="px-6 py-3 font-black">Expires</th>
                    <th className="px-6 py-3 font-black">Status</th>
                    <th className="px-6 py-3 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((c) => {
                    const expired = c.expire ? new Date(c.expire).getTime() <= Date.now() : false;
                    const scoped = !!(refId(c.product) || refId(c.category));
                    return (
                      <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-900 tracking-wide">{c.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-[#5C2E3A]/10 text-[#5C2E3A] font-black px-2.5 py-1 rounded-lg">
                            {c.discount}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scoped ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                            {scopeLabel(c)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{formatDate(c.expire)}</td>
                        <td className="px-6 py-4">
                          {expired ? (
                            <span className="bg-red-50 text-red-500 font-bold text-xs px-2.5 py-1 rounded-full">Expired</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 font-bold text-xs px-2.5 py-1 rounded-full">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 text-gray-400 hover:text-[#5C2E3A] hover:bg-[#5C2E3A]/10 rounded-lg transition-colors"
                              aria-label="Edit coupon"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Delete coupon"
                            >
                              <FaTrashAlt className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Coupon"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDanger
        isLoading={deleting}
      />
    </>
  );
}
