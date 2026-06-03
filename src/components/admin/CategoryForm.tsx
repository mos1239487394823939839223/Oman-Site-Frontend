"use client";

import { useState, useEffect } from "react";
import { Category } from "@/services/clientApi";
import LoadingSpinner from "./LoadingSpinner";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface CategoryFormState {
  name: string;
}

export default function CategoryForm({
  category,
  onSubmit,
  onCancel,
  loading = false,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormState>({
    name: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
      });
      setCurrentImage(category.image || "");
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      newErrors.name = "Category name is required";
    }

    if (!category && !imageFile) {
      newErrors.image = "Category image file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    const isEdit = !!category;

    if (!isEdit || formData.name.trim() !== (category.name || "")) {
      payload.append("name", formData.name.trim());
    }
    if (imageFile) {
      payload.append("image", imageFile);
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter category name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Category Image {category ? "" : "*"}
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${
            errors.image ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        {currentImage && (
          <img
            src={currentImage}
            alt="Category preview"
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
          {category ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  );
}


