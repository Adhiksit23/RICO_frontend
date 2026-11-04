"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportService } from "@/services/report.service";
import type {
  PrescribedParameterRecord,
  BellurbisDefectRecord,
} from "@/types";

interface DefectsReportsViewProps {
  client: string;
  machine: string;
  die: string;
  period: string;
  startDate?: string;
  endDate?: string;
}

// 23 Process parameters as specified in Report_Structure_v6
const PARAMETERS = [
  "Acc Position 1",
  "Biscuit Thickness",
  "Clamp Force %",
  "Clamp Tonnage",
  "Cooling Step",
  "Deacc Position",
  "Die Close Core In Time",
  "Die Open Core Out Time",
  "Ejecter Step Time",
  "Extractor Step Time",
  "Intensification Pressure",
  "Intensification Time",
  "Metal Pressure",
  "Metal Temp",
  "Poring Step Time",
  "Shot Acc Pressure",
  "Shot Fwd Step Time",
  "Speed 1",
  "Speed 2",
  "Speed 3",
  "Speed 4",
  "Spray Time",
  "Total Cycle Time",
];

// Fallback sample data for UI review — calibrated to real reference schema
const SAMPLE_PRESCRIBED: PrescribedParameterRecord[] = [
  {
    machine_id: "UBE 850T-2",
    die_id: "S18",
    prescription_id: "75",
    date_provided: "2026-11-04 08:30",
    parameters: {
      "Acc Position 1": { min: 245.0, mean: 250.0, max: 255.0 },
      "Biscuit Thickness": { min: 28.0, mean: 30.5, max: 33.0 },
      "Clamp Force %": { min: 92.0, mean: 95.0, max: 98.0 },
      "Clamp Tonnage": { min: 820.0, mean: 850.0, max: 870.0 },
      "Cooling Step": { min: 14.0, mean: 15.0, max: 16.5 },
      "Deacc Position": { min: 110.0, mean: 115.0, max: 120.0 },
      "Die Close Core In Time": { min: 2.1, mean: 2.4, max: 2.7 },
      "Die Open Core Out Time": { min: 2.0, mean: 2.3, max: 2.6 },
      "Ejecter Step Time": { min: 1.2, mean: 1.5, max: 1.8 },
      "Extractor Step Time": { min: 3.0, mean: 3.5, max: 4.0 },
      "Intensification Pressure": { min: 36.0, mean: 38.0, max: 40.5 },
      "Intensification Time": { min: 18.0, mean: 20.0, max: 22.0 },
      "Metal Pressure": { min: 65.0, mean: 68.0, max: 71.0 },
      "Metal Temp": { min: 660.0, mean: 675.0, max: 690.0 },
      "Poring Step Time": { min: 4.5, mean: 5.0, max: 5.5 },
      "Shot Acc Pressure": { min: 13.5, mean: 14.0, max: 14.5 },
      "Shot Fwd Step Time": { min: 1.8, mean: 2.0, max: 2.2 },
      "Speed 1": { min: 0.18, mean: 0.22, max: 0.25 },
      "Speed 2": { min: 0.35, mean: 0.40, max: 0.45 },
      "Speed 3": { min: 2.2, mean: 2.5, max: 2.8 },
      "Speed 4": { min: 3.0, mean: 3.4, max: 3.7 },
      "Spray Time": { min: 6.0, mean: 7.0, max: 8.0 },
      "Total Cycle Time": { min: 42.0, mean: 45.0, max: 48.0 },
    },
  },
  {
    machine_id: "UBE 850T-2",
    die_id: "S17",
    prescription_id: "74",
    date_provided: "2026-11-03 14:15",
    parameters: {
      "Acc Position 1": { min: 240.0, mean: 248.0, max: 252.0 },
      "Biscuit Thickness": { min: 27.5, mean: 29.8, max: 32.0 },
      "Clamp Force %": { min: 90.0, mean: 94.0, max: 97.0 },
      "Clamp Tonnage": { min: 810.0, mean: 845.0, max: 865.0 },
      "Cooling Step": { min: 13.5, mean: 14.5, max: 16.0 },
      "Deacc Position": { min: 108.0, mean: 112.0, max: 118.0 },
      "Die Close Core In Time": { min: 2.0, mean: 2.3, max: 2.6 },
      "Die Open Core Out Time": { min: 1.9, mean: 2.2, max: 2.5 },
      "Ejecter Step Time": { min: 1.1, mean: 1.4, max: 1.7 },
      "Extractor Step Time": { min: 2.8, mean: 3.3, max: 3.8 },
      "Intensification Pressure": { min: 35.0, mean: 37.5, max: 40.0 },
      "Intensification Time": { min: 17.5, mean: 19.5, max: 21.5 },
      "Metal Pressure": { min: 64.0, mean: 67.0, max: 70.0 },
      "Metal Temp": { min: 655.0, mean: 670.0, max: 685.0 },
      "Poring Step Time": { min: 4.2, mean: 4.8, max: 5.3 },
      "Shot Acc Pressure": { min: 13.0, mean: 13.8, max: 14.3 },
      "Shot Fwd Step Time": { min: 1.7, mean: 1.9, max: 2.1 },
      "Speed 1": { min: 0.17, mean: 0.21, max: 0.24 },
      "Speed 2": { min: 0.33, mean: 0.38, max: 0.43 },
      "Speed 3": { min: 2.1, mean: 2.4, max: 2.7 },
      "Speed 4": { min: 2.9, mean: 3.3, max: 3.6 },
      "Spray Time": { min: 5.8, mean: 6.8, max: 7.8 },
      "Total Cycle Time": { min: 40.0, mean: 43.5, max: 46.5 },
    },
  },
];

