"use client";
import React from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/* ---------------- Invoice Volume + Value Trend (Figma final) ---------------- */
export function InvoiceTrendChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  // Format labels as Jan–Dec
  const labels =
    data.length > 0
      ? data.map((d) => (d.month.length > 3 ? d.month.slice(0, 3) : d.month))
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

  const values =
    data.length > 0
      ? data.map((d) => d.total)
      : [50, 60, 40, 45, 70, 55, 65, 48, 35, 58, 62, 49];

  const gradientFill = (ctx: any) => {
    const chart = ctx.chart;
    const { ctx: context, chartArea } = chart;
    if (!chartArea) return null;
    const gradient = context.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );
    gradient.addColorStop(0, "rgba(30, 27, 75, 0.2)");
    gradient.addColorStop(1, "rgba(30, 27, 75, 0)");
    return gradient;
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Spend (€)",
        data: values,
        borderColor: "#1E1B4B",
        backgroundColor: gradientFill,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#1E1B4B",
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Invoice Volume + Value Trend
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Invoice count and total spend over 12 months.
      </p>

      <div
        className="relative"
        style={{
          height: 280, // shorter to match Figma
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Line
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(255,255,255,0.95)",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                titleColor: "#111827",
                bodyColor: "#111827",
                displayColors: false,
                padding: 12,
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                callbacks: {
                  title: (ctx) => `${ctx[0].label}`,
                  label: (ctx) => {
                    const y = ctx.parsed?.y ?? 0;
                    return `Total Spend: € ${y.toLocaleString()}`;
                  },
                },
              },
            },
            layout: {
              padding: {
                left: 0,
                right: 0,
                top: 10,
                bottom: 10,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: "#F3F4F6",
                  drawBorder: false,
                },
                ticks: {
                  color: "#9CA3AF",
                  callback: (value) => `€${value / 1000}k`,
                  font: { size: 11 },
                  padding: 6,
                },
              },
              x: {
                grid: {
                  color: "rgba(243,244,246,0.6)",
                  drawBorder: false,
                },
                ticks: {
                  color: "#9CA3AF",
                  font: { size: 11 },
                  padding: 4,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- Spend by Vendor (Top 10) — Figma Accurate ---------------- */
export function TopVendorsChart({
  data,
}: {
  data: { name: string; totalSpend: number }[];
}) {
  // Sort descending and take top 10 vendors
  const sorted = [...data]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);
  const labels = sorted.map((v) => v.name);
  const values = sorted.map((v) => v.totalSpend);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Vendor Spend (€)",
        data: values,
        backgroundColor: [
          "rgba(30, 27, 75, 0.9)",
          "rgba(30, 27, 75, 0.7)",
          "rgba(30, 27, 75, 0.5)",
          "rgba(30, 27, 75, 0.3)",
          "rgba(30, 27, 75, 0.15)",
          "rgba(30, 27, 75, 0.1)",
          "rgba(30, 27, 75, 0.1)",
          "rgba(30, 27, 75, 0.1)",
          "rgba(30, 27, 75, 0.1)",
          "rgba(30, 27, 75, 0.1)",
        ],
        borderRadius: 10,
        barThickness: 20,
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Spend by Vendor (Top 10)
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Vendor spend with cumulative percentage distribution.
      </p>

      <div style={{ height: 320 }}>
        <Bar
          data={chartData}
          options={{
            indexAxis: "y" as const,
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(255,255,255,0.95)",
                titleColor: "#111827",
                bodyColor: "#111827",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                titleFont: { weight: "bold" },
                bodyFont: { size: 13 },
                callbacks: {
                  label: function (context) {
                    const x = context.parsed?.x ?? 0;
                    return `Vendor Spend: € ${x.toLocaleString()}`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  color: "#F3F4F6",
                  drawBorder: false,
                },
                ticks: {
                  color: "#9CA3AF",
                  callback: (value) => `€${Number(value) / 1000}k`,
                  font: { size: 11 },
                },
              },
              y: {
                grid: {
                  display: false,
                  drawBorder: false,
                },
                ticks: {
                  color: "#111827",
                  font: { size: 12 },
                  padding: 6,
                },
              },
            },
            layout: {
              padding: {
                left: 10,
                right: 10,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- Category Spend Chart (Doughnut / Pie) ---------------- */
/* ---------------- Category Spend Chart (Figma-accurate) ---------------- */
export function CategorySpendChart({
  data,
}: {
  data: { category: string; total: number }[];
}) {
  // If no real data, use fallback example
  const hasData = data && data.length > 1;
  const labels = hasData
    ? data.map((d) => d.category)
    : ["Operations", "Marketing", "Facilities"];
  const values = hasData ? data.map((d) => d.total) : [1000, 7250, 1000];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spend by Category",
        data: values,
        backgroundColor: ["#1D4ED8", "#F97316", "#FBBF24"],
        borderColor: "#FFFFFF",
        borderWidth: 3,
        cutout: "70%", // donut thickness
      },
    ],
  };

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Spend by Category
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Distribution of spending across different categories.
      </p>

      <div className="flex items-center justify-between">
        {/* Chart */}
        <div
          className="flex items-center justify-center"
          style={{ width: 180, height: 180 }}
        >
          <Doughnut
            data={chartData}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
            }}
          />
        </div>

        {/* Custom Legend */}
        <ul className="space-y-2 text-sm text-gray-600 ml-4 flex-1">
          {labels.map((label, i) => (
            <li key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: chartData.datasets[0].backgroundColor[i],
                  }}
                />
                <span>{label}</span>
              </div>
              <span
                className={`font-medium ${
                  i === 1 ? "text-gray-900" : "text-gray-700"
                }`}
              >
                ${values[i].toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Cash Outflow Forecast (Figma-tuned final) ---------------- */
export function CashOutflowChart({
  data,
}: {
  data: { date: string; total: number }[];
}) {
  const now = new Date();
  const groups = {
    "0–7 days": 0,
    "8–30 days": 0,
    "31–60 days": 0,
    "60+ days": 0,
  };

  data.forEach((item) => {
    const diffDays =
      (new Date(item.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) groups["0–7 days"] += item.total;
    else if (diffDays <= 30) groups["8–30 days"] += item.total;
    else if (diffDays <= 60) groups["31–60 days"] += item.total;
    else groups["60+ days"] += item.total;
  });

  const labels = Object.keys(groups);
  const values = Object.values(groups);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cash Outflow (€)",
        data: values,
        backgroundColor: "#1E1B4B", // deep indigo like Figma
        borderRadius: 14,
        barThickness: 45,
      },
    ],
  };

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Cash Outflow Forecast
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Expected payment obligations grouped by due date ranges.
      </p>

      <div style={{ height: 260, paddingBottom: 10 }}>
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { display: false } },
            layout: {
              padding: {
                bottom: 0, // eliminate extra space
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grace: "0%", // no extra top padding
                ticks: {
                  color: "#9CA3AF",
                  callback: function (value) {
                    return `€${value / 1000}k`;
                  },
                  padding: 6,
                },
                grid: {
                  color: "#F3F4F6",
                  drawBorder: false,
                },
              },
              x: {
                ticks: {
                  color: "#9CA3AF",
                  font: { size: 11 },
                  padding: 4,
                },
                grid: {
                  display: false,
                  drawBorder: false,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
