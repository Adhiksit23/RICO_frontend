"use client";

type GaugeCardProps = {
  value: number;
  label: string;
  subtitle: string;
  status: string;
  color: string;
};

export default function GaugeCard({
  value,
  label,
  subtitle,
  status,
  color,
}: GaugeCardProps) {
  // Circular geometry: radius 46 in 120x120 viewBox provides ample inner clearance for 5-digit values
  const radius = 46;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~289.03
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const strokeDashoffset = circumference - (circumference * safeValue) / 100;

  return (
    <div
      className="bg-[#151C2C] border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        borderColor: `${color}40`,
        boxShadow: `0 4px 20px -2px ${color}15`,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0 pr-1">
          <h3 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
            {label}
          </h3>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 leading-tight truncate">
            {subtitle}
          </p>
        </div>

        <div
          className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border"
          style={{
            color,
            backgroundColor: `${color}20`,
            borderColor: `${color}40`,
          }}
        >
          {status}
        </div>
      </div>

      {/* Gauge Visual - Clean Radial Progress Meter (Unobstructed) */}
      <div className="flex items-center justify-center my-3.5">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Background Ring & Active Progress Arc */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#1E293B"
              strokeWidth={strokeWidth}
              fill="none"
              className="opacity-70"
            />
            {/* Progress Arc with Subtle Glow */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 5px ${color}60)`,
              }}
            />
          </svg>

          {/* Center Value Text - Perfectly Centered & Compact */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span
              className="text-base sm:text-lg font-bold font-mono tracking-tight leading-none"
              style={{ color }}
            >
              {value}
            </span>
            <span className="text-[9px] uppercase font-semibold tracking-wider text-gray-400 mt-1">
              % Prob.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 transition-all duration-500"
        style={{
          backgroundColor: color,
          width: `${safeValue}%`,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
    </div>
  );
}