"use client";

import { useState, useEffect } from "react";
import SubcategoriesTable from "@/components/admin/SubcategoriesTable";
import SubcategoryForm from "@/components/admin/SubcategoryForm";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { adminApi } from "@/services/adminApi";
import { getCategories, Category, Subcategory } from "@/services/clientApi";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function SubcategoriesManagementPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deleteSubcategory, setDeleteSubcategory] = useState<Subcategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("Failed to delete subcategory");
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingSubcategory) {
        await adminApi.updateSubcategory(editingSubcategory._id, data);
      } else {
        await adminApi.createSubcategory(data);
      }
      setShowForm(false);
      setEditingSubcategory(null);
      fetchData();
    } catch (error: any) {
      console.error("Error saving subcategory:", error);
      alert(error.message || "Failed to save subcategory");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubcategory(null);
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
    </>
  );
}
