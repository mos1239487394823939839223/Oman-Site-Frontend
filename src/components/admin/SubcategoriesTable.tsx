"use client";

import { Subcategory } from "@/services/clientApi";
import { resolveMediaUrl } from "@/lib/media";
import DataTable, { Column } from "./DataTable";
import { FaEdit, FaTrash, FaPercent } from "react-icons/fa";

interface SubcategoriesTableProps {
  subcategories: Subcategory[];
  loading?: boolean;
  onEdit?: (subcategory: Subcategory) => void;
  onDelete?: (subcategory: Subcategory) => void;
  onDiscount?: (subcategory: Subcategory) => void;
}

export default function SubcategoriesTable({
  subcategories,
  loading = false,
  onEdit,
  onDelete,
  onDiscount,
}: SubcategoriesTableProps) {
  const columns: Column<Subcategory>[] = [
    {
      header: "Image",
      accessor: (row) => (
        <img
          src={resolveMediaUrl(row.image, "subcategories")}
          alt={row.name}
          className="w-12 h-12 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      ),
      className: "w-20",
    },
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Category",
      accessor: (row: any) => {
        const cat1 = typeof row.category === "object" && row.category !== null ? row.category.name : "N/A";
        const cat2 = row.category2 ? " + (Second Category)" : "";
        return (
          <span className="text-sm text-gray-600">
            {cat1}{cat2}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Created",
      accessor: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {onDiscount && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDiscount(row);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#B8902F] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 rounded-lg transition-colors whitespace-nowrap"
              title="Apply a discount to all products in this subcategory"
            >
              <FaPercent className="w-3 h-3" /> خصم
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
      className: "w-44",
    },
  ];

  return (
    <DataTable
      data={subcategories}
      columns={columns}
      loading={loading}
      emptyMessage="No subcategories found. Click 'Add Subcategory' to create your first subcategory."
    />
  );
}

