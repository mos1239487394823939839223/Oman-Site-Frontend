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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5C2E3A]/5 border-b-2 border-[#5C2E3A]/10">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`
                    px-5 py-4 text-right text-xs font-black text-[#5C2E3A] uppercase tracking-wider
                    ${column.sortable && onSort ? "cursor-pointer hover:bg-[#5C2E3A]/10 transition-colors" : ""}
                    ${column.className || ""}
                  `}
                  onClick={() => column.sortable && onSort && onSort(String(column.header))}
                >
                  <div className="flex items-center gap-1.5 justify-end">
                    {column.header}
                    {column.sortable && onSort && (
                      <span>
                        {getSortIcon(String(column.header)) || (
                          <FaSort className="w-3 h-3 text-[#5C2E3A]/40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || JSON.stringify(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    border-b border-gray-50 transition-colors
                    ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}
                    ${onRowClick ? 'cursor-pointer hover:bg-[#5C2E3A]/5' : 'hover:bg-gray-50'}
                  `}
                >
                  {columns.map((column, index) => (
                    <td
                      key={index}
                      className={`px-5 py-5 text-sm text-gray-800 ${column.className || ""}`}
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

