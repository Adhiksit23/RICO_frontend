"use client";

import { useState } from "react";
import DefectPieChart from "@/components/DefectPieChart";
import SummaryCard from "@/components/SummaryCard";
import CustomDropdown from "@/components/CustomDropdown";
import DefectsComparisonView from "@/components/DefectsComparisonView";
import DefectsLongitudinalView from "@/components/DefectsLongitudinalView";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "compare" | "longitudinal">("overview");

  const {
    selectedClient,
    selectedMachine,
    selectedDie,
    selectedPeriod,
    startDate,
    endDate,
    setSelectedClient,
    setSelectedMachine,
    setSelectedDie,
    setSelectedPeriod,
    setStartDate,
    setEndDate,
    filtersMetadata,
    stats,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = useDashboard();

  // If we are waiting for a NEW filter combination that has never been cached before
  const isFetchingNewFilter = isPlaceholderData || (isLoading && !stats);

  // Dynamic filter dropdown options loaded from DB
  const clientOptions = filtersMetadata?.clients || ["All"];
  const machineOptions = filtersMetadata?.machines || ["All"];
  const dieOptions = filtersMetadata?.dies || ["All"];
  const periodOptions = filtersMetadata?.periods || [
    { label: "All Time", value: "all" },
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "last_7_days" },
    { label: "Last Month", value: "last_month" },
    { label: "Year to Date", value: "ytd" },
    { label: "Custom Range", value: "custom" },
  ];

  const summary = stats?.summary || {
    total_parts: 0,
    defective_parts: 0,
    defect_rate: 0,
    period_label: "All Time",
    subtitle_period: "Loading Live Telemetry...",
    subtitle_defects: "0 defective parts",
  };

  const defects = stats?.defects_breakdown || [];
  const chartData = stats?.chart_data || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/60 pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-cyan-400 tracking-tight leading-none uppercase">
            DEFECTS DASHBOARD
          </h1>
          <p className="text-gray-400 mt-1 text-xs font-medium">
            Production quality overview, period comparison & longitudinal defect analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={() => refetch()}
              className="px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Retry Sync
            </button>
          )}

          {/* Dynamic Telemetry Status Indicator */}
          {isFetchingNewFilter ? (
            <div className="flex items-center gap-2 text-yellow-300 text-xs font-semibold tracking-wider bg-yellow-950/40 border border-yellow-500/50 px-3 py-1.5 rounded-full shrink-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="font-mono text-[10px]">FETCHING NEW FILTER...</span>
            </div>
          ) : isFetching ? (
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold tracking-wider bg-cyan-950/40 border border-cyan-500/40 px-3 py-1.5 rounded-full shrink-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px]">SYNCING (CACHED)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold tracking-wider bg-[#151C2C] px-3 py-1.5 rounded-full border border-gray-800/80 shrink-0 w-fit">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px]">LIVE TELEMETRY</span>
            </div>
          )}
        </div>
      </div>

      {/* View Switcher Segmented Tabs */}
      <div className="flex items-center gap-2 border-b border-[#252D3D] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "border-cyan-400 text-cyan-400 bg-cyan-950/20 rounded-t-md"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Overview</span>
          <span className="text-[10px] bg-[#1E293B] text-gray-300 px-1.5 py-0.5 rounded font-mono">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "compare"
              ? "border-cyan-400 text-cyan-400 bg-cyan-950/20 rounded-t-md"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Period Comparison</span>
          <span className="text-[10px] bg-cyan-900/50 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
            Δ Diff
          </span>
        </button>

        <button
          onClick={() => setActiveTab("longitudinal")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "longitudinal"
              ? "border-cyan-400 text-cyan-400 bg-cyan-950/20 rounded-t-md"
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>Longitudinal Analysis</span>
          <span className="text-[10px] bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
            Trend
          </span>
        </button>
      </div>

      {/* Global Filter Bar (Client, Machine, Die, and Period for Overview/Longitudinal) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <CustomDropdown
          label="CLIENT"
          options={clientOptions}
          value={selectedClient}
          onChange={setSelectedClient}
        />
        <CustomDropdown
          label="MACHINE"
          options={machineOptions}
          value={selectedMachine}
          onChange={setSelectedMachine}
        />
        <CustomDropdown
          label="DIE"
          options={dieOptions}
          value={selectedDie}
          onChange={setSelectedDie}
        />
        <CustomDropdown
          label="PERIOD"
          options={periodOptions}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>

      {/* From and To Date Inputs when Period is Custom Range */}
      {selectedPeriod === "custom" && (
        <div className="flex flex-wrap items-center gap-3 bg-[#151C2C] border border-[#252D3D] rounded-xl p-3 text-xs">
          <span className="text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
            Custom Range:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 font-medium text-[11px]">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#111827] border border-[#252D3D] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 font-medium text-[11px]">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#111827] border border-[#252D3D] text-gray-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-gray-500 hover:text-gray-300 text-[11px] underline ml-auto cursor-pointer"
            >
              Reset Dates
            </button>
          )}
        </div>
      )}

      {/* Subtle Animated Progress Line when fetching a new filter */}
      {isFetchingNewFilter && (
        <div className="w-full h-1 bg-[#151C2C] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-yellow-400 to-cyan-500 animate-pulse w-full" />
        </div>
      )}

      {/* ─── TAB 2: PERIOD COMPARISON VIEW ─────────────────────────── */}
      {activeTab === "compare" && (
        <DefectsComparisonView
          client={selectedClient}
          machine={selectedMachine}
          die={selectedDie}
          periodOptions={periodOptions}
        />
      )}

      {/* ─── TAB 3: LONGITUDINAL ANALYSIS VIEW ───────────────────────── */}
      {activeTab === "longitudinal" && (
        <DefectsLongitudinalView
          client={selectedClient}
          machine={selectedMachine}
          die={selectedDie}
          period={selectedPeriod}
          startDate={startDate}
          endDate={endDate}
        />
      )}

      {/* ─── TAB 1: STANDARD OVERVIEW VIEW ──────────────────────────── */}
      {activeTab === "overview" && (
        <>
          {/* Stats Summary Cards — Instant from Cache / Loader if New */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity duration-200 ${
              isFetchingNewFilter ? "opacity-75" : "opacity-100"
            }`}
          >
            <SummaryCard
              title="Total Parts Produced"
              topRightText={isFetchingNewFilter ? "Syncing..." : "Live Stream"}
              value={
                isFetchingNewFilter && !stats
                  ? "..."
                  : summary.total_parts.toLocaleString()
              }
              subtitle={
                summary.subtitle_period ||
                `${summary.period_label || "All Time"} • Production`
              }
              variant="cyan"
            />

            <SummaryCard
              title="Total Defective Parts"
              topRightText={isFetchingNewFilter ? "Syncing..." : "Sync Active"}
              value={
                isFetchingNewFilter && !stats
                  ? "..."
                  : summary.defective_parts.toLocaleString()
              }
              subtitle={
                summary.subtitle_defects ||
                `${summary.defective_parts.toLocaleString()} defects`
              }
              variant="red"
            />

            <SummaryCard
              title="% Defect Rate"
              topRightText="Target <15%"
              value={
                isFetchingNewFilter && !stats ? "..." : `${summary.defect_rate}%`
              }
              subtitle={
                summary.total_parts > 0
                  ? `${summary.defective_parts.toLocaleString()} of ${summary.total_parts.toLocaleString()} parts`
                  : "0 parts in selected period"
              }
              variant={summary.defect_rate <= 15 ? "green" : "yellow"}
            />
          </div>

      {/* Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Dynamic Pie Chart Card */}
        <div className="lg:col-span-5 bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 flex flex-col justify-between relative min-h-[360px]">
          <div className="flex justify-between items-center pb-2 border-b border-[#252D3D]/60">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase">
              Defect Distribution
            </h2>
            <span className="text-gray-400 text-[11px] font-mono font-semibold">
              n ={" "}
              {isFetchingNewFilter && !stats
                ? "..."
                : summary.defective_parts.toLocaleString()}
            </span>
          </div>

          <div className="flex-1 w-full flex items-center justify-center my-2">
            <DefectPieChart
              data={chartData}
              defectRate={summary.defect_rate}
              totalDefects={summary.defective_parts}
              isLoading={isFetchingNewFilter && !stats}
            />
          </div>
        </div>

        {/* Dynamic Breakdown Card */}
        <div className="lg:col-span-7 bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 flex flex-col relative min-h-[360px]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-3 pb-2 border-b border-[#252D3D]">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase">
              Defect Breakdown
            </h2>
            <span className="text-gray-400 text-[10px] font-medium">
              % of defects • % of total parts
            </span>
          </div>

          {/* Loader Overlay when fetching a brand new filter combination */}
          {isFetchingNewFilter && (
            <div className="absolute inset-x-0 bottom-0 top-12 bg-[#151C2C]/75 backdrop-blur-[2px] rounded-b-xl flex flex-col items-center justify-center z-10 transition-opacity">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-2" />
              <p className="text-xs font-mono text-cyan-400 font-semibold tracking-wide">
                Fetching Telemetry for {selectedDie} ({selectedPeriod})...
              </p>
            </div>
          )}

          {/* If No Defects in Selected Filter */}
          {!isFetchingNewFilter && defects.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <svg
                className="w-10 h-10 mb-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs font-semibold text-gray-400">
                {summary.total_parts === 0
                  ? "No parts manufactured for the selected filter combination."
                  : "Zero defects recorded for this selection. Quality is optimal!"}
              </p>
            </div>
          )}

          {/* Desktop Table View */}
          {defects.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#252D3D] pb-2">
                    <th className="pb-2 font-extrabold">Defect Category</th>
                    <th className="pb-2 font-extrabold">Count</th>
                    <th className="pb-2 font-extrabold">% Defects</th>
                    <th className="pb-2 font-extrabold">Defect Rate</th>
                    <th className="pb-2 font-extrabold">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D3D]/40 text-xs font-semibold">
                  {defects.map((item) => (  
                    <tr
                      key={item.name}
                      className="hover:bg-[#1E293B]/40 transition-colors"
                    >
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: item.hex}}
                          />
                          <span className="text-gray-200">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-white font-mono">
                        {item.formatted_count}
                      </td>
                      <td className="py-2 text-gray-300 font-mono">
                        {item.percent}
                      </td>
                      <td className="py-2 text-gray-300 font-mono">{item.rate}</td>
                      <td className="py-2 w-28 sm:w-32">
                        <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: item.width, backgroundColor: item.hex }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Card List View */}
          {defects.length > 0 && (
            <div className="md:hidden space-y-2">
              {defects.map((item) => (
                <div
                  key={item.name}
                  className="bg-[#111827] border border-[#252D3D] rounded-lg p-2.5 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.hex}} />
                      <span className="text-gray-200 font-bold text-xs">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-cyan-400 font-bold text-xs font-mono">
                      {item.formatted_count}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>
                      Share:{" "}
                      <strong className="text-gray-200 font-mono">
                        {item.percent}
                      </strong>
                    </span>
                    <span>
                      Rate:{" "}
                      <strong className="text-gray-200 font-mono">
                        {item.rate}
                      </strong>
                    </span>
                  </div>
                  <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: item.width, backgroundColor: item.hex }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}