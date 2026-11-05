'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMonitorAlertStore } from '@/store/monitorAlertStore';

const formatValue = (value: number | null) =>
  value === null || value === undefined ? '—' : Number(value).toFixed(2);

export default function MonitorAlertButton() {
  const alert = useMonitorAlertStore((s) => s.alert);
  const die = useMonitorAlertStore((s) => s.die);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!alert) return null;

  const hasMismatch = alert.has_mismatch;
  const badge = alert.count > 99 ? '99+' : alert.count > 0 ? alert.count : '!';

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1F2937] transition-colors cursor-pointer"
        aria-label={
          hasMismatch
            ? `${alert.count} calibration mismatches`
            : 'Calibration status OK'
        }
        aria-expanded={isOpen}
      >
        <svg
          className={`w-5 h-5 ${hasMismatch ? 'text-amber-400' : 'text-green-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {hasMismatch ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {badge}
          </span>
        ) : (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0B1120]" />
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[26rem] bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1F2937]">
            <p className="text-white text-sm font-semibold">
              {hasMismatch ? 'Calibration Mismatch' : 'Calibration OK'}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              Die {die ?? '—'} ·{' '}
              {hasMismatch
                ? `${alert.count} parameter${alert.count === 1 ? '' : 's'} differ`
                : 'Monitor ranges match latest calibration'}
            </p>
          </div>

          {hasMismatch && (
            <div className="max-h-80 overflow-y-auto divide-y divide-[#1F2937]">
              {alert.items.map((item) => (
                <div key={item.parameter} className="px-4 py-3">
                  <p className="text-cyan-400 text-xs font-semibold font-mono mb-1.5">
                    {item.parameter}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-[#0B1120] border border-[#1F2937] rounded-lg p-2">
                      <p className="text-gray-400 uppercase tracking-wider font-bold text-[9px] mb-1">
                        Monitor
                      </p>
                      <p className="text-gray-300">
                        Lower: <span className="font-mono">{formatValue(item.monitor.lower)}</span>
                      </p>
                      <p className="text-gray-300">
                        Upper: <span className="font-mono">{formatValue(item.monitor.upper)}</span>
                      </p>
                    </div>
                    <div className="bg-[#0B1120] border border-[#1F2937] rounded-lg p-2">
                      <p className="text-gray-400 uppercase tracking-wider font-bold text-[9px] mb-1">
                        Calibration
                      </p>
                      <p className="text-gray-300">
                        Lower: <span className="font-mono">{formatValue(item.calibration.lower)}</span>
                      </p>
                      <p className="text-gray-300">
                        Upper: <span className="font-mono">{formatValue(item.calibration.upper)}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-400 mt-1.5">
                    Δ Lower: {formatValue(item.diff.lower)} ({formatValue(item.percent_diff.lower)}%) ·
                    Δ Upper: {formatValue(item.diff.upper)} ({formatValue(item.percent_diff.upper)}%)
                  </p>
                </div>
              ))}
            </div>
          )}

          {(alert.missing_in_calibration.length > 0 || alert.missing_in_monitor.length > 0) && (
            <div className="px-4 py-2.5 border-t border-[#1F2937] text-[11px] text-gray-400 space-y-1">
              {alert.missing_in_calibration.length > 0 && (
                <p>Missing in calibration: {alert.missing_in_calibration.join(', ')}</p>
              )}
              {alert.missing_in_monitor.length > 0 && (
                <p>Missing in monitor: {alert.missing_in_monitor.join(', ')}</p>
              )}
            </div>
          )}

          <div className="px-4 py-2.5 border-t border-[#1F2937]">
            <Link
              href="/monitor"
              onClick={() => setIsOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
            >
              View monitor →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
