"use client";

import { useState, useEffect } from "react";
import { Brand } from "@/services/clientApi";
import LoadingSpinner from "./LoadingSpinner";

interface BrandFormProps {
  brand?: Brand;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  image: string;
  slug?: string;
}

export default function BrandForm({
  brand,
  onSubmit,
  onCancel,
  loading = false,
}: BrandFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    image: "",
    slug: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        image: brand.image || "",
        slug: brand.slug || "",
      });
    }
  }, [brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name
      ...(name === "name" && {
        slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }),
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Brand name is required";
    }

    if (!formData.image.trim()) {
      newErrors.image = "Brand image URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Brand Name *
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
          placeholder="Enter brand name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="brand-slug (auto-generated from name)"
        />
        <p className="mt-1 text-xs text-gray-500">Auto-generated from name if left empty</p>
      </div>

      {/* Image */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Brand Image URL *
        </label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/brand-image.jpg"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${
            errors.image ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        {formData.image && (
          <img
            src={formData.image}
            alt="Brand preview"
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
          {brand ? "Update Brand" : "Create Brand"}
        </button>
      </div>
    </form>
  );
}


