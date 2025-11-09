"use client";
import React from "react";

interface Invoice {
  vendor: { name: string };
  total_amount: number;
}

export default function InvoicesTable({ data }: { data: Invoice[] }) {
  // Group by vendor
  const grouped = data.reduce((acc: any, inv) => {
    const name = inv.vendor?.name || "Unknown Vendor";
    if (!acc[name]) {
      acc[name] = { vendor: name, count: 0, total: 0 };
    }
    acc[name].count += 1;
    acc[name].total += inv.total_amount;
    return acc;
  }, {});

  const vendors = Object.values(grouped).sort(
    (a: any, b: any) => b.total - a.total
  );

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm h-[360px] flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Invoices by Vendor
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Top vendors by invoice count and net value.
      </p>

      {/* Scrollable area */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 pr-1">
        <div className="flex flex-col gap-3">
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_0.7fr_1fr] text-xs font-medium text-gray-500 border-b border-gray-100 pb-1">
            <span>Vendor</span>
            <span className="text-center"># Invoices</span>
            <span className="text-right">Net Value</span>
          </div>

          {/* Table Rows */}
          {vendors.map((v: any, i: number) => (
            <div
              key={i}
              className="grid grid-cols-[1.5fr_0.7fr_1fr] items-center text-sm bg-white border border-gray-100 rounded-xl shadow-sm py-2.5 px-3 hover:shadow-md hover:bg-gray-50 transition-all duration-150"
            >
              {/* Vendor */}
              <div className="truncate font-medium text-gray-800">
                {v.vendor}
              </div>

              {/* Invoice Count */}
              <div className="text-center text-gray-600">{v.count}</div>

              {/* Net Value */}
              <div className="text-right font-semibold text-gray-900">
                <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                  €{" "}
                  {v.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
