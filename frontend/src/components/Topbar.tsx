"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "Defects Dashboard",
    path: "/dashboard",
  },
  {
    name: "Process Monitor",
    path: "/monitor",
  },
  {
    name: "Machine Calibration",
    path: "/calibration",
  },
];

export default function Topbar() {
  const pathname = usePathname();

  return (
    <div className="w-full h-14 bg-[#111827] border-b border-gray-800 flex items-center px-6 gap-6">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            pathname === item.path
              ? "bg-cyan-500 text-black font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}