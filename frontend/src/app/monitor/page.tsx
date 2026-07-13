// // "use client";

// // import { useEffect, useState } from "react";
// // import GaugeCard from "@/components/GaugeCard";
// // import ParameterGauge from "@/components/ParameterGauge";

// // const parameterMap = [
// //   { label: "Cooling Time", key: "CURING TIME", unit: "s" },
// //   { label: "Spray Time", key: "SPRAY TIME", unit: "s" },
// //   { label: "Speed 2", key: "V2", unit: "m/s" },
// //   { label: "Speed 4", key: "V4", unit: "m/s" },
// //   { label: "Acc Position", key: "ACCEL. POINT", unit: "mm" },
// //   { label: "Deacc Position", key: "DEACEL. POINT", unit: "mm" },
// //   { label: "Intensification Time", key: "INTEN. TIME", unit: "msec" },
// //   { label: "Metal Pressure", key: "METAL PRESS.", unit: "MPa" },
// //   { label: "Biscuit Thickness", key: "BISCUIT THICKNESS", unit: "mm" },
// //   { label: "Clamp Force", key: "CLAMP FORCE", unit: "%" },
// //   { label: "Metal Temperature", key: "FURNACE METAL TEMP.", unit: "°C" },
// // ];


// // // const parameterMap = [
// // //   { label: "Cooling Time", key: "CURING TIME", unit: "s" },
// // //   { label: "Spray Time", key: "SPRAY TIME", unit: "s" },
// // //   { label: "Speed 2", key: "V2", unit: "m/s" },
// // //   { label: "Speed 4", key: "V4", unit: "m/s" },
// // //   { label: "Acc Position", key: "ACCEL. POINT", unit: "mm" },
// // //   { label: "Deacc Position", key: "DEACEL. POINT", unit: "mm" },
// // //   { label: "Intensification Time", key: "INTEN. TIME", unit: "msec" },
// // //   { label: "Metal Pressure", key: "METAL PRESS.", unit: "MPa" },
// // //   { label: "Biscuit Thickness", key: "BISCUIT THICKNESS", unit: "mm" },
// // //   { label: "Clamp Force", key: "CLAMP FORCE", unit: "%" },
// // //   { label: "Metal Temperature", key: "FURNACE METAL TEMP.", unit: "°C" },
// // // ];

// // export default function MonitorPage() {
// //   const [predictionData, setPredictionData] = useState({
// //     non_filling: 0,
// //     blowhole: 0,
// //     porosity: 0,
// //     crack: 0,
// //     shrinkage: 0,
// //     chipoff: 0,
// //   });

// //   const [monitorData, setMonitorData] = useState<any[]>([]);
// //   const [isUpdating, setIsUpdating] = useState(false);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setIsUpdating(true);

// //       // 1. Await update and verify HTTP response success before pulling down current state
// //       // try {
// //       //   const response = await fetch("http://127.0.0.1:8000/api/predictor/update");
        
// //       //   if (!response.ok) {
// //       //     throw new Error(`Update endpoint returned status: ${response.status}`);
// //       //   }
// //       // } catch (err) {
// //       //   console.warn("IoT update failed:", err);
// //       // }

// //       // 2. Query UI dashboard telemetry payloads sequentially from backend database
// //       try {
// //         const [predictRes, monitorRes] = await Promise.all([
// //           fetch("http://127.0.0.1:8000/api/predictor/predict").then((res) => res.json()),
// //           fetch("http://127.0.0.1:8000/api/predictor/monitor").then((res) => res.json()),
// //         ]);

// //         setPredictionData(predictRes);
// //         setMonitorData(monitorRes);
// //       } catch (err) {
// //         console.error("Error fetching dashboard data:", err);
// //       } finally {
// //         setIsUpdating(false);
// //       }
// //     };

// //     fetchData();

// //     // Set interval loop to trigger cycle every 1 minute
// //     const interval = setInterval(fetchData, 60000);

// //     return () => clearInterval(interval);
// //   }, []);

