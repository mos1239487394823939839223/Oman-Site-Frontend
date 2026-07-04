"use client";

import DataTable, { Column } from "./DataTable";
import { User } from "@/services/clientApi";
import { FaEdit, FaTrash, FaUserCheck, FaUserTimes } from "react-icons/fa";

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleActive?: (user: User) => void;
}

export default function UsersTable({
  users,
  loading = false,
  onEdit,
  onDelete,
  onToggleActive,
}: UsersTableProps) {
  const columns: Column<User>[] = [
    {
      header: "Name",
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Phone",
      accessor: "phone",
      sortable: true,
    },
    {
      header: "Role",
      accessor: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.role === "admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.role || "user"}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.active
              ? "bg-primary/10 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Joined",
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
          {onToggleActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(row);
              }}
              className={`p-2 rounded-lg transition-colors ${
                row.active
                  ? "text-red-600 hover:bg-red-50"
                  : "text-primary hover:bg-primary/5"
              }`}
              title={row.active ? "Deactivate" : "Activate"}
            >
              {row.active ? (
                <FaUserTimes className="w-4 h-4" />
              ) : (
                <FaUserCheck className="w-4 h-4" />
              )}
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
      data={users}
      columns={columns}
      loading={loading}
      emptyMessage="No users found"
    />
  );
}

