"use client";

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  color?: "gold" | "green" | "blue" | "purple" | "red";
}

const colorMap = {
  gold: {
    border: "border-[#5C2E3A]/20",
    icon: "bg-[#5C2E3A]/10 text-[#5C2E3A]",
    trend: "text-[#5C2E3A]",
    accent: "bg-[#5C2E3A]",
  },
  green: {
    border: "border-amber-100",
    icon: "bg-amber-50 text-amber-600",
    trend: "text-amber-600",
    accent: "bg-amber-500",
  },
  blue: {
    border: "border-blue-100",
    icon: "bg-blue-50 text-blue-600",
    trend: "text-blue-600",
    accent: "bg-blue-500",
  },
  purple: {
    border: "border-purple-100",
    icon: "bg-purple-50 text-purple-600",
    trend: "text-purple-600",
    accent: "bg-purple-500",
  },
  red: {
    border: "border-red-100",
    icon: "bg-red-50 text-red-600",
    trend: "text-red-600",
    accent: "bg-red-500",
  },
};

export default function StatsCard({ title, value, icon, trend, subtitle, color = "gold" }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className={`relative overflow-hidden bg-white border ${c.border} rounded-2xl p-6 shadow-[0_2px_10px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.02] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]`}>
      {/* Left accent bar for stronger visual separation between cards */}
      <span className={`absolute left-0 top-0 h-full w-1.5 ${c.accent}`} />
      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2.5">{title}</p>
          <p className="text-gray-900 text-3xl font-black tracking-tight">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1.5">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-3 text-xs font-bold ${c.trend}`}>
              <span>{trend.isPositive ? "▲" : "▼"}</span>
              <span>{trend.value}% this month</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 ${c.icon} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
