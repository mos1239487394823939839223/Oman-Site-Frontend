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
    <div className={`relative overflow-hidden bg-white border ${c.border} rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
          <p className="text-gray-900 text-3xl font-black tracking-tight">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${c.trend}`}>
              <span>{trend.isPositive ? "▲" : "▼"}</span>
              <span>{trend.value}% this month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
