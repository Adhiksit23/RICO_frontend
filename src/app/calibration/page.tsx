"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { CalibrationService } from "@/services";
import CustomDropdown from "@/components/CustomDropdown";



type RangeData = {
  baseline: number;
  tolerance: number;
  min_range: number;
  max_range: number;
  unit?: string;
};

type BackendCalibrationItem = {
  baseline: number;
  min_range: number;
  max_range: number;
};


const getUnit = (key: string): string => {
  const lower = key.toLowerCase();
  if (lower.includes("mm")) return "mm";
  if (lower.includes("bar") || lower.includes("pressure")) return "bar";
  if (lower.includes("%")) return "%";
  if (lower.includes("sec") || lower.includes("time")) return "s";
  if (lower.includes("°c") || lower.includes("temperature")) return "°C";
  if (lower.includes("l/min")) return "L/min";
  if (lower.includes("m/s") || lower.includes("speed")) return "m/s";
  if (lower.includes("(t)")) return "T";
  return "";
};

type SummaryData = {
  samples_analyzed: number;
};

const safeParseNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined) return "0.00";
  const num = Number(val);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export default function CalibrationPage() {
  const [ranges, setRanges] = useState<Record<string, RangeData>>({});
  const [latestParams, setLatestParams] = useState<Record<string, string>>({});
  const [latestRanges, setLatestRanges] = useState<Record<string, { min_range?: string; max_range?: string }>>({});
  const [isCalculated, setIsCalculated] = useState(false);
  const [summary, setSummary] = useState<SummaryData>({ samples_analyzed: 0 });
  
  const [baselineSnapshot, setBaselineSnapshot] = useState<Record<string, string>>({});
  const [baselineRanges, setBaselineRanges] = useState<
    Record<string, { lower_tolerance: number; upper_tolerance: number }>
  >({});
  const [keyMap, setKeyMap] = useState<Record<string, string>>({});
  
  const [selectedMachine, setSelectedMachine] = useState("UBE 850T-2");
  const [selectedDie, setSelectedDie] = useState("S16");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const normalizeKey = useCallback((key: string): string => {
    return key
      .trim()
      .toLowerCase()
      .replaceAll("/", "_")
      .replaceAll("-", "_")
      .replaceAll(" ", "_");
  }, []);

  const fetchDatabaseLatest = useCallback(async () => {
    try {
      const data = await CalibrationService.getLatest(selectedMachine, selectedDie);
      
      const initialRanges: Record<string, RangeData> = {};
      const formattedSnapshot: Record<string, string> = {};
      const toleranceRanges: Record<string, { lower_tolerance: number; upper_tolerance: number }> = {};
      const mapping: Record<string, string> = {};

      if (data && typeof data === "object" && !Array.isArray(data)) {
        Object.entries(data).forEach(([k, v]) => {
          const normalized = normalizeKey(k);
          const value = v as BackendCalibrationItem;
          
          initialRanges[k] = {
            baseline: value.baseline,
            min_range: value.min_range,
            max_range: value.max_range,
            tolerance: 0
          };
          
          formattedSnapshot[normalized] = safeParseNumber(value.baseline);
          toleranceRanges[normalized] = {
            lower_tolerance: value.min_range,
            upper_tolerance: value.max_range,
          };
          mapping[normalized] = k;
        });
      }

      setRanges(initialRanges);
      setBaselineSnapshot(formattedSnapshot);
      setBaselineRanges(toleranceRanges);
      setKeyMap(mapping);
      setIsCalculated(false);
      setSummary({ samples_analyzed: 0 });
    } catch (err) {
      console.error("Failed to fetch latest DB calibration", err);
    }
  }, [selectedMachine, selectedDie, normalizeKey]);

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      await fetchDatabaseLatest();
      setIsInitialLoading(false);
    };
    loadData();
  }, [selectedMachine, selectedDie, fetchDatabaseLatest]);

  const calculateCalibration = async () => {
    setIsCalculating(true);
    setStatusMessage("");
    try {
      const data = await CalibrationService.getRanges(selectedMachine, selectedDie);
      
      setRanges(data.ranges || {});
      setSummary({ samples_analyzed: data.samples_analyzed || 0 });

      const mathInputs: Record<string, string> = {};
      const rangeInputs: Record<string, { min_range: string; max_range: string }> = {};

      Object.entries(data.ranges || {}).forEach(([k, v]) => {
        const normKey = normalizeKey(k);
        mathInputs[normKey] = safeParseNumber(v.baseline);
        rangeInputs[normKey] = {
          min_range: safeParseNumber(v.min_range),
          max_range: safeParseNumber(v.max_range),
        };
      });

      setLatestParams(mathInputs);
      setLatestRanges(rangeInputs);
      setIsCalculated(true);

      setStatusMessage("Calculated optimized windows successfully.");
      setStatusType("success");
    } catch {
      setStatusMessage("Failed to calculate targeted calibration ranges.");
      setStatusType("error");
    } finally {
      setIsCalculating(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const machines = ["UBE 850T-1", "UBE 850T-2", "UBE 850T-3"];
  const dies = ["S14", "S16", "S17"];
  const calculatedRows = useMemo(() => Object.entries(ranges), [ranges]);

  const handleChange = (key: string, value: string) => {
    setLatestParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleRangeChange = (key: string, field: "min_range" | "max_range", value: string) => {
    setLatestRanges((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const buildPayload = () => {
    const payload: Record<string, RangeData> = {};
    calculatedRows.forEach(([key, value]) => {
      const normalizedKey = normalizeKey(key);
      const backendKey = keyMap[normalizedKey] || key;
      const finalValue = latestParams[normalizedKey] !== undefined ? Number(latestParams[normalizedKey]) : (value?.baseline ?? 0);
      const finalMin =
        latestRanges[normalizedKey]?.min_range !== undefined
          ? Number(latestRanges[normalizedKey].min_range)
          : (value?.min_range ?? 0);

      const finalMax =
        latestRanges[normalizedKey]?.max_range !== undefined
          ? Number(latestRanges[normalizedKey].max_range)
          : (value?.max_range ?? 0);
      
      payload[backendKey] = {
        ...value, 
        baseline: finalValue, 
        min_range: finalMin,
        max_range: finalMax,
      };
    });
    return payload;
  };

  const applyCalibration = async () => {
    setIsApplying(true);
    try {
      const data = await CalibrationService.apply(selectedMachine, selectedDie, buildPayload());
      setStatusMessage(data.message || "Calibration Applied Successfully");
      setStatusType("success");
      await fetchDatabaseLatest();
    } catch {
      setStatusMessage("Failed to apply calibration");
      setStatusType("error");
    } finally {
      setIsApplying(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };


  if (isInitialLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-400 font-semibold tracking-wide animate-pulse text-sm">
          Loading Machine Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Machine Calibration
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Optimize tolerance windows and baseline parameters for die casting machines
          </p>
        </div>

        <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl px-4 py-3 shadow-sm flex items-center justify-between gap-6 w-full md:w-auto">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
            Samples Analyzed
          </span>
          <span className="text-cyan-400 text-xl font-bold font-mono">
            {summary.samples_analyzed.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Selectors & Calculate Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121B2B] border border-[#1F2937] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <CustomDropdown
            label="Machine"
            options={machines}
            value={selectedMachine}
            onChange={setSelectedMachine}
            className="w-full sm:w-48"
          />
          <CustomDropdown
            label="Die"
            options={dies}
            value={selectedDie}
            onChange={setSelectedDie}
            className="w-full sm:w-36"
          />
        </div>


        <button
          onClick={calculateCalibration}
          disabled={isCalculating || isApplying}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition-colors cursor-pointer w-full sm:w-auto"
        >
          {isCalculating ? "Calculating..." : "Calculate Calibration"}
        </button>
      </div>

      {/* Main Recipe Optimization Window */}
      <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-4 sm:p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-[#1F2937] pb-4">
          <h2 className="text-base sm:text-xl font-bold text-white">
            Recipe Window Optimization
          </h2>
          <span className="text-xs text-gray-400">
            {calculatedRows.length} Parameters
          </span>
        </div>

        {calculatedRows.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl text-sm">
            No configuration data available for selected machine & die.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#1F2937] text-xs font-bold uppercase text-gray-400">
                  <div className="col-span-5">Parameter</div>
                  <div className="col-span-3 text-center bg-[#182335] py-1 rounded-md">Current Baseline</div>
                  <div className="col-span-4 text-center bg-[#1e1c3a] py-1 rounded-md text-purple-300">Target Optimization</div>
                </div>

                <div className="divide-y divide-[#182232]">
                  {calculatedRows.map(([key, value], index) => {
                    const norm = normalizeKey(key);
                    const unit = value?.unit || getUnit(key);
                    return (
                      <div key={index} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-[#182335]/30 transition-colors">
                        <div className="col-span-5">
                          <div className="text-sm font-bold text-white">{key}</div>
                          {unit && <span className="text-xs text-gray-500">Unit: {unit}</span>}
                        </div>

                        <div className="col-span-3 space-y-1 text-xs border-r border-gray-800 pr-3">
                          <div className="flex justify-between"><span className="text-gray-500">Baseline:</span><span className="text-cyan-400 font-semibold">{baselineSnapshot[norm] || "0.00"}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Lower:</span><span className="text-green-400 font-medium">{baselineRanges[norm]?.lower_tolerance.toFixed(2) || "0.00"}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Upper:</span><span className="text-red-400 font-medium">{baselineRanges[norm]?.upper_tolerance.toFixed(2) || "0.00"}</span></div>
                        </div>

                        <div className="col-span-4 space-y-1.5 text-xs pl-3">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-400">Target:</span>
                            <input
                              type="number"
                              value={isCalculated ? (latestParams[norm] ?? "") : ""}
                              onChange={(e) => handleChange(norm, e.target.value)}
                              className="w-24 bg-[#07111F] border border-[#1F2937] rounded px-2 py-1 text-right text-white font-mono outline-none focus:border-cyan-400 text-xs"
                            />
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-400">Lower:</span>
                            <input
                              type="number"
                              value={isCalculated ? (latestRanges[norm]?.min_range ?? "") : ""}
                              onChange={(e) => handleRangeChange(norm, "min_range", e.target.value)}
                              className="w-24 bg-[#07111F] border border-[#1F2937] rounded px-2 py-1 text-right text-green-400 font-mono outline-none focus:border-cyan-400 text-xs"
                            />
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-gray-400">Upper:</span>
                            <input
                              type="number"
                              value={isCalculated ? (latestRanges[norm]?.max_range ?? "") : ""}
                              onChange={(e) => handleRangeChange(norm, "max_range", e.target.value)}
                              className="w-24 bg-[#07111F] border border-[#1F2937] rounded px-2 py-1 text-right text-red-400 font-mono outline-none focus:border-cyan-400 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-4">
              {calculatedRows.map(([key, value], index) => {
                const norm = normalizeKey(key);
                const unit = value?.unit || getUnit(key);
                return (
                  <div key={index} className="bg-[#07111F] border border-[#1F2937] rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-white">{key}</div>
                        {unit && <span className="text-xs text-gray-500">Unit: {unit}</span>}
                      </div>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono">
                        Base: {baselineSnapshot[norm] || "0.00"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800 text-xs">
                      {/* Baseline details */}
                      <div className="space-y-1 bg-[#121B2B] p-2.5 rounded-lg border border-gray-800">
                        <span className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Current Range</span>
                        <div className="flex justify-between"><span className="text-gray-500">Lower:</span><span className="text-green-400 font-medium">{baselineRanges[norm]?.lower_tolerance.toFixed(2) || "0.00"}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Upper:</span><span className="text-red-400 font-medium">{baselineRanges[norm]?.upper_tolerance.toFixed(2) || "0.00"}</span></div>
                      </div>

                      {/* Targeted inputs */}
                      <div className="space-y-1 bg-[#182335] p-2.5 rounded-lg border border-purple-500/20">
                        <span className="block text-[10px] text-purple-300 uppercase font-bold mb-1">Calculated</span>
                        <div className="space-y-1">
                          <input
                            type="number"
                            placeholder="Target"
                            value={isCalculated ? (latestParams[norm] ?? "") : ""}
                            onChange={(e) => handleChange(norm, e.target.value)}
                            className="w-full bg-[#07111F] border border-gray-700 rounded px-2 py-1 text-right text-white font-mono outline-none text-xs"
                          />
                          <input
                            type="number"
                            placeholder="Min"
                            value={isCalculated ? (latestRanges[norm]?.min_range ?? "") : ""}
                            onChange={(e) => handleRangeChange(norm, "min_range", e.target.value)}
                            className="w-full bg-[#07111F] border border-gray-700 rounded px-2 py-1 text-right text-green-400 font-mono outline-none text-xs"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={isCalculated ? (latestRanges[norm]?.max_range ?? "") : ""}
                            onChange={(e) => handleRangeChange(norm, "max_range", e.target.value)}
                            className="w-full bg-[#07111F] border border-gray-700 rounded px-2 py-1 text-right text-red-400 font-mono outline-none text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Status Message & Action Bar */}
        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4 pt-4 border-t border-[#1F2937]">
          {statusMessage && (
            <div className={`px-4 py-2 rounded-lg text-xs font-semibold text-center ${statusType === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {statusMessage}
            </div>
          )}
          <button
            onClick={applyCalibration}
            disabled={isApplying || calculatedRows.length === 0}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-black px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors cursor-pointer w-full sm:w-auto text-sm"
          >
            {isApplying ? "Applying..." : "Apply Calibration"}
          </button>
        </div>
      </div>
    </div>
  );
}