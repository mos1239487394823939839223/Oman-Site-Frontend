"use client";

import { useState, useEffect } from "react";
import BrandsTable from "@/components/admin/BrandsTable";
import BrandForm from "@/components/admin/BrandForm";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { adminApi } from "@/services/adminApi";
import { Brand } from "@/services/clientApi";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function BrandsManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllBrands();
      setBrands(response?.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => { setEditingBrand(null); setShowForm(true); };
  const handleEdit = (brand: Brand) => { setEditingBrand(brand); setShowForm(true); };
  const handleDelete = (brand: Brand) => { setDeleteBrand(brand); };

  const confirmDelete = async () => {
    if (!deleteBrand) return;
    try {
      await adminApi.deleteBrand(deleteBrand._id);
      setBrands(brands.filter(b => b._id !== deleteBrand._id));
      setDeleteBrand(null);
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Failed to delete brand");
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (editingBrand) {
        await adminApi.updateBrand(editingBrand._id, data);
      } else {
        await adminApi.createBrand(data);
      }
      setShowForm(false);
      setEditingBrand(null);
      fetchData();
    } catch (error: any) {
      console.error("Error saving brand:", error);
      alert(error.message || "Failed to save brand");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => { setShowForm(false); setEditingBrand(null); };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Brands</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your product brands</p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5C2E3A] text-white rounded-xl hover:bg-[#4A2330] transition-colors font-bold text-sm shadow-sm"
          >
            <FaPlus className="w-4 h-4" />
            Add Brand
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingBrand ? "Edit Brand" : "Create New Brand"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <BrandForm
            brand={editingBrand || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            loading={formLoading}
          />
        </div>
      ) : (
        <BrandsTable
          brands={brands}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteBrand}
        title="Delete Brand"
        message={`Are you sure you want to delete "${deleteBrand?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteBrand(null)}
        isDanger={true}
      />
    </>
  );
}
