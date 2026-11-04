"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportService } from "@/services/report.service";
import type {
  PrescribedParameterRecord,
  PartDefectComparisonRecord,
  PredictionAccuracyReport,
  AccuracyPartAuditRow,
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
const SAMPLE_DEFECT_COMPARISON: PartDefectComparisonRecord[] = [
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
  {
    source: "Neuriot labs",
    today_date: "2026-11-04",
    machine_id: "UBE 850T-2",
    die_id: "S18",
    manufactured_date: "2026-11-04",
    manufactured_time: "08:22:30",
    part_serial: "1104135324614",
    customer_qr: "",
    prescription_id: "75",
    predicted: {
      ok: "DEFECT",
      blow_hole: "0",
      non_filling: "0",
      porosity: "1 (68%)",
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
  // Selected Sheet Tab: 3 Reports matching requested structure
  const [activeSheet, setActiveSheet] = useState<"prescribed" | "comparison" | "accuracy">("prescribed");
  const [searchTerm, setSearchTerm] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<"ALL" | "GAIN" | "LOSS">("ALL");
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

  const liveDefectComparison = reportData?.part_defect_records?.length
    ? (reportData.part_defect_records as unknown as PartDefectComparisonRecord[])
    : SAMPLE_DEFECT_COMPARISON;

  // Live or computed Prediction Accuracy
  const liveAccuracy: PredictionAccuracyReport = useMemo(() => {
    if (reportData?.prediction_accuracy) {
      return reportData.prediction_accuracy;
    }

    // Dynamic fallback evaluation matching domain definition
    const defectDefs = [
      { key: "blow_hole", label: "Blow Hole" },
      { key: "crack", label: "Crack" },
      { key: "non_filling", label: "Non-filling" },
      { key: "porosity", label: "Porosity" },
      { key: "shrinkage", label: "Shrinkage" },
      { key: "chip_off", label: "Chip-off" },
    ] as const;

    const counts: Record<string, { predicted: number; gains: number; losses: number }> = {};
    defectDefs.forEach((d) => {
      counts[d.label] = { predicted: 0, gains: 0, losses: 0 };
    });

    const audit_rows: AccuracyPartAuditRow[] = [];

    liveDefectComparison.forEach((r) => {
      defectDefs.forEach(({ key, label }) => {
        const pVal = String(r.predicted[key] || "0").trim();
        const rVal = String(r.recorded[key] || "0").trim();

        if (pVal.startsWith("1")) {
          counts[label].predicted += 1;
          const isGain = rVal.startsWith("1");
          if (isGain) {
            counts[label].gains += 1;
          } else {
            counts[label].losses += 1;
          }
          audit_rows.push({
            part_serial: r.part_serial,
            customer_qr: r.customer_qr,
            prescription_id: r.prescription_id,
            machine_id: r.machine_id,
            die_id: r.die_id,
            manufactured_date: r.manufactured_date,
            manufactured_time: r.manufactured_time,
            defect_type: label,
            predicted_label: pVal,
            recorded_label: rVal,
            outcome: isGain ? "GAIN" : "LOSS",
          });
        }
      });
    });

    let totalPred = 0;
    let totalGains = 0;
    let totalLosses = 0;

    const breakdown = defectDefs.map(({ label }) => {
      const c = counts[label];
      totalPred += c.predicted;
      totalGains += c.gains;
      totalLosses += c.losses;
      return {
        defect_type: label,
        predicted_count: c.predicted,
        gains: c.gains,
        losses: c.losses,
        accuracy_pct: c.predicted > 0 ? Number(((c.gains / c.predicted) * 100).toFixed(1)) : 0,
      };
    });

    const overallPct = totalPred > 0 ? Number(((totalGains / totalPred) * 100).toFixed(1)) : 0;

    return {
      sample_size: totalPred,
      total_gains: totalGains,
      total_losses: totalLosses,
      overall_accuracy_pct: overallPct,
      breakdown,
      audit_rows,
    };
  }, [reportData?.prediction_accuracy, liveDefectComparison]);

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

  const filteredDefectComparison = useMemo(() => {
    return liveDefectComparison.filter((row) => {
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
  }, [liveDefectComparison, die, machine, searchTerm]);

  const filteredAuditRows = useMemo(() => {
    return liveAccuracy.audit_rows.filter((row) => {
      if (die !== "All" && row.die_id !== die) return false;
      if (machine !== "All" && row.machine_id !== machine) return false;
      if (outcomeFilter !== "ALL" && row.outcome !== outcomeFilter) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        row.part_serial.toLowerCase().includes(q) ||
        row.customer_qr.toLowerCase().includes(q) ||
        row.prescription_id.toLowerCase().includes(q) ||
        row.defect_type.toLowerCase().includes(q) ||
        row.outcome.toLowerCase().includes(q)
      );
    });
  }, [liveAccuracy.audit_rows, die, machine, outcomeFilter, searchTerm]);

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
              <span>Prescription History</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#151C2C] text-cyan-400 border border-cyan-500/30">
                {filteredPrescribed.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSheet("comparison")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeSheet === "comparison"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>Predicted vs Actual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#151C2C] text-purple-400 border border-purple-500/30">
                {filteredDefectComparison.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSheet("accuracy")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                activeSheet === "accuracy"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>Prediction Accuracy</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#151C2C] text-emerald-400 border border-emerald-500/30">
                {liveAccuracy.overall_accuracy_pct}%
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
                  : activeSheet === "comparison"
                  ? "Search part serial or QR..."
                  : "Search serial, defect, outcome..."
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
      {activeSheet === "comparison" && (
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
                {filteredDefectComparison.length === 0 ? (
                  <tr>
                    <td colSpan={24} className="py-12 text-center text-gray-500 font-sans">
                      No defect comparison records found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredDefectComparison.map((row, idx) => (
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

      {/* ===================================================================== */}
      {/* VIEW 3: PREDICTION ACCURACY REPORT                                    */}
      {/* ===================================================================== */}
      {activeSheet === "accuracy" && (
        <div className="space-y-4">
          {/* Methodology & Domain Context Banner */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    PREDICTION ACCURACY EVALUATION
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    3-Day Post Production
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sample base: All predicted defects across the 6 target categories. Evaluated against confirmed shop floor inspection results.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 mt-2 font-mono">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <strong>Gain:</strong> Predicted defect matched actual defect of same type
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <strong>Loss:</strong> Predicted defect did not appear as actual defect
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    <strong>Ignored:</strong> Actual defects not predicted are omitted from precision metric
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 font-mono border-t md:border-t-0 md:border-l border-[#252D3D] pt-2 md:pt-0 md:pl-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-sans">Responsible</div>
              <div className="text-xs font-bold text-cyan-400 mt-0.5">Neuriot labs</div>
            </div>
          </div>

          {/* 4 Metric KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Overall Accuracy */}
            <div className="bg-[#151C2C] border border-emerald-500/30 rounded-xl p-3.5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Overall Accuracy
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {liveAccuracy.overall_accuracy_pct}%
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Hit Rate
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1 font-mono">
                {liveAccuracy.total_gains} of {liveAccuracy.sample_size} confirmed
              </div>
              <div className="w-full bg-[#0E131F] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, liveAccuracy.overall_accuracy_pct))}%` }}
                />
              </div>
            </div>

            {/* Card 2: Total Predicted Sample */}
            <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5 relative overflow-hidden">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Total Predicted Defects
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {liveAccuracy.sample_size}
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold font-sans">
                  Sample Base
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Across 6 target defect categories
              </div>
              <div className="w-full bg-[#0E131F] h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full w-full" />
              </div>
            </div>

            {/* Card 3: Confirmed Defects (Gains) */}
            <div className="bg-[#151C2C] border border-emerald-500/20 rounded-xl p-3.5 relative overflow-hidden">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Confirmed Defects (Gains)
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  {liveAccuracy.total_gains}
                </span>
                <span className="text-[11px] text-emerald-300 font-semibold font-mono">
                  TP Matches
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Predicted defects verified on shop floor
              </div>
              <div className="w-full bg-[#0E131F] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      liveAccuracy.sample_size > 0
                        ? (liveAccuracy.total_gains / liveAccuracy.sample_size) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Card 4: False Alarms (Losses) */}
            <div className="bg-[#151C2C] border border-amber-500/20 rounded-xl p-3.5 relative overflow-hidden">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                False Alarms (Losses)
              </div>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                  {liveAccuracy.total_losses}
                </span>
                <span className="text-[11px] text-amber-300 font-semibold font-mono">
                  FP Cleared
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Predicted defects that cleared inspection
              </div>
              <div className="w-full bg-[#0E131F] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      liveAccuracy.sample_size > 0
                        ? (liveAccuracy.total_losses / liveAccuracy.sample_size) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 1: Defect Category Breakdown Table */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-[#111723] border-b border-[#252D3D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Defect Breakdown (6 Categories)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-gray-400">
                Evaluation: Gain / (Gain + Loss)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0E131F] text-[10px] text-gray-400 uppercase font-semibold border-b border-[#252D3D]">
                    <th className="px-4 py-2.5">Defect Category</th>
                    <th className="px-3 py-2.5 text-center">Predicted (Sample)</th>
                    <th className="px-3 py-2.5 text-center text-emerald-400">Confirmed (Gains)</th>
                    <th className="px-3 py-2.5 text-center text-amber-400">False Alarms (Losses)</th>
                    <th className="px-4 py-2.5 text-center min-w-[140px]">Gain vs Loss Ratio</th>
                    <th className="px-4 py-2.5 text-right">Accuracy Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D3D]/50 font-mono text-xs">
                  {liveAccuracy.breakdown.map((item, idx) => {
                    const gainPct =
                      item.predicted_count > 0 ? (item.gains / item.predicted_count) * 100 : 0;
                    const lossPct =
                      item.predicted_count > 0 ? (item.losses / item.predicted_count) * 100 : 0;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-white/[0.02] transition-colors odd:bg-[#151C2C] even:bg-[#121826]"
                      >
                        <td className="px-4 py-2.5 font-sans font-semibold text-gray-200">
                          {item.defect_type}
                        </td>
                        <td className="px-3 py-2.5 text-center text-white font-bold">
                          {item.predicted_count}
                        </td>
                        <td className="px-3 py-2.5 text-center text-emerald-400 font-bold">
                          {item.gains}
                        </td>
                        <td className="px-3 py-2.5 text-center text-amber-400 font-bold">
                          {item.losses}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {item.predicted_count === 0 ? (
                            <span className="text-gray-500 text-[11px] font-sans">No predictions</span>
                          ) : (
                            <div className="w-full bg-[#0E131F] h-2 rounded-full overflow-hidden flex">
                              <div
                                className="bg-emerald-400 h-full transition-all"
                                style={{ width: `${gainPct}%` }}
                                title={`Gains: ${item.gains} (${gainPct.toFixed(0)}%)`}
                              />
                              <div
                                className="bg-amber-400 h-full transition-all"
                                style={{ width: `${lossPct}%` }}
                                title={`Losses: ${item.losses} (${lossPct.toFixed(0)}%)`}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold">
                          {item.predicted_count === 0 ? (
                            <span className="text-gray-500 font-normal">—</span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] ${
                                item.accuracy_pct >= 70
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                                  : item.accuracy_pct >= 40
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                                  : "bg-red-950/80 text-red-300 border border-red-500/40"
                              }`}
                            >
                              {item.accuracy_pct}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0E131F] font-bold border-t-2 border-[#252D3D] text-xs">
                    <td className="px-4 py-2.5 text-white font-sans uppercase">
                      Total / Overall
                    </td>
                    <td className="px-3 py-2.5 text-center text-white font-mono">
                      {liveAccuracy.sample_size}
                    </td>
                    <td className="px-3 py-2.5 text-center text-emerald-400 font-mono">
                      {liveAccuracy.total_gains}
                    </td>
                    <td className="px-3 py-2.5 text-center text-amber-400 font-mono">
                      {liveAccuracy.total_losses}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="w-full bg-[#151C2C] h-2.5 rounded-full overflow-hidden flex border border-[#252D3D]">
                        <div
                          className="bg-emerald-400 h-full"
                          style={{
                            width: `${
                              liveAccuracy.sample_size > 0
                                ? (liveAccuracy.total_gains / liveAccuracy.sample_size) * 100
                                : 0
                            }%`,
                          }}
                        />
                        <div
                          className="bg-amber-400 h-full"
                          style={{
                            width: `${
                              liveAccuracy.sample_size > 0
                                ? (liveAccuracy.total_losses / liveAccuracy.sample_size) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-emerald-400 font-extrabold">
                      {liveAccuracy.overall_accuracy_pct}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 2: Part-Level Gain & Loss Audit Log */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 bg-[#111723] border-b border-[#252D3D] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Predicted Parts Audit Log (Evaluated vs Shop Floor)
                </h4>
              </div>

              {/* Outcome Quick Filter Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => setOutcomeFilter("ALL")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    outcomeFilter === "ALL"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-gray-400 hover:text-gray-200 bg-[#0E131F]"
                  }`}
                >
                  All ({liveAccuracy.audit_rows.length})
                </button>
                <button
                  onClick={() => setOutcomeFilter("GAIN")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    outcomeFilter === "GAIN"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-gray-400 hover:text-emerald-400 bg-[#0E131F]"
                  }`}
                >
                  Gains ({liveAccuracy.total_gains})
                </button>
                <button
                  onClick={() => setOutcomeFilter("LOSS")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    outcomeFilter === "LOSS"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-gray-400 hover:text-amber-400 bg-[#0E131F]"
                  }`}
                >
                  Losses ({liveAccuracy.total_losses})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 shadow">
                  <tr className="bg-[#0E131F] text-[10px] text-gray-400 uppercase font-semibold border-b border-[#252D3D]">
                    <th className="px-3 py-2">Part Serial</th>
                    <th className="px-3 py-2">Customer QR</th>
                    <th className="px-3 py-2">Prescription ID</th>
                    <th className="px-3 py-2">Machine ID</th>
                    <th className="px-2 py-2">Die ID</th>
                    <th className="px-3 py-2">Manufactured</th>
                    <th className="px-3 py-2">Defect Category</th>
                    <th className="px-3 py-2 text-center">Predicted Flag</th>
                    <th className="px-3 py-2 text-center">Recorded Defect</th>
                    <th className="px-3 py-2 text-center">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252D3D]/50 font-mono text-[11px]">
                  {filteredAuditRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-500 font-sans">
                        No predicted defect instances matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/[0.02] transition-colors odd:bg-[#151C2C] even:bg-[#121826]"
                      >
                        <td className="px-3 py-2 font-bold text-gray-200 whitespace-nowrap">
                          {row.part_serial}
                        </td>
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                          {row.customer_qr || <span className="text-gray-600 font-sans">—</span>}
                        </td>
                        <td className="px-3 py-2 text-cyan-300 whitespace-nowrap">
                          {row.prescription_id}
                        </td>
                        <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                          {row.machine_id}
                        </td>
                        <td className="px-2 py-2 font-bold text-cyan-400">
                          {row.die_id}
                        </td>
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                          {row.manufactured_date} {row.manufactured_time}
                        </td>
                        <td className="px-3 py-2 font-sans font-semibold text-white whitespace-nowrap">
                          {row.defect_type}
                        </td>
                        <td className="px-3 py-2 text-center text-purple-300 font-semibold whitespace-nowrap">
                          {row.predicted_label}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.recorded_label === "1"
                                ? "bg-red-950/80 text-red-400 border border-red-500/30"
                                : "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {row.recorded_label === "1" ? "DEFECT (1)" : "OK (0)"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">
                          {row.outcome === "GAIN" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              GAIN (CONFIRMED)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              LOSS (FALSE ALARM)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footnote */}
          <div className="pt-1 text-[11px] text-gray-500 font-mono flex items-center justify-between border-t border-[#252D3D]/50">
            <span>Responsible: Neuriot labs</span>
            <span>Shop Floor Inspection Verification: 3 days post production</span>
          </div>
        </div>
      )}
    </div>
  );
}

