"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Non-filling", value: 2031 },
  { name: "Warm-up", value: 3352 },
  { name: "Blowhole", value: 275 },
  { name: "Porosity", value: 245 },
  { name: "Shrinkage", value: 215 },
  { name: "Chip-off", value: 155 },
  { name: "Crack", value: 120 },
  { name: "Others", value: 83 },
];

const COLORS = [
  "#22D3EE",
  "#A855F7",
  "#3B82F6",
  "#FACC15",
  "#EC4899",
  "#34D399",
  "#EF4444",
  "#94A3B8",
];

export default function DefectPieChart() {
  return (
    <div className="w-full h-[280px] sm:h-[320px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={115}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight leading-none">
          22.59%
        </h2>
        <p className="text-xs text-gray-400 font-extrabold uppercase tracking-widest mt-1.5">
          DEFECT RATE
        </p>
      </div>
    </div>
  );
}