"use client";
import React, { useEffect, useState } from "react";
import MetricCard from "@/components/MetricCard";
import {
  InvoiceTrendChart,
  TopVendorsChart,
  CategorySpendChart,
  CashOutflowChart,
} from "@/components/Charts";
import InvoicesTable from "@/components/InvoicesTable";
import axios from "axios";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);
  const [cash, setCash] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [
          statsRes,
          trendsRes,
          vendorsRes,
          categoryRes,
          cashRes,
          invoicesRes,
        ] = await Promise.all([
          axios.get(`${API_BASE}/stats`),
          axios.get(`${API_BASE}/invoice-trends`),
          axios.get(`${API_BASE}/vendors/top10`),
          axios.get(`${API_BASE}/category-spend`),
          axios.get(`${API_BASE}/cash-outflow`),
          axios.get(`${API_BASE}/invoices`),
        ]);

        setStats(statsRes.data);
        setTrends(trendsRes.data);
        setVendors(vendorsRes.data);
        setCategory(categoryRes.data);
        setCash(cashRes.data);
        setInvoices(invoicesRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [API_BASE]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-500">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-sm">Loading dashboard data...</p>
      </div>
    );

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto px-6 lg:px-8">
      {/* --- Row 1: Overview Metric Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Spend (YTD)"
          value={stats ? `€ ${stats.totalSpend.toLocaleString()}` : "—"}
          trend="up"
          trendValue="+8.2% from last month"
        />
        <MetricCard
          title="Total Invoices Processed"
          value={stats ? stats.totalInvoices : "—"}
          trend="up"
          trendValue="+8.2% from last month"
        />
        <MetricCard
          title="Documents Uploaded"
          value={invoices?.length || 0}
          trend="down"
          trendValue="-8 less from last month"
        />
        <MetricCard
          title="Average Invoice Value"
          value={stats ? `€ ${stats.avgInvoiceValue.toLocaleString()}` : "—"}
          trend="up"
          trendValue="+8.2% from last month"
        />
      </div>
      {/* --- Row 2: Invoice Trend + Vendor Spend (balanced layout) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 overflow-hidden">
        {/* Left Chart */}
        <div className="w-full h-[380px] overflow-hidden">
          <div className="w-full h-full bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <InvoiceTrendChart data={trends} />
          </div>
        </div>

        {/* Right Chart */}
        <div className="w-full h-[380px] overflow-hidden">
          <div className="w-full h-full bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <TopVendorsChart data={vendors} />
          </div>
        </div>
      </div>

      {/* --- Row 3: Category Spend + Cash Flow + Invoices Table --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategorySpendChart data={category} />
        <CashOutflowChart data={cash} />
        <InvoicesTable data={invoices.slice(0, 10)} />
      </div>
    </div>
  );
}
