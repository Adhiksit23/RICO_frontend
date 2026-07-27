"use client";

import UserMenu from "@/components/UserMenu";
import { MenuIcon } from "@/components/icons";

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#0B1120]/90 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/80 transition-colors focus:outline-none"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">R</span>
          </div>
          <span className="font-bold text-white tracking-tight">RICO AI</span>
        </div>

        {/* Desktop Title & Status */}
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            System Operational
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            IoT Live Telemetry Active
          </span>
        </div>
      </div>

      {/* User Dropdown */}
      <div className="flex items-center gap-3">
        <UserMenu />
      </div>
    </header>
  );
}