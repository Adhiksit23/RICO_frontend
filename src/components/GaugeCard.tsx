"use client";

type GaugeCardProps = {
  value: number;
  label: string;
  subtitle: string;
  status: string;
  color: string;
};

export default function GaugeCard({
  value,
  label,
  subtitle,
  status,
  color,
}: GaugeCardProps) {
  const angle = (value / 100) * 180;

  return (
    <div
      className="bg-[#151C2C] border rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        borderColor: `${color}40`,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
            {label}
          </h3>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 leading-tight">
            {subtitle}
          </p>
        </div>

        <div
          className="text-[10px] px-2 py-0.5 rounded font-bold shrink-0"
          style={{
            color,
            backgroundColor: `${color}20`,
          }}
        >
          {status}
        </div>
      </div>

      {/* Gauge Visual */}
      <div className="flex items-center justify-center my-3">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r="48"
              stroke="#1E293B"
              strokeWidth="10"
              fill="none"
            />
            {/* Progress Arc */}
            <circle
              cx="64"
              cy="64"
              r="48"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeDasharray={302}
              strokeDashoffset={302 - (302 * value) / 100}
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
            />
          </svg>

          {/* Needle */}
          <div
            className="absolute left-1/2 top-1/2 origin-bottom transition-transform duration-500"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            }}
          >
            <div
              className="w-[2.5px] h-8 sm:h-10 rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
          </div>

          {/* Center Value Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-none"
              style={{ color }}
            >
              {value}
            </div>
            <div className="text-gray-400 text-[9px] sm:text-[10px] mt-0.5">
              % Prob.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 transition-all"
        style={{
          backgroundColor: color,
          width: `${value}%`,
        }}
      />
    </div>
  );
}