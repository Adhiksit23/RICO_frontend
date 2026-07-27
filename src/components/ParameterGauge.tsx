"use client";

type ParameterGaugeProps = {
  name: string;
  value: string;
  tolerance: string;
  status: string;
};

export default function ParameterGauge({
  name,
  value,
  tolerance,
  status,
}: ParameterGaugeProps) {
  const isOk = status === "OK";

  return (
    <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-3.5 sm:p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
      <div className="flex justify-between items-start gap-2">
        {/* Name and Status Icon */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isOk ? "bg-green-400 animate-pulse" : "bg-red-500 animate-bounce"
            }`}
          />
          <p className="text-gray-300 text-xs sm:text-sm font-medium truncate">
            {name}
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
            isOk
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Main Metric Value & Tolerance */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight ${
            isOk ? "text-green-400" : "text-red-400"
          }`}
        >
          {value}
        </div>

        <div className="text-right shrink-0">
          <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
            Tol.
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            {tolerance}
          </span>
        </div>
      </div>
    </div>
  );
}