"use client";

import { useState } from "react";
import { Product } from "@/services/clientApi";
import DataTable, { Column } from "./DataTable";
import { FaEdit, FaTrash, FaImage, FaBox } from "react-icons/fa";

interface ProductsTableProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export default function ProductsTable({
  products,
  loading = false,
  onEdit,
  onDelete,
  onView,
}: ProductsTableProps) {
  const columns: Column<Product>[] = [
    {
      header: "Image",
      accessor: (row) => (
        <div className="flex items-center">
          <img
            src={row.imageCover || "/placeholder.svg"}
            alt={row.title}
            className="w-12 h-12 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
      ),
      className: "w-20",
    },
    {
      header: "Product",
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500">{row.category?.name || "N/A"}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Price",
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            ${row.priceAfterDiscount || row.price}
          </div>
          {row.priceAfterDiscount && (
            <div className="text-xs text-gray-400 line-through">
              ${row.price}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Stock",
      accessor: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.quantity > 10
              ? "bg-primary/10 text-amber-800"
              : row.quantity > 0
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.quantity} units
        </span>
      ),
      sortable: true,
    },
    {
      header: "Sold",
      accessor: "sold",
      sortable: true,
    },
    {
      header: "Rating",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="text-sm font-medium">
            {row.ratingsAverage?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-gray-500">
            ({row.ratingsQuantity || 0})
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(row);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <FaBox className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Edit"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      loading={loading}
      emptyMessage="No products found. Click 'Add Product' to create your first product."
    />
  );
}

