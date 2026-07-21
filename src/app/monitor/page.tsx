"use client";

import { useEffect, useState } from "react";
import GaugeCard from "@/components/GaugeCard";
import ParameterGauge from "@/components/ParameterGauge";

interface PredictionData {
  non_filling: number;
  blowhole: number;
  porosity: number;
  crack: number;
  shrinkage: number;
  chipoff: number;
}

type MonitorValues = {
  part_id?: string;
  timestamp?: string;
  [key: string]: string | number | undefined;
};

interface CalibrationRange {
  lower_tolerance: number;
  upper_tolerance: number;
}

type CalibrationValues = Record<string, CalibrationRange>;

type MonitorData = [MonitorValues, CalibrationValues];

const base_api = "https://outspoken-pandemic-surfer.ngrok-free.dev";

const parameterMap = [
  { label: "Curing Time", key: "CURING TIME", unit: "s" },
  { label: "Spray Time", key: "SPRAY TIME", unit: "s" },
  { label: "Speed 1", key: "V1", unit: "m/s" },
  { label: "Speed 2", key: "V2", unit: "m/s" },
  { label: "Speed 3", key: "V3", unit: "m/s" },
  { label: "Speed 4", key: "V4", unit: "m/s" },
  { label: "Acc Position", key: "ACCEL. POINT", unit: "mm" },
  { label: "Deacc Position", key: "DEACEL. POINT", unit: "mm" },
  { label: "Intensification Time", key: "INTEN. TIME", unit: "msec" },
  { label: "Metal Pressure", key: "METAL PRESS.", unit: "MPa" },
  { label: "Biscuit Thickness", key: "BISCUIT THICKNESS", unit: "mm" },
  { label: "Clamp Force PCT", key: "CLAMP FORCE", unit: "%" },
  { label: "Clamp Tonnage", key: "CLAMP TONNAGE", unit: "T" },
  { label: "Metal Temperature", key: "FURNACE METAL TEMP.", unit: "°C" },
  { label: "Metal Preassure", key: "METAL PRESS.", unit: "MPa" },
  { label: "Pouring Time", key: "POURING TIME", unit: "s" },
  { label: "Die Core Open Time", key: "DIE OPEN CORE OUT TIME", unit: "s" },
  { label: "Die Core Close Time", key: "DIE-CLOSE CORE IN TIME", unit: "s" },
  { label: "Ejector Time", key: "EJECTOR TIME", unit: "s" },
  { label: "Extract Time", key: "EXTRACT TIME", unit: "s" },
  { label: "Intensification Time", key: "INTEN. TIME", unit: "ms" },
  { label: "Intensification Acc. Pressure", key: "INTENSIFICATION ACC. PRESSURE", unit: "MPa" },
  { label: "Shot Acc. Pressure", key: "SHOT ACC. PRESSURE", unit: "MPa" },
  { label: "Shot Fwd Time", key: "SHOT FWD TIME", unit: "s" },

];