// //   const getPredictionStatus = (value: number) => {
// //     if (value < 10) return { status: "LOW", color: "#22C55E" };
// //     if (value <= 50) return { status: "MED", color: "#F59E0B" };
// //     return { status: "HIGH", color: "#EF4444" };
// //   };

// //   const predictions = [
// //     {
// //       label: "Non-filling",
// //       subtitle: "Incomplete cavity fill",
// //       value: predictionData.non_filling,
// //       ...getPredictionStatus(predictionData.non_filling),
// //     },
// //     {
// //       label: "Blowhole",
// //       subtitle: "Trapped gas cavities",
// //       value: predictionData.blowhole,
// //       ...getPredictionStatus(predictionData.blowhole),
// //     },
// //     {
// //       label: "Porosity",
// //       subtitle: "Micro voids in structure",
// //       value: predictionData.porosity,
// //       ...getPredictionStatus(predictionData.porosity),
// //     },
// //     {
// //       label: "Shrinkage",
// //       subtitle: "Volumetric contraction",
// //       value: predictionData.shrinkage,
// //       ...getPredictionStatus(predictionData.shrinkage),
// //     },
// //     {
// //       label: "Chip-off",
// //       subtitle: "Surface fragment loss",
// //       value: predictionData.chipoff,
// //       ...getPredictionStatus(predictionData.chipoff),
// //     },
// //     {
// //       label: "Crack",
// //       subtitle: "Structural fracture lines",
// //       value: predictionData.crack,
// //       ...getPredictionStatus(predictionData.crack),
// //     },
// //   ];

// //   const raw = monitorData[0];
// //   const calibration = monitorData[1];
// //   const isDataLoaded = !!(raw && calibration);

// //   const parameters = isDataLoaded
// //     ? parameterMap.map((item) => {
// //         const value = raw[item.key] ?? 0;
// //         const range = calibration[item.key] || { lower_tolerance: 0, upper_tolerance: 0 };
// //         const isOk = value >= range.lower_tolerance && value <= range.upper_tolerance;

// //         return {
// //           name: item.label,
// //           value: `${value} ${item.unit}`,
// //           tolerance: `${range.lower_tolerance.toFixed(2)} - ${range.upper_tolerance.toFixed(2)} ${item.unit}`,
// //           status: isOk ? "OK" : "FAIL",
// //         };
// //       })
// //     : [];

// //   const totalParamsCount = parameters.length;
// //   const okCount = parameters.filter((p) => p.status === "OK").length;

// //   return (
// //     <div className="bg-[#0B1120] min-h-screen text-white px-6 py-5">
// //       {/* Header */}
// //       <div className="flex justify-between items-start mb-5">
// //         <div>
// //           <div className="flex items-center gap-3">
// //             <h1 className="text-[38px] font-bold leading-none">
// //               Die Casting Process Monitor
// //             </h1>
// //             {isUpdating && (
// //               <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded animate-pulse mt-1">
// //                 Updating IoT Data...
// //               </span>
// //             )}
// //           </div>
// //           <p className="text-gray-500 mt-2 text-sm">
// //             Live IoT parameters • Post-cast defect prediction
// //           </p>
// //         </div>

// //         {/* Right Info */}
// //         <div className="flex gap-8 text-right mt-1">
// //           <div>
// //             <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
// //               Part ID
// //             </div>
// //             <div className="text-cyan-400 font-semibold text-sm mt-1">
// //               DC-2026-47905
// //             </div>
// //           </div>

// //           <div>
// //             <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
// //               Timestamp
// //             </div>
// //             <div className="text-white text-sm mt-1">
// //               4/30/2026 6:51:13 AM
// //             </div>
// //           </div>

// //           <div>
// //             <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
// //               Verdict
// //             </div>
// //             <div className="text-red-400 font-semibold text-sm mt-1">
// //               REJECT
// //             </div>
// //           </div>

// //           <div>
// //             <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
// //               Params
// //             </div>
// //             <div className="text-yellow-400 font-semibold text-sm mt-1">
// //               {isDataLoaded ? `${okCount}/${totalParamsCount} OK` : "0/0 OK"}
// //             </div>
// //           </div>

