"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartSlice } from "@/types";

interface DefectPieChartProps {
  data?: ChartSlice[];
  defectRate?: number | string;
  totalDefects?: number;
  isLoading?: boolean;
}

const FALLBACK_COLORS = [
  "#22D3EE",
  "#A855F7",
  "#3B82F6",
  "#FACC15",
  "#EC4899",
  "#34D399",
  "#EF4444",
  "#FB923C",
  "#818CF8",
  "#94A3B8",
];

export default function DefectPieChart({
  data = [],
  defectRate = "0.00",
  totalDefects = 0,
  isLoading = false,
}: DefectPieChartProps) {
  // If no data or 0 defects
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

  // If empty, show a single placeholder ring
  const displayData = hasData
    ? data.filter((d) => d.value > 0)
    : [{ name: "No Defects", value: 1, color: "#1E293B" }];

  const formattedRate =
    typeof defectRate === "number" ? `${defectRate.toFixed(2)}%` : `${defectRate}%`;

  return (
    <div className="w-full h-[280px] sm:h-[320px] relative flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <span className="text-xs font-mono text-gray-400">Loading Telemetry...</span>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={115}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
                animationDuration={600}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`slice-${index}-${entry.name}`}
                    fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              {hasData && (
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as ChartSlice;
                      const percent =
                        totalDefects > 0
                          ? ((item.value / totalDefects) * 100).toFixed(1)
                          : "0";
                      return (
                        <div className="bg-[#0B1120]/95 backdrop-blur-md border border-cyan-500/40 rounded-lg px-3 py-2 text-xs shadow-xl font-mono">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                          </p>
                          <p className="text-cyan-400 mt-0.5">
                            {item.value.toLocaleString()} ({percent}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight leading-none">
              {hasData ? formattedRate : "0.00%"}
            </h2>
            <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mt-1.5">
              {hasData ? "DEFECT RATE" : "NO DEFECTS"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}