"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Dashboard", icon: "🏠", href: "/" },
  { label: "Search History", icon: "🕓", href: "/search-history" },
  { label: "Alerts (India)", icon: "🔔", href: "/alerts-india" },
  { label: "Global Alerts", icon: "🌍", href: "/global-alerts" },
  { label: "Saved Locations", icon: "📍", href: "/saved-locations" },
  { label: "Model Performance", icon: "📈", href: "/model-performance" },
  { label: "Admin Portal", icon: "🛡️", href: "/admin" },
  { label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`glass fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] flex-col gap-1 rounded-r-2xl p-3 transition-all duration-300 sm:flex ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="mb-2 self-end rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white/70"
      >
        {collapsed ? "»" : "«"}
      </button>
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active
                ? "bg-white/8 text-white shadow-[inset_2px_0_0_0_#F59E0B]"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <span>{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </aside>
  );
}