// //           <div className="w-3 h-3 bg-green-400 rounded-full mt-6" />
// //         </div>
// //       </div>

// //       {/* Prediction Header */}
// //       <div className="mb-3">
// //         <h2 className="text-[15px] font-semibold uppercase tracking-[2px]">
// //           POST-CAST DEFECT PREDICTION
// //         </h2>
// //         <p className="text-gray-500 text-xs mt-1">
// //           Top 6 defect modes • AI-inferred from upstream parameters
// //         </p>
// //       </div>

// //       {/* Prediction Cards */}
// //       <div className="grid grid-cols-6 gap-4 mb-6">
// //         {predictions.map((item) => (
// //           <GaugeCard
// //             key={item.label}
// //             label={item.label}
// //             subtitle={item.subtitle}
// //             value={item.value}
// //             status={item.status}
// //             color={item.color}
// //           />
// //         ))}
// //       </div>

// //       {/* Parameters Header */}
// //       <div className="mb-3">
// //         <h2 className="text-[15px] font-semibold uppercase tracking-[2px]">
// //           LIVE PROCESS PARAMETERS
// //         </h2>
// //         <p className="text-gray-500 text-xs mt-1">
// //           {isDataLoaded ? totalParamsCount : 0} key parameters monitored against tolerance limits
// //         </p>
// //       </div>

// //       {/* Parameters Grid */}
// //       <div className="grid grid-cols-4 gap-4">
// //         {isDataLoaded ? (
// //           parameters.map((item) => (
// //             <ParameterGauge
// //               key={item.name}
// //               name={item.name}
// //               value={item.value}
// //               tolerance={item.tolerance}
// //               status={item.status}
// //             />
// //           ))
// //         ) : (
// //           <div className="col-span-4 text-center py-6 text-gray-500 text-sm">
// //             Performing primary telemetry fetch sequence...
// //           </div>
// //         )}
// //       </div>

// //       {/* Footer */}
// //       <div className="text-center text-gray-500 text-xs mt-5">
// //         Data refreshes every 1 minute • Simulated IoT feed
// //       </div>
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import GaugeCard from "@/components/GaugeCard";
// import ParameterGauge from "@/components/ParameterGauge";

// // Global constant definition — safe from React hook re-render loops

// const base_api = "https://outspoken-pandemic-surfer.ngrok-free.dev"
// // const base_api = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// const parameterMap = [
//   { label: "Cooling Time", key: "CURING TIME", unit: "s" },
//   { label: "Spray Time", key: "SPRAY TIME", unit: "s" },
//   { label: "Speed 2", key: "V2", unit: "m/s" },
//   { label: "Speed 4", key: "V4", unit: "m/s" },
//   { label: "Acc Position", key: "ACCEL. POINT", unit: "mm" },
//   { label: "Deacc Position", key: "DEACEL. POINT", unit: "mm" },
//   { label: "Intensification Time", key: "INTEN. TIME", unit: "msec" },
//   { label: "Metal Pressure", key: "METAL PRESS.", unit: "MPa" },
//   { label: "Biscuit Thickness", key: "BISCUIT THICKNESS", unit: "mm" },
//   { label: "Clamp Force", key: "CLAMP FORCE", unit: "%" },
//   { label: "Metal Temperature", key: "FURNACE METAL TEMP.", unit: "°C" },
// ];

// type TelemetryRecord = Record<string, number | undefined>;
// type CalibrationRecord = Record<string, { lower_tolerance: number; upper_tolerance: number } | undefined>;

// export default function MonitorPage() {
//   const [predictionData, setPredictionData] = useState({
//     non_filling: 0,
//     blowhole: 0,
//     porosity: 0,
//     crack: 0,
//     shrinkage: 0,
//     chipoff: 0,
//   });

//   const [monitorData, setMonitorData] = useState<[TelemetryRecord?, CalibrationRecord?]>([]);
//   const [isUpdating, setIsUpdating] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsUpdating(true);
//       try {
//         const headers = { "ngrok-skip-browser-warning": "true" };

