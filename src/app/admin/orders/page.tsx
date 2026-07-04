"use client";

import { useState, useEffect } from "react";
import OrdersTable from "@/components/admin/OrdersTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import { adminApi } from "@/services/adminApi";

interface Order {
  _id: string;
  user?: { name: string; email: string; };
  totalOrderPrice: number;
  status?: string;
  orderStatus?: string;
  createdAt: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  shippingAddress?: { details?: string; city?: string; phone?: string; name?: string; };
  cartItems?: any[];
}

/** Backend uses `status`; older/local orders used `orderStatus`. */
const orderStatusOf = (o: Order) => o.status || o.orderStatus || "pending";

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllOrders();
      setOrders(response?.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(orderStatusOf(order));
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await adminApi.updateOrderStatus(selectedOrder._id, newStatus);
      fetchData();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error: any) {
      setErrorMessage(error.message || "فشل تحديث الحالة");
    }
  };

  const handleOpenStatusFromModal = () => {
    if (!selectedOrder) return;
    setNewStatus(orderStatusOf(selectedOrder));
    setShowStatusModal(true);
    setShowOrderModal(false);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalOrderPrice || 0), 0);
  const pendingCount = orders.filter(o => orderStatusOf(o) === "pending").length;

  const statusOptions = [
    { value: "pending",    label: "قيد الانتظار" },
    { value: "confirmed",  label: "مؤكد" },
    { value: "processing", label: "جاري التجهيز" },
    { value: "shipped",    label: "تم الشحن" },
    { value: "delivered",  label: "تم التسليم" },
    { value: "cancelled",  label: "ملغي" },
  ];

  return (
    <div dir="rtl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-black text-[#5C2E3A] uppercase tracking-widest mb-1">لوحة التحكم</p>
          <h1 className="text-2xl font-black text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-500 mt-1 text-sm">عرض وإدارة جميع طلبات العملاء</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5C2E3A] text-white rounded-xl font-bold text-sm hover:bg-[#4A2330] transition-colors shadow-sm"
        >
          ↻ تحديث القائمة
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#5C2E3A]/10 flex items-center justify-center text-xl">📦</div>
          <div>
            <p className="text-xs text-gray-500 font-bold tracking-wider">إجمالي الطلبات</p>
            <p className="text-2xl font-black text-gray-900">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-xl">⏳</div>
          <div>
            <p className="text-xs text-gray-500 font-bold tracking-wider">قيد الانتظار</p>
            <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-xl">💰</div>
          <div>
            <p className="text-xs text-gray-500 font-bold tracking-wider">إجمالي الإيرادات</p>
            <p className="text-2xl font-black text-amber-600">
              {totalRevenue.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        loading={loading}
        onView={handleView}
        onStatusUpdate={handleStatusUpdate}
      />

      <OrderDetailsModal
        isOpen={showOrderModal}
        order={selectedOrder}
        isLoading={loading}
        onClose={() => setShowOrderModal(false)}
        onPrint={() => window.print()}
        onUpdateStatus={handleOpenStatusFromModal}
      />

      {/* Status Update Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        title="تحديث حالة الطلب"
        message={
          <div className="space-y-4" dir="rtl">
            <p className="text-gray-600 text-sm">
              اختر الحالة الجديدة للطلب{" "}
              <span className="font-black text-[#5C2E3A]">#{selectedOrder?._id.slice(-8)}</span>:
            </p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5C2E3A]/30/30 focus:border-[#5C2E3A]/60 outline-none font-bold text-gray-900 bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        }
        confirmText="تحديث الحالة"
        cancelText="إلغاء"
        onConfirm={confirmStatusUpdate}
        onCancel={() => { setShowStatusModal(false); setSelectedOrder(null); setNewStatus(""); }}
        isDanger={false}
      />
    </div>
  );
}