export default function MonitorPage() {
  const [selectedDie, setSelectedDie] = useState("S14");
  const dies = ["S14", "S16", "S17"];

  const [predictionData, setPredictionData] = useState<PredictionData>({
    non_filling: 0,
    blowhole: 0,
    porosity: 0,
    crack: 0,
    shrinkage: 0,
    chipoff: 0,
  });

  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);
      try {
        const headers = {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        };

        const [predictRes, monitorRes] = await Promise.all([
          fetch(`${base_api}/api/predictor/predict?die=${selectedDie}`, { headers }).then((res) => res.json()),
          fetch(`${base_api}/api/predictor/monitor?die=${selectedDie}`, { headers }).then((res) => res.json()),
        ]);

        setPredictionData(predictRes);
        setMonitorData(monitorRes);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsUpdating(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [selectedDie]);

  const getPredictionStatus = (value: number) => {
    if (value < 10) return { status: "LOW", color: "#22C55E" };
    if (value <= 50) return { status: "MED", color: "#F59E0B" };
    return { status: "HIGH", color: "#EF4444" };
  };

  const predictions = [
    { label: "Non-filling", subtitle: "Incomplete cavity fill", value: predictionData.non_filling, ...getPredictionStatus(predictionData.non_filling) },
    { label: "Blowhole", subtitle: "Trapped gas cavities", value: predictionData.blowhole, ...getPredictionStatus(predictionData.blowhole) },
    { label: "Porosity", subtitle: "Micro voids in structure", value: predictionData.porosity, ...getPredictionStatus(predictionData.porosity) },
    { label: "Shrinkage", subtitle: "Volumetric contraction", value: predictionData.shrinkage, ...getPredictionStatus(predictionData.shrinkage) },
    { label: "Chip-off", subtitle: "Surface fragment loss", value: predictionData.chipoff, ...getPredictionStatus(predictionData.chipoff) },
    { label: "Crack", subtitle: "Structural fracture lines", value: predictionData.crack, ...getPredictionStatus(predictionData.crack) },
  ];

  const raw = monitorData?.[0];
  const calibration = monitorData?.[1];
  const isDataLoaded = !!(raw && calibration);

  const parameters = isDataLoaded
    ? parameterMap.map((item) => {
        const value = Number(raw[item.key] ?? 0);
        const range = calibration[item.key] || { lower_tolerance: 0, upper_tolerance: 0 };
        const isOk = (value >= range.lower_tolerance) && (value <= range.upper_tolerance);

        return {
          name: item.label,
          value: `${value} ${item.unit}`,
          tolerance: `${range.lower_tolerance.toFixed(1)} - ${range.upper_tolerance.toFixed(1)} ${item.unit}`,
          status: isOk ? "OK" : "FAIL",
        };
      })
    : [];

  const totalParamsCount = parameters.length;
  const okCount = parameters.filter((p) => p.status === "OK").length;

  return (
    <div className="bg-[#0B1120] min-h-screen text-white px-4 md:px-8 py-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-800/60">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-2xl md:text-[34px] font-bold tracking-tight leading-none">
              Die Casting Process Monitor
            </h1>
            {isUpdating && (
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded animate-pulse">
                Updating...
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedDie}
              onChange={(e) => setSelectedDie(e.target.value)}
              className="bg-[#121B2B] border border-[#1F2937] rounded-lg px-3 py-1.5 text-sm text-white outline-none cursor-pointer"
            >
              {dies.map((die) => (
                <option key={die} value={die}>
                  {die}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-xs md:text-sm">
              Live IoT parameters • Post-cast defect prediction
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 md:gap-6 text-left lg:text-right w-full lg:w-auto justify-start lg:justify-end">
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider">Part ID</div>
            <div className="text-cyan-400 font-semibold text-xs md:text-sm mt-0.5">
              {raw?.part_id ?? "Loading..."}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider">Timestamp</div>
            <div className="text-gray-300 text-xs md:text-sm mt-0.5">
              {raw?.timestamp ? new Date(raw.timestamp).toLocaleString() : "Loading..."}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider">Verdict</div>
            <div className={`font-bold text-xs md:text-sm mt-0.5 ${!isDataLoaded? "text-gray-400": 
              (totalParamsCount - okCount > 3) ? "text-red-400" : "text-green-400"}`}>
              {isDataLoaded ? (totalParamsCount - okCount > 3) ? "REJECT" : "PASS" : "..."} 
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider">Params</div>
            <div className="text-yellow-400 font-semibold text-xs md:text-sm mt-0.5">
              {isDataLoaded ? `${okCount}/${totalParamsCount} OK` : "0/0 OK"}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          POST-CAST DEFECT PREDICTION
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {predictions.map((item) => (
            <GaugeCard
              key={item.label}
              label={item.label}
              subtitle={item.subtitle}
              value={item.value}
              status={item.status}
              color={item.color}
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          LIVE PROCESS PARAMETERS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {isDataLoaded ? (
            parameters.map((item) => (
              <ParameterGauge
                key={item.name}
                name={item.name}
                value={item.value}
                tolerance={item.tolerance}
                status={item.status}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 text-sm bg-[#111827]/40 border border-gray-800 rounded-xl">
              Performing primary telemetry fetch sequence...
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-gray-600 text-[11px] mt-8 border-t border-gray-900 pt-4">
        Data refreshes every 1 minute • Simulated IoT feed
      </div>
    </div>
  );
}