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
      className="bg-[#151C2C] border rounded-xl h-[210px] p-4 relative overflow-hidden"
      style={{
        borderColor: color,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {label}
          </h3>

          <p className="text-gray-500 text-[11px] mt-1">
            {subtitle}
          </p>
        </div>

        <div
          className="text-[10px] px-2 py-[2px] rounded font-bold"
          style={{
            color,
            backgroundColor: `${color}20`,
          }}
        >
          {status}
        </div>
      </div>

      {/* Gauge */}
      <div className="flex items-center justify-center mt-5">
        <div className="relative w-32 h-32">
          {/* Background Ring */}
          <svg
            className="absolute inset-0"
            width="128"
            height="128"
          >
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
              strokeDashoffset={
                302 - (302 * value) / 100
              }
              strokeLinecap="round"
              transform="rotate(-90 64 64)"
            />
          </svg>

          {/* Needle */}
          <div
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            }}
          >
            <div
              className="w-[3px] h-10 rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
          </div>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-[38px] font-bold leading-none"
              style={{
                color,
              }}
            >
              {value}
            </div>

            <div className="text-gray-500 text-[11px] mt-1">
              % Probability
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress */}
      <div
        className="absolute bottom-0 left-0 h-[3px]"
        style={{
          backgroundColor: color,
          width: `${value}%`,
        }}
      />
    </div>
  );
}