"use client";

import { useState, useEffect } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/ToastProvider";
import { adminApi } from "@/services/adminApi";
import { getCategories, getBrands } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import { formatPrice } from "@/lib/currency";
import { getFriendlyError } from "@/lib/errors";
import ProductForm from "@/components/admin/ProductForm";
import {
  FaPlus, FaTimes, FaBox, FaSearch,
  FaTrash, FaEdit, FaDatabase, FaStar, FaPercent
} from "react-icons/fa";

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  // Percentage discount for a single product.
  const [discountTarget, setDiscountTarget] = useState<any | null>(null);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [localRes, catsRes, brandsRes, subCatsRes] = await Promise.all([
        adminApi.getAllProducts().catch(() => ({ data: [] })),
        adminApi.getAllCategories().catch(() => getCategories()),
        adminApi.getAllBrands().catch(() => getBrands()),
        adminApi.getAllSubcategories().catch(() => ({ data: [] })),
      ]);
      setProducts(localRes?.data || []);
      setCategories(catsRes?.data || []);
      setBrands(brandsRes?.data || []);
      setSubcategories(subCatsRes?.data || []);
    } catch {
      toast.error("Load Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteProduct(deleteTarget._id);
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Deleted", `"${deleteTarget.title}" permanently removed`);
    } catch {
      toast.error("Delete Failed", "Could not delete product");
    }
  };

  const confirmDiscount = async () => {
    if (!discountTarget) return;
    const pct = Number(discountPercent);
    if (discountPercent === "" || !Number.isFinite(pct) || pct < 0 || pct >= 100) {
      toast.error("Invalid value", "Enter a percentage between 0 and 99 (0 clears the discount).");
      return;
    }
    try {
      setDiscountLoading(true);
      const res = await adminApi.applyProductDiscount(discountTarget._id, pct);
      if (res?.data) {
        setProducts(prev => prev.map(p => p._id === discountTarget._id ? { ...p, ...res.data } : p));
      }
      toast.success(
        pct === 0 ? "Discount cleared" : "Discount applied",
        pct === 0
          ? `Removed the discount from "${discountTarget.title}".`
          : `${pct}% off applied to "${discountTarget.title}".`
      );
      setDiscountTarget(null);
      setDiscountPercent("");
    } catch (error) {
      toast.error("Failed", getFriendlyError(error, "Couldn't apply the discount. Please try again."));
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id, data);
        toast.success("Updated", "Product updated successfully");
      } else {
        await adminApi.createProduct(data);
        toast.success("Created", "New product added to store");
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchData();
    } catch (e: any) {
      toast.error("Save Failed", e.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">{products.length} products total</p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#5C2E3A] hover:bg-[#4A2330] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm">
            <FaPlus className="w-3.5 h-3.5" /> Add Product
          </button>
        )}
      </div>

      {!showForm && (
        <div className="relative max-w-md mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#5C2E3A]/60 placeholder-gray-400 shadow-sm" />
        </div>
      )}

      {showForm ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">{editingProduct ? "Edit Product" : "Create New Product"}</h2>
            <button onClick={() => { setShowForm(false); setEditingProduct(null); }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <ProductForm product={editingProduct || undefined} categories={categories} subcategories={subcategories} brands={brands}
            onSubmit={handleFormSubmit} onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            loading={formLoading} />
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaBox className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg">No products found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>Image</span>
            <span>Product</span>
            <span className="text-right">Price</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.map((product) => (
              <div key={product._id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={resolveMediaUrl(product.imageCover, "products")} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 font-semibold text-sm truncate">{product.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#5C2E3A] uppercase"><FaDatabase className="w-2 h-2" /> Product</span>
                    {product.isRecommended && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#5C2E3A] uppercase bg-[#5C2E3A]/10 px-1.5 py-0.5 rounded-md border border-[#5C2E3A]/15">
                        <FaStar className="w-2 h-2" /> Best Seller
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 font-bold text-sm">
                    {formatPrice(product.priceAfterDiscount ?? product.price, "OMR")}
                  </div>
                  {product.priceAfterDiscount != null && (
                    <div className="text-xs text-gray-400 line-through">{formatPrice(product.price, "OMR")}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => { setDiscountTarget(product); setDiscountPercent(""); }} title="Apply a discount to this product"
                    className="h-8 px-2.5 flex items-center gap-1.5 text-xs font-bold text-[#B8902F] bg-[#D4AF37]/10 rounded-lg hover:bg-[#D4AF37]/20 transition-colors border border-[#D4AF37]/20 whitespace-nowrap">
                    <FaPercent className="w-3 h-3" /> خصم
                  </button>
                  <button onClick={() => { setEditingProduct(product); setShowForm(true); }} className="w-8 h-8 flex items-center justify-center bg-[#5C2E3A]/10 text-[#5C2E3A] rounded-lg hover:bg-[#5C2E3A]/15 transition-colors border border-[#5C2E3A]/15">
                    <FaEdit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(product)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Product"
        message={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete" cancelText="Cancel"
        onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} isDanger />

      <ConfirmModal
        isOpen={!!discountTarget}
        title="Apply Discount to Product"
        message={
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Apply a percentage discount to{" "}
              <span className="font-black text-[#5C2E3A]">{discountTarget?.title}</span>. It updates every currency price.
            </p>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={99}
                step={1}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5C2E3A]/30 focus:border-[#5C2E3A] outline-none font-bold text-gray-900 bg-white pr-10"
              />
              <span className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 font-bold">%</span>
            </div>
            <p className="text-xs text-gray-400">Enter 0 to remove the discount from this product.</p>
          </div>
        }
        confirmText={discountLoading ? "Applying..." : "Apply"}
        cancelText="Cancel"
        onConfirm={confirmDiscount}
        onCancel={() => { setDiscountTarget(null); setDiscountPercent(""); }}
        isDanger={false}
        isLoading={discountLoading}
      />
    </>
  );
}
