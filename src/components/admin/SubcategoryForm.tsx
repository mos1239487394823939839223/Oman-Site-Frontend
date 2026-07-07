"use client";

import { useState, useEffect } from "react";
import { Subcategory, Category } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import LoadingSpinner from "./LoadingSpinner";

interface SubcategoryFormProps {
  subcategory?: Subcategory;
  categories: Category[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  allSubcategories?: Subcategory[];
}
interface SubcategoryFormState {
  name: string;
  category: string;
}

export default function SubcategoryForm({
  subcategory,
  categories,
  allSubcategories = [],
  onSubmit,
  onCancel,
  loading = false,
}: SubcategoryFormProps) {
  const [formData, setFormData] = useState<SubcategoryFormState>({
    name: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || "",
        category: typeof subcategory.category === "string"
          ? subcategory.category
          : (subcategory.category as any)?._id || "",
      });
      setCurrentImage(subcategory.image || "");
    }
  }, [subcategory]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Subcategory name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const isEdit = !!subcategory;
    const origName = subcategory?.name || "";
    const origCategory = typeof subcategory?.category === "string"
      ? subcategory.category
      : (subcategory?.category as any)?._id || "";

    const payload = new FormData();
    if (!isEdit || formData.name.trim() !== origName) payload.append("name", formData.name.trim());
    if (!isEdit || formData.category !== origCategory) payload.append("category", formData.category);
    if (imageFile) payload.append("image", imageFile);

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Subcategory Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.name ? "border-red-500" : "border-gray-300"
            }`}
          placeholder="Enter subcategory name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.category ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Subcategory Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        <p className="mt-1 text-xs text-gray-400">
          {subcategory ? "Leave empty to keep the current image." : "Optional — shown on the storefront subcategory filter."}
        </p>
        {currentImage && (
          <img
            src={resolveMediaUrl(currentImage, "subcategories")}
            alt="Subcategory preview"
            className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <LoadingSpinner size="sm" />}
          {subcategory ? "Update Subcategory" : "Create Subcategory"}
        </button>
      </div>
    </form>
  );
}