//         // Clean fetch pattern with direct casting on response parsing
//         const [predictRes, monitorRes] = await Promise.all([
//           fetch(`${base_api}/api/predictor/predict`, { headers }).then(
//             (res) => res.json() as Promise<typeof predictionData>
//           ),
//           fetch(`${base_api}/api/predictor/monitor`, { headers }).then(
//             (res) => res.json() as Promise<[TelemetryRecord, CalibrationRecord]>
//           ),
//         ]);

//         setPredictionData(predictRes);
//         setMonitorData(monitorRes);
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err);
//       } finally {
//         setIsUpdating(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   const getPredictionStatus = (value: number) => {
//     if (value < 10) return { status: "LOW", color: "#22C55E" };
//     if (value <= 50) return { status: "MED", color: "#F59E0B" };
//     return { status: "HIGH", color: "#EF4444" };
//   };

//   const predictions = [
//     { label: "Non-filling", subtitle: "Incomplete cavity fill", value: predictionData.non_filling, ...getPredictionStatus(predictionData.non_filling) },
//     { label: "Blowhole", subtitle: "Trapped gas cavities", value: predictionData.blowhole, ...getPredictionStatus(predictionData.blowhole) },
//     { label: "Porosity", subtitle: "Micro voids in structure", value: predictionData.porosity, ...getPredictionStatus(predictionData.porosity) },
//     { label: "Shrinkage", subtitle: "Volumetric contraction", value: predictionData.shrinkage, ...getPredictionStatus(predictionData.shrinkage) },
//     { label: "Chip-off", subtitle: "Surface fragment loss", value: predictionData.chipoff, ...getPredictionStatus(predictionData.chipoff) },
//     { label: "Crack", subtitle: "Structural fracture lines", value: predictionData.crack, ...getPredictionStatus(predictionData.crack) },
//   ];

//   const raw = monitorData[0];
//   const calibration = monitorData[1];
//   const isDataLoaded = !!(raw && calibration);

//   const parameters = isDataLoaded && raw && calibration
//     ? parameterMap.map((item) => {
//         const value = raw[item.key] ?? 0;
//         const range = calibration[item.key] || { lower_tolerance: 0, upper_tolerance: 0 };
//         const isOk = value >= range.lower_tolerance && value <= range.upper_tolerance;

//         return {
//           name: item.label,
//           value: `${value} ${item.unit}`,
//           tolerance: `${range.lower_tolerance.toFixed(1)} - ${range.upper_tolerance.toFixed(1)} ${item.unit}`,
//           status: isOk ? "OK" : "FAIL",
//         };
//       })
//     : [];

//   const totalParamsCount = parameters.length;
//   const okCount = parameters.filter((p) => p.status === "OK").length;

//   return (
//     <div className="bg-[#0B1120] min-h-screen text-white w-full max-w-none px-4 sm:px-6 md:px-8 py-6 overflow-x-hidden">
      
//       {/* Header Panel */}
//       <div className="flex flex-col lg:flex-row justify-between items-start gap-5 mb-8 pb-5 border-b border-gray-800/60 w-full">
//         <div className="flex-1 min-w-0">
//           <div className="flex flex-wrap items-center gap-3">
//             <h1 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight leading-tight break-words max-w-full">
//               Die Casting Process Monitor
//             </h1>
//             {isUpdating && (
//               <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded animate-pulse whitespace-nowrap">
//                 Live Sync
//               </span>
//             )}
//           </div>
//           <p className="text-gray-500 mt-2 text-xs md:text-sm">
//             Live IoT parameters • Post-cast defect prediction
//           </p>
//         </div>

