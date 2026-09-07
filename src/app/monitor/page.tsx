"use client";

import { useEffect, useState } from "react";
import GaugeCard from "@/components/GaugeCard";
import ParameterGauge from "@/components/ParameterGauge";
import { MonitorService } from "@/services";
import CustomDropdown from "@/components/CustomDropdown";
import IotSyncPanel from "@/components/IotSyncPanel";
import { formatIstDateTime } from "@/lib/datetime";




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

// NOTE: Each label must be unique (used as React key) and each key should appear only once.
const parameterMap = [
  { label: "Curing Time",                   key: "CURING TIME",                   unit: "s"    },
  { label: "Spray Time",                    key: "SPRAY TIME",                    unit: "s"    },
  { label: "Speed 1",                       key: "V1",                             unit: "m/s"  },
  { label: "Speed 2",                       key: "V2",                             unit: "m/s"  },
  { label: "Speed 3",                       key: "V3",                             unit: "m/s"  },
  { label: "Speed 4",                       key: "V4",                             unit: "m/s"  },
  { label: "Acc Position",                  key: "ACCEL. POINT",                  unit: "mm"   },
  { label: "Deacc Position",                key: "DEACEL. POINT",                 unit: "mm"   },
  { label: "Intensification Time",          key: "INTEN. TIME",                   unit: "msec" },
  { label: "Metal Pressure",                key: "METAL PRESS.",                  unit: "MPa"  },
  { label: "Biscuit Thickness",             key: "BISCUIT THICKNESS",             unit: "mm"   },
  { label: "Clamp Force PCT",               key: "CLAMP FORCE",                   unit: "%"    },
  { label: "Clamp Tonnage",                 key: "CLAMP TONNAGE",                 unit: "T"    },
  { label: "Metal Temperature",             key: "FURNACE METAL TEMP.",           unit: "°C"   },
  { label: "Pouring Time",                  key: "POURING TIME",                  unit: "s"    },
  { label: "Die Core Open Time",            key: "DIE OPEN CORE OUT TIME",        unit: "s"    },
  // { label: "Die Core Close Time",           key: "DIE-CLOSE CORE IN TIME",        unit: "s"    },
  { label: "Ejector Time",                  key: "EJECTOR TIME",                  unit: "s"    },
  { label: "Extract Time",                  key: "EXTRACT TIME",                  unit: "s"    },
  { label: "Intensification Acc. Pressure", key: "INTENSIFICATION ACC. PRESSURE", unit: "MPa"  },
  { label: "Shot Acc. Pressure",            key: "SHOT ACC. PRESSURE",            unit: "MPa"  },
  { label: "Shot Fwd Time",                 key: "SHOT FWD TIME",                 unit: "s"    },
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
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);
      setApiError(null);
      try {
        const [predictRes, monitorRes] = await Promise.all([
          MonitorService.predict(selectedDie),
          MonitorService.monitor(selectedDie),
        ]);

        setPredictionData(predictRes);
        setMonitorData(monitorRes as unknown as MonitorData);
      } catch (err: unknown) {
        console.error("Error fetching dashboard data:", err);

        // Build a human-readable message from Axios or generic errors
        let message = "Unable to load monitor data. Please try again.";
        if (err && typeof err === "object") {
          const axiosErr = err as {
            response?: { status?: number; data?: { detail?: string } };
            code?: string;
            message?: string;
          };
          if (axiosErr.response?.status) {
            const status = axiosErr.response.status;
            const detail = axiosErr.response.data?.detail;
            if (status === 401) {
              message = "Session expired. Please log in again.";
            } else if (status === 403) {
              message = "Access denied. You do not have permission to view this data.";
            } else if (status === 404) {
              message = `No data found for die ${selectedDie}. Check that the die ID is correct.`;
            } else if (status >= 500) {
              message = detail
                ? `Server error: ${detail}`
                : "The server encountered an error. Please try again in a moment.";
            } else {
              message = detail ?? `Unexpected error (HTTP ${status}).`;
            }
          } else if (
            axiosErr.code === "ERR_NETWORK" ||
            axiosErr.message?.toLowerCase().includes("network")
          ) {
            message =
              "Cannot reach the backend server. Make sure the API is running and reachable.";
          } else if (axiosErr.code === "ECONNABORTED") {
            message = "Request timed out. The server took too long to respond.";
          }
        }
        setApiError(message);
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
    <div className="space-y-6">
      <IotSyncPanel />

      {/* ── API Error Banner ──────────────────────────────────────── */}
      {apiError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-300"
        >
          <span className="mt-0.5 text-red-400 text-base leading-none">⚠</span>
          <div>
            <p className="font-semibold text-red-200 mb-0.5">Data fetch failed</p>
            <p>{apiError}</p>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="ml-auto text-red-500 hover:text-red-300 transition-colors text-lg leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-800/60">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-none text-white">
              Die Casting Process Monitor
            </h1>
            {isUpdating && (
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded animate-pulse font-mono">
                Updating...
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <CustomDropdown
              options={dies}
              value={selectedDie}
              onChange={setSelectedDie}
              className="w-32"
            />

            <p className="text-gray-400 text-xs sm:text-sm">
              Live IoT parameters • Post-cast defect prediction
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 sm:gap-6 text-left lg:text-right w-full lg:w-auto justify-start lg:justify-end bg-[#121B2B] border border-[#1F2937] p-3 rounded-xl">
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Part ID</div>
            <div className="text-cyan-400 font-semibold text-xs sm:text-sm mt-0.5 font-mono">
              {raw?.part_id ?? "Loading..."}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Timestamp (IST)</div>
            <div className="text-gray-300 text-xs sm:text-sm mt-0.5 font-mono">
              {raw?.timestamp ? formatIstDateTime(raw.timestamp) : "Loading..."}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Verdict</div>
            <div className={`font-bold text-xs sm:text-sm mt-0.5 ${!isDataLoaded ? "text-gray-400" : (totalParamsCount - okCount > 3) ? "text-red-400" : "text-green-400"}`}>
              {isDataLoaded ? (totalParamsCount - okCount > 3) ? "REJECT" : "PASS" : "..."} 
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Params</div>
            <div className="text-yellow-400 font-semibold text-xs sm:text-sm mt-0.5 font-mono">
              {isDataLoaded ? `${okCount}/${totalParamsCount} OK` : "0/0 OK"}
            </div>
          </div>
        </div>
      </div>

      <div>
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

      <div>
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
    </div>
  );
}