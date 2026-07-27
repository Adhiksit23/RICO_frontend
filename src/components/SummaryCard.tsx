"use client";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  topRightText?: string;
  variant?: "cyan" | "red" | "yellow" | "green" | "purple";
}

const variantStyles = {
  cyan: {
    border: "border-cyan-500/30 border-l-4 border-l-cyan-400",
    text: "text-cyan-400",
    bg: "bg-cyan-500/5",
    hover: "hover:border-cyan-500/50",
  },
  red: {
    border: "border-red-500/30 border-l-4 border-l-red-500",
    text: "text-red-400",
    bg: "bg-red-500/5",
    hover: "hover:border-red-500/50",
  },
  yellow: {
    border: "border-yellow-500/30 border-l-4 border-l-yellow-400",
    text: "text-yellow-400",
    bg: "bg-yellow-500/5",
    hover: "hover:border-yellow-500/50",
  },
  green: {
    border: "border-green-500/30 border-l-4 border-l-green-400",
    text: "text-green-400",
    bg: "bg-green-500/5",
    hover: "hover:border-green-500/50",
  },
  purple: {
    border: "border-purple-500/30 border-l-4 border-l-purple-500",
    text: "text-purple-400",
    bg: "bg-purple-500/5",
    hover: "hover:border-purple-500/50",
  },
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  topRightText,
  variant = "cyan",
}: SummaryCardProps) {
  const style = variantStyles[variant];

  return (
    <div
      className={`bg-[#151C2C]/95 ${style.bg} ${style.border} ${style.hover} rounded-xl p-4 sm:p-4.5 flex flex-col justify-between transition-all shadow-md group`}
    >
      {/* Top Row: Title (Left) + Update Time / Info (Right) */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-800/40">
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-gray-400 truncate">
          {title}
        </span>
        {topRightText && (
          <span className="text-[10px] font-mono text-gray-400 font-medium shrink-0 bg-[#0F172A] px-2 py-0.5 rounded border border-gray-800/60">
            {topRightText}
          </span>
        )}
      </div>

      {/* Center Row: Metric Number (Centered) */}
      <div className="my-3 text-center">
        <h2 className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${style.text} truncate`}>
          {value}
        </h2>
      </div>

      {/* Bottom Row: Subtitle / Details (Centered) */}
      {subtitle && (
        <p className="text-[11px] font-medium text-gray-400 text-center truncate pt-1 border-t border-gray-800/30">
          {subtitle}
        </p>
      )}
    </div>
  );
}
