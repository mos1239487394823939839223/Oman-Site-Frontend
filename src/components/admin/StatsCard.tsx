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
    bg: "from-[#c5a059]/20 to-[#c5a059]/5",
    icon: "bg-[#c5a059]/20 text-[#c5a059]",
    trend: "text-[#c5a059]",
    border: "border-[#c5a059]/20",
  },
  green: {
    bg: "from-emerald-500/20 to-emerald-500/5",
    icon: "bg-emerald-500/20 text-emerald-400",
    trend: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  blue: {
    bg: "from-blue-500/20 to-blue-500/5",
    icon: "bg-blue-500/20 text-blue-400",
    trend: "text-blue-400",
    border: "border-blue-500/20",
  },
  purple: {
    bg: "from-purple-500/20 to-purple-500/5",
    icon: "bg-purple-500/20 text-purple-400",
    trend: "text-purple-400",
    border: "border-purple-500/20",
  },
  red: {
    bg: "from-red-500/20 to-red-500/5",
    icon: "bg-red-500/20 text-red-400",
    trend: "text-red-400",
    border: "border-red-500/20",
  },
};

export default function StatsCard({ title, value, icon, trend, subtitle, color = "gold" }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
          <p className="text-white text-3xl font-black tracking-tight">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
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
