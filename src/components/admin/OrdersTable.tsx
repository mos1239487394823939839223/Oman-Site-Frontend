"use client";

import DataTable, { Column } from "./DataTable";
import { FaEye, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  totalOrderPrice: number;
  orderStatus: string;
  createdAt: string;
  paymentMethod?: string;
  shippingAddress?: {
    details: string;
    city: string;
  };
}

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onView?: (order: Order) => void;
  onStatusUpdate?: (order: Order) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    delivered: {
      color: "bg-primary/10 text-green-800",
      icon: <FaCheckCircle className="w-4 h-4" />,
    },
    completed: {
      color: "bg-primary/10 text-green-800",
      icon: <FaCheckCircle className="w-4 h-4" />,
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <FaClock className="w-4 h-4" />,
    },
    cancelled: {
      color: "bg-red-100 text-red-800",
      icon: <FaTimesCircle className="w-4 h-4" />,
    },
  };

  const config = statusConfig[status.toLowerCase()] || {
    color: "bg-gray-100 text-gray-800",
    icon: <FaClock className="w-4 h-4" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

export default function OrdersTable({
  orders,
  loading = false,
  onView,
  onStatusUpdate,
}: OrdersTableProps) {
  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessor: (row) => (
        <span className="font-medium text-gray-900">#{row._id.slice(-8)}</span>
      ),
      sortable: true,
    },
    {
      header: "Customer",
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.user?.name || "Guest"}
          </div>
          <div className="text-xs text-gray-500">{row.user?.email || ""}</div>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: (row) => (
        <span className="font-medium text-gray-900">
          ${row.totalOrderPrice?.toFixed(2) || "0.00"}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.orderStatus),
      sortable: true,
    },
    {
      header: "Payment",
      accessor: (row) => (
        <span className="text-sm text-gray-600 capitalize">
          {row.paymentMethod || "N/A"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
      sortable: true,
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
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
            >
              <FaEye className="w-4 h-4" />
              View
            </button>
          )}
          {onStatusUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(row);
              }}
              className="px-3 py-1 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              Update
            </button>
          )}
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      loading={loading}
      emptyMessage="No orders found"
    />
  );
}

