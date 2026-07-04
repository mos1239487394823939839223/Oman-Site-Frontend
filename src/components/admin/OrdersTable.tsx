"use client";

import DataTable, { Column } from "./DataTable";
import { FaEye, FaTruck, FaWarehouse, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";

interface Order {
  _id: string;
  user?: { name: string; email: string; };
  totalOrderPrice: number;
  status?: string;
  orderStatus?: string;
  createdAt: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  shippingAddress?: {
    details?: string;
    city?: string;
    phone?: string;
    name?: string;
  };
}

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onView?: (order: Order) => void;
  onStatusUpdate?: (order: Order) => void;
}

const getStatusBadge = (status: string) => {
  const map: Record<string, { color: string; label: string }> = {
    delivered:  { color: "bg-amber-100 text-amber-800", label: "تم التسليم" },
    completed:  { color: "bg-amber-100 text-amber-800", label: "مكتمل" },
    pending:    { color: "bg-yellow-100 text-yellow-800", label: "قيد الانتظار" },
    confirmed:  { color: "bg-[#5C2E3A]/10 text-[#5C2E3A]", label: "مؤكد" },
    processing: { color: "bg-blue-100 text-blue-800", label: "جاري التجهيز" },
    shipped:    { color: "bg-indigo-100 text-indigo-800", label: "تم الشحن" },
    cancelled:  { color: "bg-red-100 text-red-800", label: "ملغي" },
  };
  const cfg = map[status?.toLowerCase()] || { color: "bg-gray-100 text-gray-700", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const getDeliveryBadge = (method?: string, address?: Order["shippingAddress"]) => {
  const isPickup = method === "pickup" || (!address?.city && !address?.details);
  return isPickup ? (
    <div className="flex flex-col gap-1 items-start">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 w-fit">
        <FaWarehouse /> استلام من المصنع
      </span>
      <div className="flex flex-col text-right">
        {address?.name && <span className="text-xs font-bold text-gray-700">{address.name}</span>}
        {address?.phone && <span className="text-[10px] text-gray-400 font-mono">{address.phone}</span>}
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-1 items-start">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 w-fit">
        <FaTruck /> توصيل للمنزل
      </span>
      <div className="flex flex-col text-right">
        {address?.city && <span className="text-xs font-bold text-gray-700">{address.city}</span>}
        {address?.details && <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{address.details}</span>}
      </div>
    </div>
  );
};

const getPaymentBadge = (method?: string) => {
  const isCard = method === "card" || method === "online";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isCard ? "bg-indigo-100 text-indigo-800" : "bg-orange-100 text-orange-800"}`}>
      {isCard ? <FaCreditCard className="text-[10px]" /> : <FaMoneyBillWave className="text-[10px]" />}
      {isCard ? "بطاقة بنكية" : "عند الاستلام"}
    </span>
  );
};

export default function OrdersTable({ orders, loading = false, onView, onStatusUpdate }: OrdersTableProps) {
  const columns: Column<Order>[] = [
    {
      header: "رقم الطلب",
      accessor: (row) => (
        <span className="font-bold text-gray-800 font-mono text-sm">#{row._id.slice(-8).toUpperCase()}</span>
      ),
      sortable: true,
    },
    {
      header: "العميل",
      accessor: (row) => (
        <div>
          <div className="font-bold text-gray-900 text-sm">{row.user?.name || "زبون"}</div>
          <div className="text-xs text-gray-400">{row.user?.email || ""}</div>
        </div>
      ),
    },
    {
      header: "طريقة الاستلام",
      accessor: (row) => getDeliveryBadge(row.deliveryMethod, row.shippingAddress),
    },
    {
      header: "طريقة الدفع",
      accessor: (row) => getPaymentBadge(row.paymentMethod),
    },
    {
      header: "المبلغ",
      accessor: (row) => (
        <div>
          <span className="font-black text-[#5C2E3A] text-base">{row.totalOrderPrice?.toFixed(3)}</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: "الحالة",
      accessor: (row) => getStatusBadge(row.status || row.orderStatus || "pending"),
      sortable: true,
    },
    {
      header: "التاريخ",
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-800 font-medium">{new Date(row.createdAt).toLocaleDateString("ar-OM")}</div>
          <div className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleTimeString("ar-OM")}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "الإجراءات",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={(e) => { e.stopPropagation(); onView(row); }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#5C2E3A] hover:bg-[#4A2330] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FaEye /> عرض
            </button>
          )}
          {onStatusUpdate && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusUpdate(row); }}
              className="px-3 py-1.5 text-xs font-bold text-[#5C2E3A] border border-[#5C2E3A]/30 hover:bg-[#5C2E3A]/5 rounded-lg transition-colors"
            >
              تحديث
            </button>
          )}
        </div>
      ),
      className: "w-36",
    },
  ];

  return (
    <DataTable
      data={orders}
      columns={columns}
      loading={loading}
      emptyMessage="لا توجد طلبات"
    />
  );
}
