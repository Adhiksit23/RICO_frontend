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
  return (
    <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 h-[105px]">
      <div className="flex justify-between items-start">
        {/* Left */}
        <div className="flex gap-3">
          {/* Gauge Meter */}
          <div className="relative w-10 h-10 mt-1">
            {/* Arc */}
            <div
              className={`absolute inset-0 rounded-full border-[3px] ${
                status === "FAIL"
                  ? "border-red-500"
                  : "border-green-500"
              }`}
            />

            {/* Needle */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full rotate-45 origin-bottom">
              <div
                className={`w-[2px] h-4 ${
                  status === "FAIL"
                    ? "bg-red-500"
                    : "bg-yellow-400"
                }`}
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-gray-400 text-sm">
              {name}
            </p>

            <div
              className={`text-[30px] font-bold leading-none mt-1 ${
                status === "FAIL"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {value}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="text-right">
          <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
            Tolerance
          </div>

          <div className="text-gray-300 text-xs mt-1">
            {tolerance}
          </div>

          <div
            className={`mt-2 text-[10px] px-2 py-1 rounded font-bold inline-block ${
              status === "OK"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}