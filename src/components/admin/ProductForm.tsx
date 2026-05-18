"use client";

import { useState, useEffect } from "react";
import { Product, Category, Brand, Subcategory } from "@/services/clientApi";
import LoadingSpinner from "./LoadingSpinner";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  subcategories?: Subcategory[];
  brands: Brand[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  category: string;
  subcategory?: string;
  imageCover: string;
  images: string[];
  isRecommended?: boolean;
}

export default function ProductForm({
  product,
  categories,
  subcategories,
  brands,
  onSubmit,
  onCancel,
  loading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: 0,
    priceAfterDiscount: undefined,
    quantity: 0,
    category: "",
    subcategory: "",
    imageCover: "",
    images: [],
    isRecommended: false,
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        priceAfterDiscount: product.priceAfterDiscount,
        quantity: product.quantity || 0,
        category: product.category?._id || "",
        subcategory: (product as any).subcategory?._id || (product as any).subcategory || "",
        childSubcategory: (product as any).childSubcategory || "",
        imageCover: product.imageCover || "",
        images: product.images || [],
        isRecommended: (product as any).isRecommended || false,
      });
      setImageUrls(product.images || []);
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Preserve empty string while typing for number inputs; coerce later
    const isNumberField = name === "price" || name === "quantity" || name === "priceAfterDiscount";
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? (value === "" ? (name === "priceAfterDiscount" ? undefined : 0) : parseFloat(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleImageUrlAdd = (url: string) => {
    const clean = url.trim();
    if (!clean) return;
    if (!isValidUrl(clean)) {
      setErrors((prev) => ({ ...prev, images: "Please enter a valid image URL" }));
      return;
    }
    if (imageUrls.includes(clean)) {
      setErrors((prev) => ({ ...prev, images: "This image URL is already added" }));
      return;
    }
    setErrors((prev) => ({ ...prev, images: "" }));
    setImageUrls((prev) => [...prev, clean]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, clean],
    }));
  };

  const handleImageRemove = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (formData.priceAfterDiscount !== undefined && formData.priceAfterDiscount !== null) {
      if (formData.priceAfterDiscount <= 0) {
        newErrors.priceAfterDiscount = "Discount price must be greater than 0";
      } else if (formData.priceAfterDiscount > formData.price) {
        newErrors.priceAfterDiscount = "Discount price cannot exceed price";
      }
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    // Only require category/brand if options exist
    if ((categories?.length || 0) > 0 && !formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.imageCover.trim()) {
      newErrors.imageCover = "Cover image is required";
    } else if (!isValidUrl(formData.imageCover)) {
      newErrors.imageCover = "Cover image must be a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Shape clean data
    const payload: FormData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      priceAfterDiscount:
        formData.priceAfterDiscount === undefined || formData.priceAfterDiscount === null || isNaN(Number(formData.priceAfterDiscount))
          ? undefined
          : Number(formData.priceAfterDiscount),
      quantity: Math.max(0, Number(formData.quantity)),
      category: formData.category,
      subcategory: formData.subcategory,
      patternType: (formData as any).patternType,
      imageCover: formData.imageCover.trim(),
      images: formData.images.map((u) => u.trim()),
      isRecommended: formData.isRecommended,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Product Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.title ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.description ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Price Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.price ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label
            htmlFor="priceAfterDiscount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price After Discount
          </label>
          <input
            type="number"
            id="priceAfterDiscount"
            name="priceAfterDiscount"
            value={formData.priceAfterDiscount || ""}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {errors.priceAfterDiscount && (
            <p className="mt-1 text-sm text-red-600">{errors.priceAfterDiscount}</p>
          )}
        </div>
      </div>

      {/* Quantity, Category, Brand */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.quantity ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.category ? "border-red-500" : "border-gray-300"
              }`}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              <option value="" disabled hidden>Select a category</option>
            )}
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

        <div>
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">Select a subcategory (optional)</option>
            {subcategories
              ?.filter((sub: any) => {
                const subCatId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
                return subCatId === formData.category && !sub.parent;
              })
              .map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
          </select>
        </div>

        {/* Pattern Type (Hardcoded) */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="patternType" className="block text-sm font-medium text-gray-700 mb-1">
            نوع النقش
          </label>
          <select
            id="patternType"
            name="patternType"
            value={(formData as any).patternType || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="">بدون تحديد</option>
            <option value="نقش رفيع">نقش رفيع</option>
            <option value="نقش عريض">نقش عريض</option>
          </select>
          <p className="mt-1 text-[10px] text-gray-400">سيتم استخدام هذا التقسيم لعرض المنتجات في الموقع</p>
        </div>

      </div>

      {/* Recommended Toggle */}
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <input
          type="checkbox"
          id="isRecommended"
          name="isRecommended"
          checked={formData.isRecommended}
          onChange={(e) => setFormData(prev => ({ ...prev, isRecommended: e.target.checked }))}
          className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
        />
        <label htmlFor="isRecommended" className="text-sm font-bold text-yellow-800 cursor-pointer">
          إضافة إلى "المنتجات الأكثر مبيعاً" (Best Selling Products)
        </label>
      </div>

      {/* Image Cover */}
      <div>
        <label htmlFor="imageCover" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL *
        </label>
        <input
          type="url"
          id="imageCover"
          name="imageCover"
          value={formData.imageCover}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.imageCover ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.imageCover && (
          <p className="mt-1 text-sm text-red-600">{errors.imageCover}</p>
        )}
        {formData.imageCover && (
          <img
            src={formData.imageCover}
            alt="Cover preview"
            className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>

      {/* Additional Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Images
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            placeholder="Add image URL"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleImageUrlAdd(newImageUrl);
                setNewImageUrl("");
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleImageUrlAdd(newImageUrl);
              setNewImageUrl("");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Add
          </button>
        </div>
        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => handleImageRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
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
          {product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}