//         {/* Polished Header Status Cards */}
//         <div className="flex flex-wrap gap-4 md:gap-6 w-full lg:w-auto items-center flex-shrink-0">
//           <div className="min-w-[120px] flex-1 sm:flex-initial rounded-lg bg-[#111827]/40 border border-gray-800 px-3 py-2">
//             <div className="text-gray-500 text-[10px] uppercase tracking-wider">Part ID</div>
//             <div className="text-cyan-400 font-semibold text-xs md:text-sm mt-0.5 truncate">DC-2026-47905</div>
//           </div>
//           <div className="min-w-[150px] flex-1 sm:flex-initial rounded-lg bg-[#111827]/40 border border-gray-800 px-3 py-2">
//             <div className="text-gray-500 text-[10px] uppercase tracking-wider">Timestamp</div>
//             <div className="text-gray-300 text-xs md:text-sm mt-0.5 whitespace-nowrap">4/30/2026 6:51:13 AM</div>
//           </div>
//           <div className="min-w-[90px] flex-1 sm:flex-initial rounded-lg bg-[#111827]/40 border border-gray-800 px-3 py-2">
//             <div className="text-gray-500 text-[10px] uppercase tracking-wider">Verdict</div>
//             <div className="text-red-400 font-bold text-xs md:text-sm mt-0.5">REJECT</div>
//           </div>
//           <div className="min-w-[110px] flex-1 sm:flex-initial rounded-lg bg-[#111827]/40 border border-gray-800 px-3 py-2">
//             <div className="text-gray-500 text-[10px] uppercase tracking-wider">Params</div>
//             <div className="text-yellow-400 font-semibold text-xs md:text-sm mt-0.5 whitespace-nowrap">
//               {isDataLoaded ? `${okCount}/${totalParamsCount} OK` : "0/0 OK"}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Post-Cast Defect Prediction Block */}
//       <div className="mb-8 w-full">
//         <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">
//           POST-CAST DEFECT PREDICTION
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full">
//           {predictions.map((item) => (
//             <div key={item.label} className="w-full min-w-0 transition-all duration-200">
//               <GaugeCard
//                 label={item.label}
//                 subtitle={item.subtitle}
//                 value={item.value}
//                 status={item.status}
//                 color={item.color}
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Live Process Parameters Dashboard Container */}
//       <div className="mb-8 w-full">
//         <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">
//           LIVE PROCESS PARAMETERS
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
//           {isDataLoaded ? (
//             parameters.map((item) => (
//               <div key={item.name} className="w-full min-w-0 transition-all duration-200">
//                 <ParameterGauge
//                   name={item.name}
//                   value={item.value}
//                   tolerance={item.tolerance}
//                   status={item.status}
//                 />
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-12 text-gray-500 text-sm bg-[#111827]/40 border border-gray-800 rounded-xl w-full">
//               Performing primary telemetry fetch sequence...
//             </div>
//           )}
//         </div>
//       </div>

//       {/* App Footnote */}
//       <div className="text-center text-gray-500 text-[11px] mt-10 border-t border-gray-900 pt-5 w-full">
//         Data refreshes every 1 minute • Simulated IoT feed
//       </div>
//     </div>
//   );
// }
// 
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
  { label: "Cooling Time", key: "CURING TIME", unit: "s" },
  { label: "Spray Time", key: "SPRAY TIME", unit: "s" },
  { label: "Speed 2", key: "V2", unit: "m/s" },
  { label: "Speed 4", key: "V4", unit: "m/s" },
  { label: "Acc Position", key: "ACCEL. POINT", unit: "mm" },
  { label: "Deacc Position", key: "DEACEL. POINT", unit: "mm" },
  { label: "Intensification Time", key: "INTEN. TIME", unit: "msec" },
  { label: "Metal Pressure", key: "METAL PRESS.", unit: "MPa" },
  { label: "Biscuit Thickness", key: "BISCUIT THICKNESS", unit: "mm" },
  { label: "Clamp Force", key: "CLAMP FORCE", unit: "%" },
  { label: "Metal Temperature", key: "FURNACE METAL TEMP.", unit: "°C" },
];

export default function MonitorPage() {
  const [selectedDie, setSelectedDie] = useState("S14");
  const dies = ["S14", "S15", "S16"];

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
        const isOk = value >= range.lower_tolerance && value <= range.upper_tolerance;

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
            <div className="text-red-400 font-bold text-xs md:text-sm mt-0.5">
              {isDataLoaded ? "REJECT" : "..."} 
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