// Fallback sample rows using real RICO reference sample (customer_qr is blank, prescription_id is id_calibration_used: 75)
const SAMPLE_BELLURBIS: BellurbisDefectRecord[] = [
  {
    source: "Neuriot labs",
    today_date: "2026-11-04",
    machine_id: "UBE 850T-2",
    die_id: "S18",
    manufactured_date: "2026-11-04",
    manufactured_time: "08:29:19",
    part_serial: "1104135924619",
    customer_qr: "",
    prescription_id: "75",
    predicted: {
      ok: "OK",
      blow_hole: "0",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
    },
    recorded: {
      ok: "OK",
      blow_hole: "0",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
      other: "0",
    },
  },
  {
    source: "Neuriot labs",
    today_date: "2026-11-04",
    machine_id: "UBE 850T-2",
    die_id: "S18",
    manufactured_date: "2026-11-04",
    manufactured_time: "08:28:09",
    part_serial: "1104135824618",
    customer_qr: "",
    prescription_id: "75",
    predicted: {
      ok: "DEFECT",
      blow_hole: "1 (82%)",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
    },
    recorded: {
      ok: "DEFECT",
      blow_hole: "1",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
      other: "0",
    },
  },
  {
    source: "Neuriot labs",
    today_date: "2026-11-04",
    machine_id: "UBE 850T-2",
    die_id: "S18",
    manufactured_date: "2026-11-04",
    manufactured_time: "08:27:00",
    part_serial: "1104135724617",
    customer_qr: "",
    prescription_id: "75",
    predicted: {
      ok: "OK",
      blow_hole: "0",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
    },
    recorded: {
      ok: "OK",
      blow_hole: "0",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
      other: "0",
    },
  },
  {
    source: "Neuriot labs",
    today_date: "2026-11-04",
    machine_id: "UBE 850T-2",
    die_id: "S18",
    manufactured_date: "2026-11-04",
    manufactured_time: "08:25:50",
    part_serial: "1104135524616",
    customer_qr: "",
    prescription_id: "75",
    predicted: {
      ok: "DEFECT",
      blow_hole: "0",
      non_filling: "1 (74%)",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
    },
    recorded: {
      ok: "DEFECT",
      blow_hole: "0",
      non_filling: "1",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
      other: "0",
    },
  },
  {
    source: "Neuriot labs",
    today_date: "2026-11-04",
    machine_id: "UBE 850T-2",
    die_id: "S18",
    manufactured_date: "2026-11-04",
    manufactured_time: "08:24:44",
    part_serial: "1104135424615",
    customer_qr: "",
    prescription_id: "75",
    predicted: {
      ok: "OK",
      blow_hole: "0",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
    },
    recorded: {
      ok: "OK",
      blow_hole: "0",
      non_filling: "0",
      porosity: "0",
      shrinkage: "0",
      chip_off: "0",
      crack: "0",
      other: "0",
    },
  },
];

