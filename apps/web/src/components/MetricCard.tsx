"use client";
import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down";
  trendValue?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
}: MetricCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-500"
      : "text-gray-400";

  const trendSymbol = trend === "up" ? "▲" : trend === "down" ? "▼" : "";

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col justify-between">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-800 mt-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      {trendValue && (
        <div className={`text-xs mt-1 ${trendColor}`}>
          {trendSymbol} {trendValue}
        </div>
      )}
    </div>
  );
}
