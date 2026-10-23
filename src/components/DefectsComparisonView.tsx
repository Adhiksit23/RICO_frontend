"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CustomDropdown from "@/components/CustomDropdown";
import { usePeriodCompare } from "@/hooks/useDashboard";
import { TARGET_DEFECTS, type PeriodCompareParams } from "@/types";

interface DefectsComparisonViewProps {
  client: string;
  machine: string;
  die: string;
  periodOptions: Array<{ label: string; value: string }>;
}

export default function DefectsComparisonView({
  client,
  machine,
  die,
  periodOptions,
}: DefectsComparisonViewProps) {
  // Period 1 (Baseline)
  const [p1Period, setP1Period] = useState("all");
  const [p1Start, setP1Start] = useState("");
  const [p1End, setP1End] = useState("");

  // Period 2 (Comparison)
  const [p2Period, setP2Period] = useState("custom");
  const [p2Start, setP2Start] = useState("");
  const [p2End, setP2End] = useState("");

  const compareParams: PeriodCompareParams = {
    client,
    machine,
    die,
    p1_period: p1Period,
    p1_start: p1Period === "custom" && p1Start ? p1Start : undefined,
    p1_end: p1Period === "custom" && p1End ? p1End : undefined,
    p2_period: p2Period,
    p2_start: p2Period === "custom" && p2Start ? p2Start : undefined,
    p2_end: p2Period === "custom" && p2End ? p2End : undefined,
  };

  const { data, isFetching } = usePeriodCompare(compareParams);

  const delta = data?.delta;
  const p1 = data?.period_1;
  const p2 = data?.period_2;
  const defectRows = (data?.defect_comparison || []).filter(
    (row) => row.category !== "Others" && (TARGET_DEFECTS as readonly string[]).includes(row.category)
  );

  // Chart data formatted for side-by-side grouped bars
  const chartData = defectRows.map((row) => ({
    category: row.category,
    "Period 1 Defect Rate (%)": row.p1_rate,
    "Period 2 Defect Rate (%)": row.p2_rate,
    "Period 1 Count": row.p1_count,
    "Period 2 Count": row.p2_count,
  }));

  return (
    <div className="space-y-4">
      {/* Period Selectors Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121B2B] border border-[#1F2937] rounded-xl p-4">
        {/* Period 1 (Baseline) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Period 1 (Baseline)
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {p1?.period_label || "All Time"}
            </span>
          </div>

          <CustomDropdown
            label="SELECT PERIOD 1"
            options={periodOptions}
            value={p1Period}
            onChange={setP1Period}
          />

          {p1Period === "custom" && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  From:
                </label>
                <input
                  type="date"
                  value={p1Start}
                  onChange={(e) => setP1Start(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#252D3D] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  To:
                </label>
                <input
                  type="date"
                  value={p1End}
                  onChange={(e) => setP1End(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#252D3D] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Period 2 (Comparison) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Period 2 (Comparison)
            </span>
            <span className="text-[11px] text-cyan-400/80 font-mono">
              {p2?.period_label || "Custom Window"}
            </span>
          </div>

          <CustomDropdown
            label="SELECT PERIOD 2"
            options={periodOptions}
            value={p2Period}
            onChange={setP2Period}
          />

          {p2Period === "custom" && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  From:
                </label>
                <input
                  type="date"
                  value={p2Start}
                  onChange={(e) => setP2Start(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#252D3D] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">
                  To:
                </label>
                <input
                  type="date"
                  value={p2End}
                  onChange={(e) => setP2End(e.target.value)}
                  className="w-full bg-[#151C2C] border border-[#252D3D] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delta KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Parts Volume */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Production
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-white">
              {p2 ? p2.total_parts.toLocaleString() : "..."}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              vs {p1 ? p1.total_parts.toLocaleString() : "..."}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Diff:{" "}
            <span className="font-mono text-gray-300">
              {delta ? (delta.total_parts_diff >= 0 ? `+${delta.total_parts_diff.toLocaleString()}` : delta.total_parts_diff.toLocaleString()) : "0"} parts
            </span>
          </p>
        </div>

        {/* Defective Count */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Defective Parts
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-rose-400">
              {p2 ? p2.defective_parts.toLocaleString() : "..."}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              vs {p1 ? p1.defective_parts.toLocaleString() : "..."}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Diff:{" "}
            <span className="font-mono text-gray-300">
              {delta ? (delta.defective_diff >= 0 ? `+${delta.defective_diff.toLocaleString()}` : delta.defective_diff.toLocaleString()) : "0"} defects
            </span>
          </p>
        </div>

        {/* Defect Rate Delta */}
        <div
          className={`border rounded-xl p-4 transition-colors ${
            delta?.status === "improved"
              ? "bg-emerald-950/20 border-emerald-500/40"
              : delta?.status === "degraded"
              ? "bg-rose-950/20 border-rose-500/40"
              : "bg-[#151C2C] border-[#252D3D]"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Defect Rate Change (Δ)
            </span>
            {delta && (
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  delta.status === "improved"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : delta.status === "degraded"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {delta.status === "improved" ? "Quality Improved" : delta.status === "degraded" ? "Defects Increased" : "Unchanged"}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-black font-mono ${
                delta?.status === "improved"
                  ? "text-emerald-400"
                  : delta?.status === "degraded"
                  ? "text-rose-400"
                  : "text-white"
              }`}
            >
              {delta ? (delta.rate_diff > 0 ? `+${delta.rate_diff.toFixed(2)}%` : `${delta.rate_diff.toFixed(2)}%`) : "0.00%"}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              ({p1?.defect_rate ?? 0}% → {p2?.defect_rate ?? 0}%)
            </span>
          </div>

          <p className="text-[11px] text-gray-300 mt-1 font-medium">
            {delta?.status_text || "Evaluating period delta..."}
          </p>
        </div>
      </div>

      {/* Side-by-Side Grouped Bar Chart */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#252D3D]">
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase">
              Defect Rate by Category (Period 1 vs Period 2)
            </h2>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Comparison of defect percentages per 100 parts produced
            </p>
          </div>
          {isFetching && (
            <span className="text-xs font-mono text-cyan-400 animate-pulse">
              Syncing Comparison...
            </span>
          )}
        </div>

        <div className="w-full h-[320px] pt-4">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs font-semibold">
              No defect data recorded for the selected period pair.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#252D3D" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                    color: "#F3F4F6",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value}%`, "Defect Rate"]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "15px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="Period 1 Defect Rate (%)"
                  fill="#64748B"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="Period 2 Defect Rate (%)"
                  fill="#06B6D4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparison Breakdown Table */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4">
        <h2 className="text-sm sm:text-base font-extrabold tracking-wider text-gray-200 uppercase mb-3 pb-2 border-b border-[#252D3D]">
          Defect Category Delta Breakdown
        </h2>

        {defectRows.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Zero defects found across both periods. Quality is pristine.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-[#252D3D] pb-2.5 font-bold">
                  <th className="pb-2.5">Defect Category</th>
                  <th className="pb-2.5 text-right">Period 1 Count</th>
                  <th className="pb-2.5 text-right">Period 1 Rate</th>
                  <th className="pb-2.5 text-right">Period 2 Count</th>
                  <th className="pb-2.5 text-right">Period 2 Rate</th>
                  <th className="pb-2.5 text-right">Rate Delta (Δ)</th>
                  <th className="pb-2.5 text-right">Relative Change</th>
                  <th className="pb-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D3D]/40 font-mono font-medium">
                {defectRows.map((row) => (
                  <tr key={row.category} className="hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2.5 font-sans font-semibold text-gray-200">
                      {row.category}
                    </td>
                    <td className="py-2.5 text-right text-gray-400">
                      {row.p1_count.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right text-gray-400">
                      {row.p1_rate.toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-cyan-300 font-bold">
                      {row.p2_count.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right text-cyan-300 font-bold">
                      {row.p2_rate.toFixed(2)}%
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        row.rate_diff < 0
                          ? "text-emerald-400"
                          : row.rate_diff > 0
                          ? "text-rose-400"
                          : "text-gray-400"
                      }`}
                    >
                      {row.rate_diff > 0 ? `+${row.rate_diff.toFixed(2)}%` : `${row.rate_diff.toFixed(2)}%`}
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        row.relative_change < 0
                          ? "text-emerald-400"
                          : row.relative_change > 0
                          ? "text-rose-400"
                          : "text-gray-400"
                      }`}
                    >
                      {row.relative_change > 0
                        ? `+${row.relative_change.toFixed(1)}%`
                        : `${row.relative_change.toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs uppercase font-bold rounded-full ${
                          row.status === "improved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : row.status === "degraded"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {row.status === "improved" ? "Decreased ↓" : row.status === "degraded" ? "Increased ↑" : "Flat —"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
