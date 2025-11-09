"use client";
import React from "react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold">Amit Jadhav</div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600">
          AJ
        </div>
      </div>
    </header>
  );
}
