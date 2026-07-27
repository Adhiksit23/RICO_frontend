'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export default function UserMenu() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoutMutation = useLogout();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logoutMutation.mutateAsync();
  };

  if (!user) return null;

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#1F2937] transition-colors cursor-pointer"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-[11px]">{initials}</span>
        </div>
        {/* Name + Role */}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-white text-xs font-medium leading-tight">{user.full_name}</span>
          <span
            className={`text-[10px] leading-tight font-medium ${
              user.role === 'plant_admin' ? 'text-cyan-400' : 'text-gray-400'
            }`}
          >
            {user.role === 'plant_admin' ? 'Plant Admin' : 'User'}
          </span>
        </div>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[#1F2937]">
            <p className="text-white text-sm font-semibold truncate">{user.full_name}</p>
            <p className="text-gray-500 text-xs truncate mt-0.5">{user.email}</p>
            {user.plant_name && (
              <p className="text-gray-600 text-[11px] truncate mt-0.5">{user.plant_name}</p>
            )}
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
