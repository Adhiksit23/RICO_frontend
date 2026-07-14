"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    name: "Defects Dashboard",
    path: "/dashboard",
  },
  {
    name: "Monitor & Predict",
    path: "/monitor",
  },
  {
    name: "Calibrate",
    path: "/calibration",
  },
  {
    name: "Settings",
    path: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-screen bg-[#0B1120] border-r border-gray-800 text-white p-6">
      <h1 className="text-4xl font-bold mb-12">
        Machine AI
      </h1>

      <div className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`p-4 rounded-lg transition-all ${
              pathname === item.path
                ? "bg-cyan-500 text-black font-semibold"
                : "bg-[#111827] hover:bg-[#1F2937]"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}