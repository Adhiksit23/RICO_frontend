"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  DashboardIcon,
  MonitorIcon,
  CalibrateIcon,
  UsersIcon,
  CloseIcon,
} from "@/components/icons";

interface SidebarProps {
  onNavClick?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onNavClick, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "plant_admin";

  const menuItems = [
    { name: "Defects Dashboard", path: "/dashboard", icon: DashboardIcon },
    { name: "Monitor & Predict", path: "/monitor", icon: MonitorIcon },
    { name: "Calibrate", path: "/calibration", icon: CalibrateIcon },
  ];

  if (isAdmin) {
    menuItems.push({ name: "User Management", path: "/admin", icon: UsersIcon });
  }

  return (
    <div className={`flex flex-col h-full bg-[#060A14] text-white p-4 sm:p-5 border-r border-cyan-500/20 shadow-[6px_0_24px_rgba(0,0,0,0.4)] ${isMobile ? 'w-full' : 'w-64'}`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800/80 shrink-0">

        <Link href="/dashboard" onClick={onNavClick} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <span className="text-black font-black text-lg tracking-tighter">R</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">RICO AI</h1>
            <p className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase mt-1">Quality Platform</p>
          </div>
        </Link>
        {isMobile && onNavClick && (
          <button
            onClick={onNavClick}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close navigation"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links - Scrollable if screen is very short */}
      <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-[#111827]"
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? "text-cyan-400" : "text-gray-500"}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Branding Footer - Pinned to bottom */}
      <div className="shrink-0 pt-3 border-t border-gray-800/60 mt-auto">
        <a
          href="https://www.neuriot.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0d172c] via-[#091122] to-[#070d1a] border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.18)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all duration-300"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400 shadow-[0_0_4px_#22d3ee]" />
            </span>
            <span className="text-[11px] text-gray-400 font-medium truncate">
              Powered by{" "}
              <span className="text-cyan-300 group-hover:text-cyan-200 font-semibold tracking-wide transition-colors">
                neurIOT Labs
              </span>
            </span>
          </div>
          <span className="text-cyan-400/70 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[10px] font-bold shrink-0 ml-1.5">
            ↗
          </span>
        </a>
      </div>
    </div>
  );
}