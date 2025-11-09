"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavItem = ({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) => (
  <Link href={href}>
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm cursor-pointer transition-all ${
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span>{label}</span>
    </div>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            FB
          </div>
          <div>
            <div className="text-sm font-semibold">Buchhaltung</div>
            <div className="text-xs text-gray-500">12 members</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 px-2">
          <NavItem
            label="Dashboard"
            href="/"
            active={pathname === "/" || pathname === "/dashboard"}
          />
          <NavItem label="Invoice" href="#" active={pathname === "/invoice"} />
          <NavItem
            label="Other files"
            href="#"
            active={pathname === "/files"}
          />
          <NavItem
            label="Departments"
            href="#"
            active={pathname === "/departments"}
          />
          <NavItem label="Users" href="#" active={pathname === "/users"} />
          <NavItem
            label="Settings"
            href="#"
            active={pathname === "/settings"}
          />
          {/* 👇 Added Chat with Data */}
          <NavItem
            label="💬 Chat with Data"
            href="/chat-with-data"
            active={pathname === "/chat-with-data"}
          />
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6">
        <div className="text-gray-500 text-sm font-medium">Flowbit AI</div>
      </div>
    </aside>
  );
}
