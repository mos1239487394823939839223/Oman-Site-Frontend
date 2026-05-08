"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import StatsCard from "@/components/admin/StatsCard";
import { ToastProvider } from "@/components/admin/ToastProvider";
import {
  FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave,
  FaTags, FaImages, FaEye, FaCheckCircle
} from "react-icons/fa";
import { adminApi } from "@/services/adminApi";
import Link from "next/link";

function AdminDashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        adminApi.getAllProducts().catch(() => ({ data: [] })),
        adminApi.getAllOrders().catch(() => ({ data: [] })),
        adminApi.getAllUsers().catch(() => ({ data: [] })),
      ]);

      const products = productsRes?.data || [];
      const orders = ordersRes?.data || [];
      const users = usersRes?.data || [];
      const revenue = orders.reduce((sum: number, o: any) => sum + (o.totalOrderPrice || 0), 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue: revenue,
      });

      setRecentOrders(orders.slice(-5).reverse());
      setRecentProducts(products.slice(-6).reverse());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { label: "Add Product", href: "/admin/products", icon: FaBox, color: "text-[#c5a059]", bg: "bg-[#c5a059]/10" },
    { label: "Manage Banners", href: "/admin/banners", icon: FaImages, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "View Orders", href: "/admin/orders", icon: FaShoppingBag, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Manage Users", href: "/admin/users", icon: FaUsers, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Edit Translations", href: "/admin/translations", icon: FaTags, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "View Store", href: "/", icon: FaEye, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-5 lg:p-8 min-h-screen overflow-x-hidden">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Products" value={loading ? "—" : stats.totalProducts}
              icon={<FaBox className="w-5 h-5" />} color="gold" trend={{ value: 12, isPositive: true }} />
            <StatsCard title="Total Orders" value={loading ? "—" : stats.totalOrders}
              icon={<FaShoppingBag className="w-5 h-5" />} color="purple" trend={{ value: 8, isPositive: true }} />
            <StatsCard title="Total Users" value={loading ? "—" : stats.totalUsers}
              icon={<FaUsers className="w-5 h-5" />} color="blue" trend={{ value: 5, isPositive: true }} />
            <StatsCard title="Revenue" value={loading ? "—" : `${stats.totalRevenue.toLocaleString()} OMR`}
              icon={<FaMoneyBillWave className="w-5 h-5" />} color="green" trend={{ value: 15, isPositive: true }} />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2.5 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/[0.06] transition-all duration-200 group text-center"
                >
                  <div className={`w-10 h-10 ${link.bg} ${link.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Products */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-white text-sm">Recent Products</h2>
                <Link href="/admin/products" className="text-xs text-[#c5a059] hover:text-[#e6c35f] font-bold">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <FaBox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No products yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProducts.map((product: any) => (
                    <div key={product._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <img
                        src={product.imageCover || '/placeholder.svg'}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">{product.title}</p>
                        <p className="text-gray-500 text-[11px]">{product.price} OMR</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-white text-sm">Recent Orders</h2>
                <Link href="/admin/orders" className="text-xs text-[#c5a059] hover:text-[#e6c35f] font-bold">View All →</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <FaShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order: any, i: number) => (
                    <div key={order._id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaShoppingBag className="text-purple-400 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-bold truncate">Order #{(order._id || "").slice(-6).toUpperCase()}</p>
                        <p className="text-gray-500 text-[11px]">{order.totalOrderPrice || 0} OMR</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        order.orderStatus === "delivered"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : order.orderStatus === "cancelled"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {order.orderStatus || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
