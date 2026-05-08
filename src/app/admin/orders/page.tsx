"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import OrdersTable from "@/components/admin/OrdersTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { adminApi } from "@/services/adminApi";

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
  cartItems?: any[];
}

function OrdersManagementContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

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
    // You can add a detailed order view modal here
    console.log("View order:", order);
    alert(`Order Details:\nID: ${order._id}\nCustomer: ${order.user?.name || "N/A"}\nAmount: $${order.totalOrderPrice}\nStatus: ${order.orderStatus}`);
  };

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await adminApi.updateOrderStatus(selectedOrder._id, newStatus);
      fetchData(); // Refresh list
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus("");
    } catch (error: any) {
      console.error("Error updating order status:", error);
      alert(error.message || "Failed to update order status");
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
              <p className="text-gray-600 mt-1">View and manage all orders</p>
            </div>

            {/* Orders Table */}
            <OrdersTable
              orders={orders}
              loading={loading}
              onView={handleView}
              onStatusUpdate={handleStatusUpdate}
            />

            {/* Status Update Modal */}
            <ConfirmModal
              isOpen={showStatusModal}
              title="Update Order Status"
              message={
                <div className="space-y-4">
                  <p>Select new status for order #{selectedOrder?._id.slice(-8)}:</p>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              }
              confirmText="Update"
              cancelText="Cancel"
              onConfirm={confirmStatusUpdate}
              onCancel={() => {
                setShowStatusModal(false);
                setSelectedOrder(null);
                setNewStatus("");
              }}
              isDanger={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function OrdersManagementPage() {
  return (
    <AdminRouteGuard>
      <OrdersManagementContent />
    </AdminRouteGuard>
  );
}

