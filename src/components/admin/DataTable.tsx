"use client";

import { ReactNode } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
}

export default function DataTable<T extends { _id?: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  const renderCell = (column: Column<T>, row: T) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return String(row[column.accessor] ?? "");
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey || !onSort) return null;
    if (sortDirection === "asc") {
      return <FaSortUp className="w-4 h-4 ml-1" />;
    }
    return <FaSortDown className="w-4 h-4 ml-1" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.sortable && onSort ? "cursor-pointer hover:bg-gray-100" : ""}
                    ${column.className || ""}
                  `}
                  onClick={() => column.sortable && onSort && onSort(String(column.header))}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && onSort && (
                      <span className="ml-1">
                        {getSortIcon(String(column.header)) || (
                          <FaSort className="w-3 h-3 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row._id || JSON.stringify(row)}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                >
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ""}`}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

