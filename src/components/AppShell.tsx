'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AuthGuard from '@/components/AuthGuard';

const AUTH_PATHS = ['/login', '/signup', '/invite'];

const isAuthPath = (path: string) =>
  AUTH_PATHS.some((p) => path.startsWith(p));

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isAuthPath(pathname)) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white">
        {children}
      </div>
    );
  }

  return (
    <AuthGuard>
      {/* IoT sync runs on the backend scheduler (IOT_SYNC_ENABLED) — not in the browser */}
      <div className="flex min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="fixed top-0 left-0 bottom-0 w-64 z-30 bg-[#060A14] border-r border-cyan-500/20 shadow-[6px_0_24px_rgba(0,0,0,0.4)]">
            <Sidebar />
          </div>
        </aside>


        {/* Mobile Slide-over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative w-4/5 max-w-xs bg-[#0B1120] h-full shadow-2xl z-10 flex flex-col">
              <Sidebar isMobile onNavClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
