"use client";

import { Category } from "@/services/clientApi";
import DataTable, { Column } from "./DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";

interface CategoriesTableProps {
  categories: Category[];
  loading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export default function CategoriesTable({
  categories,
  loading = false,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  const columns: Column<Category>[] = [
    {
      header: "Image",
      accessor: (row) => (
        <img
          src={row.image || "/placeholder.svg"}
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
      header: "Slug",
      accessor: "slug",
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
      className: "w-24",
    },
  ];

  return (
    <DataTable
      data={categories}
      columns={columns}
      loading={loading}
      emptyMessage="No categories found. Click 'Add Category' to create your first category."
    />
  );
}

