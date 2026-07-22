"use client";

import { useState, useEffect } from "react";
import { Product, Category, Brand, Subcategory } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import {
  SUPPORTED_CURRENCIES,
  CURRENCIES,
  CurrencyCode,
  BASE_CURRENCY,
} from "@/lib/currency";
import LoadingSpinner from "./LoadingSpinner";

type CurrencyRow = { amount: string; discount: string };

const emptyCurrencyRows = (): Record<CurrencyCode, CurrencyRow> =>
  SUPPORTED_CURRENCIES.reduce((acc, code) => {
    acc[code] = { amount: "", discount: "" };
    return acc;
  }, {} as Record<CurrencyCode, CurrencyRow>);

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  subcategories?: Subcategory[];
  brands: Brand[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  /** Gifts use the same schema as products; price is always 0 on the backend */
  isGift?: boolean;
}

interface ProductFormState {
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  couponCode?: string;
  quantity: number;
  category: string;
  brand: string;
  subcategory?: string;
  bestSeller?: boolean;
}

export default function ProductForm({
  product,
  categories,
  subcategories,
  brands,
  onSubmit,
  onCancel,
  loading = false,
  isGift = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormState>({
    title: "",
    description: "",
    price: isGift ? 0 : 0,
    priceAfterDiscount: undefined,
    couponCode: "",
    quantity: 0,
    category: "",
    brand: "",
    subcategory: "",
    bestSeller: false,
  });

  const [currentImageCover, setCurrentImageCover] = useState<string>("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [imageCoverFile, setImageCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Per-currency prices (products only). OMR is the required base currency.
  const [currencyPrices, setCurrencyPrices] = useState<Record<CurrencyCode, CurrencyRow>>(
    emptyCurrencyRows()
  );

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        priceAfterDiscount: product.priceAfterDiscount,
        couponCode: (product as any).couponCode || "",
        quantity: product.quantity || 0,
        category: product.category?._id || "",
        brand: product.brand?._id || "",
        subcategory: (product as any).subCategories?.[0]?._id || (product as any).subCategories?.[0] || "",
        bestSeller: (product as any).bestSeller || false,
      });
      setCurrentImageCover(product.imageCover || "");
      setCurrentImages(product.images || []);

      // Seed per-currency rows from product.prices, falling back to the legacy
      // base price for OMR on older products that predate multi-currency.
      const rows = emptyCurrencyRows();
      const entries = (product as any).prices;
      if (Array.isArray(entries) && entries.length) {
        for (const p of entries) {
          if (rows[p.currency as CurrencyCode]) {
            rows[p.currency as CurrencyCode] = {
              amount: p.amount != null ? String(p.amount) : "",
              discount: p.amountAfterDiscount != null ? String(p.amountAfterDiscount) : "",
            };
          }
        }
      } else if (product.price) {
        rows[BASE_CURRENCY] = {
          amount: String(product.price),
          discount: product.priceAfterDiscount != null ? String(product.priceAfterDiscount) : "",
        };
      }
      setCurrencyPrices(rows);
    }
  }, [product]);

  const handleCurrencyChange = (
    code: CurrencyCode,
    field: "amount" | "discount",
    value: string
  ) => {
    setCurrencyPrices((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }));
    if (errors[`price_${code}`]) {
      setErrors((prev) => ({ ...prev, [`price_${code}`]: "" }));
    }
  };

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

  const handleImageCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageCoverFile(file);
    if (file && errors.imageCover) {
      setErrors((prev) => ({ ...prev, imageCover: "" }));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
    if (files.length && errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (isGift && formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (!isGift) {
      const omr = currencyPrices[BASE_CURRENCY];
      if (!omr.amount || Number(omr.amount) <= 0) {
        newErrors[`price_${BASE_CURRENCY}`] = "OMR price is required and must be greater than 0";
      }
      for (const code of SUPPORTED_CURRENCIES) {
        const row = currencyPrices[code];
        if (row.amount !== "" && Number(row.amount) < 0) {
          newErrors[`price_${code}`] = "Price cannot be negative";
        }
        if (row.discount !== "") {
          if (Number(row.discount) <= 0) {
            newErrors[`price_${code}`] = "Discount must be greater than 0";
          } else if (row.amount !== "" && Number(row.discount) >= Number(row.amount)) {
            newErrors[`price_${code}`] = "Discount must be less than the price";
          }
        }
      }
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    // Only require category/brand if options exist
    if ((categories?.length || 0) > 0 && !formData.category) {
      newErrors.category = "Category is required";
    }
    if (!isGift && !formData.brand) {
      newErrors.brand = "Brand is required";
    }
    if (!product && !imageCoverFile) {
      newErrors.imageCover = "Cover image file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = new FormData();
    const isEdit = !!product;

    // Original values to diff against
    const origTitle = product?.title || "";
    const origDesc = product?.description || "";
    const origCouponCode = (product as any)?.couponCode || "";
    const origQty = product?.quantity ?? 0;
    const origCategory = product?.category?._id || "";
    const origBrand = product?.brand?._id || "";
    const origSubcategory = (product as any)?.subCategories?.[0]?._id
      || (product as any)?.subCategories?.[0] || "";
    const origBestSeller = (product as any)?.bestSeller || false;

    if (!isEdit || formData.title.trim() !== origTitle)
      payload.append("title", formData.title.trim());

    if (!isEdit || formData.description.trim() !== origDesc)
      payload.append("description", formData.description.trim());

    if (isGift) {
      if (!isEdit) payload.append("price", "0");
    } else {
      // Multi-currency: send the full per-currency `prices` array. The backend
      // derives the base OMR `price`/`priceAfterDiscount` from the OMR entry.
      const pricesPayload = SUPPORTED_CURRENCIES
        .filter((code) => currencyPrices[code].amount !== "" && !isNaN(Number(currencyPrices[code].amount)))
        .map((code) => {
          const amount = Number(currencyPrices[code].amount);
          const d = currencyPrices[code].discount;
          const amountAfterDiscount = d !== "" && !isNaN(Number(d)) ? Number(d) : undefined;
          return {
            currency: code,
            amount,
            ...(amountAfterDiscount !== undefined ? { amountAfterDiscount } : {}),
          };
        });
      payload.append("prices", JSON.stringify(pricesPayload));
    }

    if (!isEdit || Number(formData.quantity) !== origQty)
      payload.append("quantity", String(Math.max(0, Number(formData.quantity))));

    if (!isEdit || formData.category !== origCategory)
      payload.append("category", formData.category);

    if (formData.brand && (!isEdit || formData.brand !== origBrand))
      payload.append("brand", formData.brand);

    if (!isGift) {
      const newCouponCode = (formData.couponCode || "").trim();
      if (!isEdit) {
        if (newCouponCode) payload.append("couponCode", newCouponCode);
      } else if (newCouponCode !== origCouponCode) {
        payload.append("couponCode", newCouponCode);
      }
    }

    if (formData.subcategory && (!isEdit || formData.subcategory !== origSubcategory))
      payload.append("subCategories", formData.subcategory);

    if (!isGift && (!isEdit || formData.bestSeller !== origBestSeller))
      payload.append("bestSeller", String(formData.bestSeller ?? false));

    if (imageCoverFile) payload.append("imageCover", imageCoverFile);
    galleryFiles.forEach((file) => payload.append("images", file));

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          {isGift ? "Gift Title" : "Product Title"} *
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

      {isGift && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Gifts are always free — price is set to 0 automatically on the server.
        </p>
      )}

      {/* Price Fields (products only) — one row per currency */}
      {!isGift && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Prices by currency</p>
            <span className="text-xs text-gray-400">OMR is required; others optional</span>
          </div>
          <div className="hidden md:grid md:grid-cols-[90px_1fr_1fr] gap-3 px-1 text-xs font-semibold text-gray-500">
            <span>Currency</span>
            <span>Price</span>
            <span>Price after discount</span>
          </div>
          {SUPPORTED_CURRENCIES.map((code) => {
            const meta = CURRENCIES[code];
            const isBase = code === BASE_CURRENCY;
            return (
              <div key={code}>
                <div className="grid grid-cols-2 md:grid-cols-[90px_1fr_1fr] gap-3 items-center">
                  <div className="col-span-2 md:col-span-1 flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span>{code}</span>
                    <span className="text-gray-400">{meta.symbol}</span>
                    {isBase && <span className="text-red-500">*</span>}
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label={`${code} price`}
                    value={currencyPrices[code].amount}
                    onChange={(e) => handleCurrencyChange(code, "amount", e.target.value)}
                    min="0"
                    step="0.001"
                    placeholder={`Price (${code})`}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                      errors[`price_${code}`] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label={`${code} price after discount`}
                    value={currencyPrices[code].discount}
                    onChange={(e) => handleCurrencyChange(code, "discount", e.target.value)}
                    min="0"
                    step="0.001"
                    placeholder="Discount (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                {errors[`price_${code}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`price_${code}`]}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isGift && (
        <div>
          <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code
          </label>
          <input
            type="text"
            id="couponCode"
            name="couponCode"
            value={formData.couponCode || ""}
            onChange={handleChange}
            autoComplete="off"
            placeholder="e.g. SAVE10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      )}

      {/* Quantity, Category, Brand */}
      <div className={`grid grid-cols-1 gap-4 ${isGift ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
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
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand {isGift ? "" : "*"}
          </label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.brand ? "border-red-500" : "border-gray-300"}`}
          >
            {brands.length === 0 ? (
              <option value="">No brands available</option>
            ) : (
              <option value="" disabled hidden>Select a brand</option>
            )}
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
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
      </div>

      {!isGift && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <input
            type="checkbox"
            id="bestSeller"
            name="bestSeller"
            checked={formData.bestSeller}
            onChange={(e) => setFormData(prev => ({ ...prev, bestSeller: e.target.checked }))}
            className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
          />
          <label htmlFor="bestSeller" className="text-sm font-bold text-yellow-800 cursor-pointer">
            إضافة إلى "المنتجات الأكثر مبيعاً" (Best Selling Products)
          </label>
        </div>
      )}

      {/* Image Cover */}
      <div>
        <label htmlFor="imageCover" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image {product ? "" : "*"}
        </label>
        <input
          type="file"
          id="imageCover"
          name="imageCover"
          accept="image/*"
          onChange={handleImageCoverChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.imageCover ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.imageCover && (
          <p className="mt-1 text-sm text-red-600">{errors.imageCover}</p>
        )}
        {currentImageCover && (
          <img
            src={resolveMediaUrl(currentImageCover, "products")}
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
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
        <div className="flex flex-wrap gap-2">
          {currentImages.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={resolveMediaUrl(url, "products")}
                alt={`Product ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
          {galleryFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="px-2 py-1 text-xs bg-gray-100 rounded-lg text-gray-700">
              {file.name}
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
          {product
            ? isGift
              ? "Update Gift"
              : "Update Product"
            : isGift
              ? "Create Gift"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}


