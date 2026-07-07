"use client";

import { Brand } from "@/services/clientApi";
import DataTable, { Column } from "./DataTable";
import { FaEdit, FaTrash } from "react-icons/fa";

interface BrandsTableProps {
  brands: Brand[];
  loading?: boolean;
  onEdit?: (brand: Brand) => void;
  onDelete?: (brand: Brand) => void;
}

export default function BrandsTable({
  brands,
  loading = false,
  onEdit,
  onDelete,
}: BrandsTableProps) {
  const columns: Column<Brand>[] = [
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
      data={brands}
      columns={columns}
      loading={loading}
      emptyMessage="No brands found. Click 'Add Brand' to create your first brand."
    />
  );
}

