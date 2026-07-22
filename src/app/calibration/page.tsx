
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const base_api = "https://outspoken-pandemic-surfer.ngrok-free.dev";

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

type RangesResponse = {
  ranges: Record<string, RangeData>;
  samples_analyzed: number;
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
  const [isCalculated, setIsCalculated] = useState(false); // New toggle state
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
      const res = await fetch(
        `${base_api}/api/calibration/latest?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      
      const data = await res.json();
      
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
      setIsCalculated(false); // Reset toggle when fetching latest
      setSummary({samples_analyzed: 0,});
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
      const res = await fetch(
        `${base_api}/api/calibration/ranges?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      const data: RangesResponse = await res.json();
      
      
      setRanges(data.ranges || {});
      setSummary({samples_analyzed: data.samples_analyzed || 0,});
      console.log(data.samples_analyzed)
      

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
      setIsCalculated(true); // Enable calculated view

      setStatusMessage("Calculated optimized windows successfully.");
      setStatusType("success");
    } catch (err) {
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
      
      payload[backendKey] = { ...value, 
        baseline: finalValue, 
        min_range: finalMin,
        max_range: finalMax,};
    });
    return payload;
  };

  const applyCalibration = async () => {
    setIsApplying(true);
    try {
      const res = await fetch(
        `${base_api}/api/calibration/apply?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify(buildPayload()),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
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
      <div className="bg-[#07111F] min-h-screen w-full flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin">
        </div>
        <p className="text-cyan-400 font-semibold tracking-wide animate-pulse">Loading Latest Configuration...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#07111F] min-h-screen text-white w-full max-w-none px-6 md:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-[38px] font-bold">Machine Calibration</h1>
      </div>
      
      {/* SUMMARY STATS - Single Card */}
      <div className="mb-6">
        <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm inline-block min-w-[250px]">
          <div className="text-[11px] uppercase tracking-[2px] text-gray-500 mb-1.5">Samples Analyzed</div>
          <div className="text-white text-3xl font-bold">
             {summary.samples_analyzed.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="mb-8 flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4">
          <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)} className="bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm outline-none cursor-pointer">
            {machines.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={selectedDie} onChange={(e) => setSelectedDie(e.target.value)} className="bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm outline-none cursor-pointer">
            {dies.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button onClick={calculateCalibration} disabled={isCalculating || isApplying} className="bg-purple-600 px-6 py-3 rounded-xl text-sm font-bold uppercase hover:bg-purple-500 transition-colors">
          {isCalculating ? "Calculating..." : "Calculate Calibration"}
        </button>
      </div>
      <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">Recipe Window Optimization</h2>
        {calculatedRows.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">No configuration data available.</div>
        ) : (
          <div className="w-full overflow-x-auto min-w-[800px]">
            <div className="grid grid-cols-[4fr_4fr_4fr] gap-4 px-4 py-3 border-b border-[#1F2937] text-xs font-bold uppercase text-gray-400">
              <div>Parameter</div>
              <div className="text-center bg-[#182335] py-1.5 rounded-md">Current</div>
              <div className="text-center bg-[#1e1c3a] py-1.5 rounded-md text-purple-300">Calculated</div>
            </div>
            {calculatedRows.map(([key, value], index) => {
              const norm = normalizeKey(key);
              const unit = value?.unit || getUnit(key);
              return (
                <div key={index} className="grid grid-cols-[4fr_4fr_4fr] gap-4 px-4 py-5 border-b border-[#182232] items-center">
                  <div><div className="text-base font-bold">{key}</div>{unit && <span className="text-xs text-gray-500">Unit: {unit}</span>}</div>
                  <div className="space-y-1 text-sm border-r border-gray-800 pr-2">
                    <div className="flex justify-between"><span className="text-gray-500">Baseline:</span><span className="text-cyan-400 font-semibold">{baselineSnapshot[norm] || "0.00"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Lower:</span><span className="text-green-400 font-medium">{baselineRanges[norm]?.lower_tolerance.toFixed(2) || "0.00"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Upper:</span><span className="text-red-400 font-medium">{baselineRanges[norm]?.upper_tolerance.toFixed(2) || "0.00"}</span></div>
                  </div>
                  <div className="space-y-1 text-sm pl-2">
                    <div className="flex justify-between items-center"><span className="text-gray-500">Target:</span>
                      <input type="number" value={isCalculated ? (latestParams[norm] ?? "") : ""}  onChange={(e) => handleChange(norm, e.target.value)} className="w-24 bg-[#07111F] border border-[#1F2937] rounded px-2 text-right outline-none focus:border-cyan-400" />
                    </div>
                    {/* Lower tolerance as input */}
                    <div className="flex justify-between"><span className="text-gray-500">Lower:</span>
                    
                    {/* <span className="text-green-400 font-semibold">{isCalculated ? value.min_range.toFixed(2) : "0.00"} {unit}</span> */}
                    <input type="number" value={isCalculated ? (latestRanges[norm]?.min_range ?? "") : ""}  onChange={(e) => handleRangeChange(norm, "min_range", e.target.value)} className="w-24 bg-[#07111F] border border-[#1F2937] rounded px-2 text-right outline-none focus:border-cyan-400" />
                    
                    </div>

                    {/* Upper tolerance as input */}
                    <div className="flex justify-between"><span className="text-gray-500">Upper:</span>
                      {/* <span className="text-red-400 font-semibold">{isCalculated ? value.max_range.toFixed(2) : "0.00"} {unit}</span> */}
                      <input type="number" value={isCalculated ? (latestRanges[norm]?.max_range ?? "") : ""}  onChange={(e) => handleRangeChange(norm, "max_range", e.target.value)} className="w-24 bg-[#07111F] border border-[#1F2937] rounded px-2 text-right outline-none focus:border-cyan-400" />
                   
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-end gap-4 mt-8">
          {statusMessage && <div className={`px-4 py-2 rounded-lg text-sm ${statusType === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{statusMessage}</div>}
          <button onClick={applyCalibration} disabled={isApplying || calculatedRows.length === 0} className="bg-cyan-500 px-8 py-3 rounded-xl font-bold text-black uppercase hover:bg-cyan-400 disabled:opacity-20 transition-colors">
            {isApplying ? "Applying..." : "Apply Calibration"}
          </button>
        </div>
      </div>
    </div>
  );
}