"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/admin/StatsCard";
import {
  FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave,
  FaTags, FaImages, FaEye, FaGift
} from "react-icons/fa";
import { adminApi } from "@/services/adminApi";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "@/lib/media";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
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

      // Sort by actual creation time (newest first) rather than trusting the
      // API's array order — slice(-N).reverse() showed the OLDEST records when
      // the backend returns newest-first, so "Recent" data was inaccurate.
      const byNewest = (arr: any[]) =>
        [...arr].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

      setRecentOrders(byNewest(orders).slice(0, 3));
      setRecentProducts(byNewest(products).slice(0, 3));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { labelKey: "admin.addProduct", href: "/admin/products", icon: FaBox, color: "text-[#5C2E3A]", bg: "bg-[#5C2E3A]/10" },
    { labelKey: "admin.manageGifts", href: "/admin/gifts", icon: FaGift, color: "text-rose-500", bg: "bg-rose-50" },
    { labelKey: "admin.manageBanners", href: "/admin/banners", icon: FaImages, color: "text-blue-500", bg: "bg-blue-50" },
    { labelKey: "admin.manageOrders", href: "/admin/orders", icon: FaShoppingBag, color: "text-purple-500", bg: "bg-purple-50" },
    { labelKey: "admin.manageUsers", href: "/admin/users", icon: FaUsers, color: "text-amber-500", bg: "bg-amber-50" },
    { labelKey: "admin.editTranslations", href: "/admin/translations", icon: FaTags, color: "text-pink-500", bg: "bg-pink-50" },
    { labelKey: "admin.viewStore", href: "/", icon: FaEye, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">{t('admin.dashboardTitle')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('admin.dashboardSubtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Total Products" value={loading ? "—" : stats.totalProducts}
          icon={<FaBox className="w-5 h-5" />} color="gold" trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Total Orders" value={loading ? "—" : stats.totalOrders}
          icon={<FaShoppingBag className="w-5 h-5" />} color="purple" trend={{ value: 8, isPositive: true }} />
        <StatsCard title="Total Users" value={loading ? "—" : stats.totalUsers}
          icon={<FaUsers className="w-5 h-5" />} color="blue" trend={{ value: 5, isPositive: true }} />
        <StatsCard title="Revenue" value={loading ? "—" : `${stats.totalRevenue.toLocaleString()}`}
          icon={<FaMoneyBillWave className="w-5 h-5" />} color="gold" trend={{ value: 15, isPositive: true }} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t('admin.quickActions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-2.5 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#5C2E3A]/20 hover:bg-[#5C2E3A]/5 transition-all duration-200 group text-center shadow-sm"
            >
              <div className={`w-10 h-10 ${link.bg} ${link.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <link.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors leading-tight">{t(link.labelKey)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-sm">{t('admin.recentProducts')}</h2>
            <Link href="/admin/products" className="text-xs text-[#5C2E3A] hover:text-[#4A2330] font-semibold">{t('admin.viewAll')} →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaBox className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No products yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProducts.map((product: any) => (
                <div key={product._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <img
                    src={resolveMediaUrl(product.imageCover, "products")}
                    alt={product.title}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-xs font-semibold truncate">{product.title}</p>
                    <p className="text-gray-500 text-[11px]">{product.price}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-sm">{t('admin.recentOrders')}</h2>
            <Link href="/admin/orders" className="text-xs text-[#5C2E3A] hover:text-[#4A2330] font-semibold">{t('admin.viewAll')} →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order: any, i: number) => {
                // Backend uses `status`; older/local orders used `orderStatus`.
                // Reading only `orderStatus` made every real order show "Pending".
                const status = order.status || order.orderStatus || "pending";
                return (
                <div key={order._id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaShoppingBag className="text-purple-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-xs font-semibold truncate">Order #{(order._id || "").slice(-6).toUpperCase()}</p>
                    <p className="text-gray-500 text-[11px]">{order.totalOrderPrice || 0}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    status === "delivered"
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : status === "cancelled"
                      ? "bg-red-50 text-red-500 border-red-100"
                      : "bg-[#5C2E3A]/10 text-[#5C2E3A] border-[#5C2E3A]/15"
                  }`}>
                    {status}
                  </span>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
