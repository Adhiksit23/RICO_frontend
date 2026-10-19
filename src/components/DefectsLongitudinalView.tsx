"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useLongitudinalDefects } from "@/hooks/useDashboard";
import type { LongitudinalParams } from "@/types";

interface DefectsLongitudinalViewProps {
  client: string;
  machine: string;
  die: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Non-filling": "#22D3EE",
  "Blowhole": "#3B82F6",
  "Porosity": "#FACC15",
  "Shrinkage": "#EC4899",
  "Chip-off": "#34D399",
  "Crack": "#EF4444",
  "Bend / Dimension": "#FB923C",
  "Surface Defect": "#818CF8",
  "System / PLC Alert": "#A855F7",
  "Others": "#94A3B8",
};

export default function DefectsLongitudinalView({
  client,
  machine,
  die,
  period,
  startDate,
  endDate,
}: DefectsLongitudinalViewProps) {
  const [interval, setInterval] = useState<"day" | "week" | "month">("day");
  const [chartType, setChartType] = useState<"rate" | "categories">("rate");

  const params: LongitudinalParams = {
    client,
    machine,
    die,
    period,
    start_date: period === "custom" ? startDate : undefined,
    end_date: period === "custom" ? endDate : undefined,
    interval,
  };

  const { data, isFetching } = useLongitudinalDefects(params);

  const timeline = data?.timeline || [];
  const categories = data?.categories || [];

  // Summary statistics across the timeline
  const rates = timeline.map((p) => p.defect_rate);
  const avgRate = rates.length > 0 ? (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2) : "0.00";
  const maxRate = rates.length > 0 ? Math.max(...rates).toFixed(2) : "0.00";
  const minRate = rates.length > 0 ? Math.min(...rates).toFixed(2) : "0.00";
  const totalProduction = timeline.reduce((acc, p) => acc + p.total_parts, 0);
  const totalDefective = timeline.reduce((acc, p) => acc + p.defective_parts, 0);

  return (
    <div className="space-y-4">
      {/* Controls Bar: Interval & Metric View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121B2B] border border-[#1F2937] rounded-xl p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Aggregation Interval:
          </span>
          <div className="flex rounded-lg bg-[#151C2C] border border-[#252D3D] p-1">
            {(["day", "week", "month"] as const).map((int) => (
              <button
                key={int}
                onClick={() => setInterval(int)}
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  interval === int
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Chart View:
          </span>
          <div className="flex rounded-lg bg-[#151C2C] border border-[#252D3D] p-1">
            <button
              onClick={() => setChartType("rate")}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                chartType === "rate"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Defect Rate (%)
            </button>
            <button
              onClick={() => setChartType("categories")}
              className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                chartType === "categories"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Categories Volume
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            Average Defect Rate
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
            {avgRate}%
          </div>
          <span className="text-[11px] text-gray-500">Across {timeline.length} intervals</span>
        </div>

        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            Peak Defect Rate
          </span>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
            {maxRate}%
          </div>
          <span className="text-[11px] text-gray-500">Highest recorded window</span>
        </div>

        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            Lowest Defect Rate
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            {minRate}%
          </div>
          <span className="text-[11px] text-gray-500">Best performance window</span>
        </div>

        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
            Total Telemetry Parts
          </span>
          <div className="text-xl font-bold font-mono text-white mt-0.5">
            {totalProduction.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-500">{totalDefective.toLocaleString()} defective</span>
        </div>
      </div>

      {/* Main Longitudinal Chart */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#252D3D]">
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase">
              {chartType === "rate"
                ? "Longitudinal Defect Rate Trend"
                : "Defect Type Breakdown Over Time"}
            </h2>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Historical progression aggregated by {interval} • {data?.period_label || "All Time"}
            </p>
          </div>
          {isFetching && (
            <span className="text-xs font-mono text-cyan-400 animate-pulse">
              Syncing Trend...
            </span>
          )}
        </div>

        <div className="w-full h-[360px] pt-4">
          {timeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs font-semibold">
              No longitudinal part records found for the selected filter combination.
            </div>
          ) : chartType === "rate" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D3D" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                    color: "#F3F4F6",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val}%`, "Defect Rate"]}
                  labelFormatter={(lbl) => `Interval: ${lbl}`}
                />
                <ReferenceLine
                  y={15}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{
                    value: "Target 15%",
                    fill: "#EF4444",
                    fontSize: 10,
                    position: "right",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="defect_rate"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#rateGradient)"
                  name="Defect Rate (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D3D" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                    color: "#F3F4F6",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "15px", fontSize: "11px" }} />
                {categories.map((cat) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="defects"
                    fill={CATEGORY_COLORS[cat] || "#94A3B8"}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Timeline Breakdown Table */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4">
        <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase mb-3 pb-2 border-b border-[#252D3D]">
          Longitudinal Interval Telemetry Logs
        </h2>

        {timeline.length === 0 ? (
          <div className="py-6 text-center text-gray-500 text-xs">
            No timestamped telemetry found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#252D3D] pb-2 font-bold">
                  <th className="pb-2">Date / Bucket</th>
                  <th className="pb-2 text-right">Parts Produced</th>
                  <th className="pb-2 text-right">Defective Parts</th>
                  <th className="pb-2 text-right">Defect Rate</th>
                  <th className="pb-2 pl-4">Top Defect Categories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D3D]/40 font-mono font-medium">
                {timeline.map((point) => {
                  const sortedCats = Object.entries(point.defects || {})
                    .filter(([, c]) => c > 0)
                    .sort((a, b) => b[1] - a[1]);

                  return (
                    <tr key={point.date} className="hover:bg-[#1E293B]/40 transition-colors">
                      <td className="py-2.5 font-sans font-semibold text-gray-200">
                        {point.date} ({point.label})
                      </td>
                      <td className="py-2.5 text-right text-gray-300">
                        {point.total_parts.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-rose-400">
                        {point.defective_parts.toLocaleString()}
                      </td>
                      <td
                        className={`py-2.5 text-right font-bold ${
                          point.defect_rate <= 15 ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {point.defect_rate.toFixed(2)}%
                      </td>
                      <td className="py-2.5 pl-4 font-sans text-gray-400 text-[11px]">
                        {sortedCats.length === 0 ? (
                          <span className="text-gray-500">None</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {sortedCats.slice(0, 3).map(([cat, cnt]) => (
                              <span
                                key={cat}
                                className="inline-flex items-center gap-1 bg-[#1E293B] px-2 py-0.5 rounded text-[10px] text-gray-200"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: CATEGORY_COLORS[cat] || "#94A3B8",
                                  }}
                                />
                                {cat}: <strong className="font-mono">{cnt}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