export default function DefectsReportsView({
  client,
  machine,
  die,
  period,
  startDate,
  endDate,
}: DefectsReportsViewProps) {
  // Selected Sheet Tab (only 2 tabs requested)
  const [activeSheet, setActiveSheet] = useState<"prescribed" | "bellurbis">("prescribed");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotification, setExportNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Live Query from backend API
  const { data: reportData, isLoading, isFetching } = useQuery({
    queryKey: ["reports", "preview", { client, machine, die, period, startDate, endDate }],
    queryFn: () =>
      ReportService.getPreview({
        client,
        machine,
        die,
        period,
        start_date: period === "custom" ? startDate : undefined,
        end_date: period === "custom" ? endDate : undefined,
      }),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const livePrescribed = reportData?.prescribed_parameters?.length
    ? (reportData.prescribed_parameters as unknown as PrescribedParameterRecord[])
    : SAMPLE_PRESCRIBED;

  const liveBellurbis = reportData?.bellurbis_records?.length
    ? (reportData.bellurbis_records as unknown as BellurbisDefectRecord[])
    : SAMPLE_BELLURBIS;

  // Filtered lists with local search
  const filteredPrescribed = useMemo(() => {
    return livePrescribed.filter((row) => {
      if (die !== "All" && row.die_id !== die) return false;
      if (machine !== "All" && row.machine_id !== machine) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        row.prescription_id.toLowerCase().includes(q) ||
        row.die_id.toLowerCase().includes(q) ||
        row.machine_id.toLowerCase().includes(q)
      );
    });
  }, [livePrescribed, die, machine, searchTerm]);

  const filteredBellurbis = useMemo(() => {
    return liveBellurbis.filter((row) => {
      if (die !== "All" && row.die_id !== die) return false;
      if (machine !== "All" && row.machine_id !== machine) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        row.part_serial.toLowerCase().includes(q) ||
        row.customer_qr.toLowerCase().includes(q) ||
        row.prescription_id.toLowerCase().includes(q) ||
        row.die_id.toLowerCase().includes(q)
      );
    });
  }, [liveBellurbis, die, machine, searchTerm]);

  // Export handler
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportNotification(null);

      await ReportService.downloadExcel({
        client,
        machine,
        die,
        period,
        start_date: period === "custom" ? startDate : undefined,
        end_date: period === "custom" ? endDate : undefined,
      });

      setExportNotification({
        type: "success",
        message: `Excel report for ${die} exported successfully!`,
      });
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err: unknown) {
      console.error("Export error:", err);
      setExportNotification({
        type: "error",
        message: "Failed to download Excel report. Please verify connection and try again.",
      });
      setTimeout(() => setExportNotification(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Export notification toast */}
      {exportNotification && (
        <div
          className={`border text-xs px-3.5 py-2 rounded-lg flex items-center justify-between animate-fadeIn ${
            exportNotification.type === "success"
              ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/70 border-red-500/50 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {exportNotification.type === "success" ? (
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{exportNotification.message}</span>
          </div>
          <button
            onClick={() => setExportNotification(null)}
            className="text-gray-400 hover:text-white text-xs font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Unified Single Control Toolbar: Sheet Switcher (Left) + Search & Export Excel (Right) */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-2.5 sm:p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Sheet Switcher Tabs + Live Sync Badge */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 p-1 bg-[#0E131F] rounded-lg border border-[#252D3D] shrink-0">
            <button
              onClick={() => setActiveSheet("prescribed")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeSheet === "prescribed"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>Sheet 1: Prescription History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#151C2C] text-cyan-400 border border-cyan-500/30">
                {filteredPrescribed.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSheet("bellurbis")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeSheet === "bellurbis"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>Sheet 2: Predicted vs Actual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#151C2C] text-purple-400 border border-purple-500/30">
                {filteredBellurbis.length}
              </span>
            </button>
          </div>

          {(isLoading || isFetching) && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              SYNCING...
            </span>
          )}
        </div>

        {/* Right: Search Filter + Export / Download Excel Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {/* Quick Search */}
          <div className="relative w-full sm:w-56 md:w-64">
            <input
              type="text"
              placeholder={
                activeSheet === "prescribed"
                  ? "Filter prescription ID or die..."
                  : "Search part serial or QR..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0E131F] border border-[#252D3D] text-gray-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500/60 placeholder-gray-500 font-mono"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Export Action Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-900/30 border border-emerald-400/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shrink-0 whitespace-nowrap"
            title="Download multi-sheet Excel (.xlsx)"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-[11px]">Generating...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-emerald-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-[11px]">Export / Download Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── SHEET 1 VIEW: PRESCRIPTION HISTORY ───────────────────────── */}
      {activeSheet === "prescribed" && (
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#252D3D] flex items-center justify-between bg-[#151C2C]/90">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span>Prescription History</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  (Min, Mean & Max limits per parameter)
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Timestamped prescribed parameters. A new record is created as soon as a new calibration is executed.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-500/30 shrink-0">
              Responsible: Neuriot labs
            </span>
          </div>

          <div className="overflow-x-auto max-h-[560px]">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header Tier 1: Groupings */}
              <thead className="bg-[#0E131F] sticky top-0 z-20">
                <tr className="border-b border-[#252D3D]">
                  <th
                    colSpan={4}
                    className="px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 bg-[#121A29] border-r border-[#252D3D]"
                  >
                    Identification
                  </th>
                  <th
                    colSpan={PARAMETERS.length * 3}
                    className="px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-[#10221B]"
                  >
                    Prescribed Parameters (23 Sensor Channels)
                  </th>
                </tr>

                {/* Header Tier 2: Parameter Names */}
                <tr className="border-b border-[#252D3D] text-[10px] text-gray-300">
                  <th className="px-3 py-1.5 font-bold bg-[#121A29]">Machine ID</th>
                  <th className="px-3 py-1.5 font-bold bg-[#121A29]">Die ID</th>
                  <th className="px-3 py-1.5 font-bold bg-[#121A29]">Prescription ID</th>
                  <th className="px-3 py-1.5 font-bold bg-[#121A29] border-r border-[#252D3D]">
                    Date Provided
                  </th>
                  {PARAMETERS.map((p) => (
                    <th
                      key={p}
                      colSpan={3}
                      className="px-2 py-1.5 font-bold text-center border-r border-[#252D3D]/60 bg-[#16222F]"
                    >
                      {p}
                    </th>
                  ))}
                </tr>

                {/* Header Tier 3: Min / Mean / Max */}
                <tr className="border-b border-[#252D3D] text-[9px] font-mono uppercase text-gray-400 bg-[#0E131F]">
                  <th className="px-3 py-1" />
                  <th className="px-3 py-1" />
                  <th className="px-3 py-1" />
                  <th className="px-3 py-1 border-r border-[#252D3D]" />
                  {PARAMETERS.map((p) => (
                    <span key={p} className="contents">
                      <th className="px-1.5 py-1 text-center text-blue-400 font-semibold">Min</th>
                      <th className="px-1.5 py-1 text-center text-emerald-400 font-semibold">Mean</th>
                      <th className="px-1.5 py-1 text-center text-amber-400 font-semibold border-r border-[#252D3D]/60">Max</th>
                    </span>
                  ))}
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody className="divide-y divide-[#252D3D]/60 font-mono text-[11px]">
                {filteredPrescribed.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4 + PARAMETERS.length * 3}
                      className="py-12 text-center text-gray-500 font-sans"
                    >
                      No prescribed parameter records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredPrescribed.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-cyan-950/15 transition-colors odd:bg-[#151C2C] even:bg-[#121826]"
                    >
                      <td className="px-3 py-2 font-bold text-gray-200 whitespace-nowrap">
                        {row.machine_id}
                      </td>
                      <td className="px-3 py-2 font-bold text-cyan-400 whitespace-nowrap">
                        {row.die_id}
                      </td>
                      <td className="px-3 py-2 text-gray-300 font-semibold whitespace-nowrap">
                        {row.prescription_id}
                      </td>
                      <td className="px-3 py-2 text-gray-400 border-r border-[#252D3D] whitespace-nowrap">
                        {row.date_provided}
                      </td>
                      {PARAMETERS.map((p) => {
                        const vals = row.parameters[p] || { min: "-", mean: "-", max: "-" };
                        return (
                          <span key={p} className="contents">
                            <td className="px-1.5 py-2 text-center text-blue-300/90">
                              {vals.min}
                            </td>
                            <td className="px-1.5 py-2 text-center text-emerald-300 font-semibold">
                              {vals.mean}
                            </td>
                            <td className="px-1.5 py-2 text-center text-amber-300/90 border-r border-[#252D3D]/60">
                              {vals.max}
                            </td>
                          </span>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── SHEET 2 VIEW: PREDICTED VS ACTUAL (DEFECTS) ──────────────── */}
      {activeSheet === "bellurbis" && (
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#252D3D] flex items-center justify-between bg-[#151C2C]/90">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <span>Predicted vs Actual</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  (Predicted vs. Recorded Defects)
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Part-level comparison between AI model defect predictions and shop-floor recorded defects.
              </p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-500/30 shrink-0">
              Responsible: Neuriot labs
            </span>
          </div>

          <div className="overflow-x-auto max-h-[560px]">
            <table className="w-full text-left text-xs border-collapse">
              {/* Header Tier 1: Groupings */}
              <thead className="bg-[#0E131F] sticky top-0 z-20">
                <tr className="border-b border-[#252D3D]">
                  <th
                    colSpan={9}
                    className="px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 bg-[#121A29] border-r border-[#252D3D]"
                  >
                    Identification
                  </th>
                  <th
                    colSpan={7}
                    className="px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-purple-400 bg-[#1E1730] border-r border-[#252D3D]"
                  >
                    Predicted (Defects)
                  </th>
                  <th
                    colSpan={8}
                    className="px-3 py-2 text-center text-[11px] font-extrabold uppercase tracking-wider text-amber-400 bg-[#251F14]"
                  >
                    Recorded (Defects)
                  </th>
                </tr>

                {/* Header Tier 2: Column Names */}
                <tr className="border-b border-[#252D3D] text-[10px] text-gray-300 font-bold">
                  {/* Identification */}
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Source</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Today&apos;s Date</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Machine ID</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Die ID</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Mfg Date</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Mfg Time</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Part Serial</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29]">Customer QR</th>
                  <th className="px-2.5 py-1.5 bg-[#121A29] border-r border-[#252D3D]">
                    Prescription ID
                  </th>

                  {/* Predicted */}
                  <th className="px-2 py-1.5 text-center bg-[#1E1730] text-emerald-400">OK</th>
                  <th className="px-2 py-1.5 text-center bg-[#1E1730]">Blow Hole</th>
                  <th className="px-2 py-1.5 text-center bg-[#1E1730]">Non-filling</th>
                  <th className="px-2 py-1.5 text-center bg-[#1E1730]">Porosity</th>
                  <th className="px-2 py-1.5 text-center bg-[#1E1730]">Shrinkage</th>
                  <th className="px-2 py-1.5 text-center bg-[#1E1730]">Chip-off</th>
                  <th className="px-2 py-1.5 text-center bg-[#1E1730] border-r border-[#252D3D]">Crack</th>

                  {/* Recorded */}
                  <th className="px-2 py-1.5 text-center bg-[#251F14] text-emerald-400">OK</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Blow Hole</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Non-filling</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Porosity</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Shrinkage</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Chip-off</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Crack</th>
                  <th className="px-2 py-1.5 text-center bg-[#251F14]">Other</th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody className="divide-y divide-[#252D3D]/60 font-mono text-[11px]">
                {filteredBellurbis.length === 0 ? (
                  <tr>
                    <td colSpan={24} className="py-12 text-center text-gray-500 font-sans">
                      No defect comparison records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredBellurbis.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-purple-950/15 transition-colors odd:bg-[#151C2C] even:bg-[#121826]"
                    >
                      {/* Identification */}
                      <td className="px-2.5 py-2 text-gray-300 font-semibold">{row.source}</td>
                      <td className="px-2.5 py-2 text-gray-400 whitespace-nowrap">{row.today_date}</td>
                      <td className="px-2.5 py-2 text-gray-200 whitespace-nowrap">{row.machine_id}</td>
                      <td className="px-2.5 py-2 font-bold text-cyan-400">{row.die_id}</td>
                      <td className="px-2.5 py-2 text-gray-300 whitespace-nowrap">{row.manufactured_date}</td>
                      <td className="px-2.5 py-2 text-gray-400 whitespace-nowrap">{row.manufactured_time}</td>
                      <td className="px-2.5 py-2 text-gray-200 font-semibold whitespace-nowrap">{row.part_serial}</td>
                      <td className="px-2.5 py-2 text-gray-300 whitespace-nowrap">
                        {row.customer_qr || <span className="text-gray-600 font-sans text-[11px]">—</span>}
                      </td>
                      <td className="px-2.5 py-2 text-cyan-300 border-r border-[#252D3D] whitespace-nowrap">{row.prescription_id}</td>

                      {/* Predicted */}
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.predicted.ok === "OK"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-950/80 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {row.predicted.ok}
                        </span>
                      </td>
                      <td className={`px-2 py-2 text-center ${row.predicted.blow_hole !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.predicted.blow_hole}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.predicted.non_filling !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.predicted.non_filling}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.predicted.porosity !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.predicted.porosity}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.predicted.shrinkage !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.predicted.shrinkage}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.predicted.chip_off !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.predicted.chip_off}
                      </td>
                      <td className={`px-2 py-2 text-center border-r border-[#252D3D] ${row.predicted.crack !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.predicted.crack}
                      </td>

                      {/* Recorded */}
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.recorded.ok === "OK"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-950/80 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {row.recorded.ok}
                        </span>
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.blow_hole !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.recorded.blow_hole}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.non_filling !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.recorded.non_filling}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.porosity !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.recorded.porosity}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.shrinkage !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.recorded.shrinkage}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.chip_off !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.recorded.chip_off}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.crack !== "0" ? "text-red-400 font-bold bg-red-950/20" : "text-gray-500"}`}>
                        {row.recorded.crack}
                      </td>
                      <td className={`px-2 py-2 text-center ${row.recorded.other !== "0" ? "text-amber-400 font-bold bg-amber-950/20" : "text-gray-500"}`}>
                        {row.recorded.other}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

