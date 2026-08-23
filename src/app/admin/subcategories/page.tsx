"use client";

import { useState, useEffect } from "react";
import SubcategoriesTable from "@/components/admin/SubcategoriesTable";
import SubcategoryForm from "@/components/admin/SubcategoryForm";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { adminApi } from "@/services/adminApi";
import { getCategories, Category, Subcategory } from "@/services/clientApi";
import { useToast } from "@/components/admin/ToastProvider";
import { getFriendlyError } from "@/lib/errors";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function SubcategoriesManagementPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deleteSubcategory, setDeleteSubcategory] = useState<Subcategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  // Bulk product discount for a subcategory.
  const [discountTarget, setDiscountTarget] = useState<Subcategory | null>(null);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        adminApi.getAllSubcategories(),
        adminApi.getAllCategories().catch(() => getCategories()),
      ]);

      setSubcategories(subcategoriesRes?.data || []);
      setCategories(categoriesRes?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubcategory(null);
    setShowForm(true);
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setShowForm(true);
  };

  const handleDelete = (subcategory: Subcategory) => {
    setDeleteSubcategory(subcategory);
  };

  const confirmDelete = async () => {
    if (!deleteSubcategory) return;

    try {
      await adminApi.deleteSubcategory(deleteSubcategory._id);
      setSubcategories(subcategories.filter((s) => s._id !== deleteSubcategory._id));
      setDeleteSubcategory(null);
      toast.success("Deleted", `"${deleteSubcategory.name}" was removed`);
    } catch (error) {
      toast.error("Delete failed", getFriendlyError(error, "Couldn't delete this subcategory. Please try again."));
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingSubcategory) {
        await adminApi.updateSubcategory(editingSubcategory._id, data);
        toast.success("Updated", "Subcategory updated successfully");
      } else {
        await adminApi.createSubcategory(data);
        toast.success("Created", "New subcategory added");
      }
      setShowForm(false);
      setEditingSubcategory(null);
      fetchData();
    } catch (error: any) {
      toast.error("Save failed", getFriendlyError(error, "Couldn't save this subcategory. Please try again."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubcategory(null);
  };

  const handleDiscount = (subcategory: Subcategory) => {
    setDiscountTarget(subcategory);
    setDiscountPercent("");
  };

  const confirmDiscount = async () => {
    if (!discountTarget) return;
    const pct = Number(discountPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct >= 100) {
      toast.error("Invalid value", "Enter a percentage between 0 and 99 (0 clears the discount).");
      return;
    }
    try {
      setDiscountLoading(true);
      const res = await adminApi.applySubcategoryDiscount(discountTarget._id, pct);
      const count = res?.modified ?? 0;
      toast.success(
        pct === 0 ? "Discount cleared" : "Discount applied",
        pct === 0
          ? `Cleared discounts on ${count} product(s) in "${discountTarget.name}".`
          : `${pct}% off applied to ${count} product(s) in "${discountTarget.name}".`
      );
      setDiscountTarget(null);
      setDiscountPercent("");
    } catch (error) {
      toast.error("Failed", getFriendlyError(error, "Couldn't apply the discount. Please try again."));
    } finally {
      setDiscountLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Subcategories</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your product subcategories</p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5C2E3A] text-white rounded-xl hover:bg-[#4A2330] transition-colors font-bold text-sm shadow-sm"
          >
            <FaPlus className="w-4 h-4" />
            Add Subcategory
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingSubcategory ? "Edit Subcategory" : "Create New Subcategory"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <SubcategoryForm
            subcategory={editingSubcategory || undefined}
            categories={categories}
            allSubcategories={subcategories}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            loading={formLoading}
          />
        </div>
      ) : (
        <SubcategoriesTable
          subcategories={subcategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDiscount={handleDiscount}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteSubcategory}
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${deleteSubcategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteSubcategory(null)}
        isDanger={true}
      />

      <ConfirmModal
        isOpen={!!discountTarget}
        title="Apply Discount to Subcategory"
        message={
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Apply a percentage discount to <span className="font-black text-[#5C2E3A]">all products</span> in{" "}
              <span className="font-black text-[#5C2E3A]">{discountTarget?.name}</span>. It updates every currency price.
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
            <p className="text-xs text-gray-400">Enter 0 to remove any existing discount from this subcategory.</p>
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
