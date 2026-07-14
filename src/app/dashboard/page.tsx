"use client";


import DefectPieChart from "@/components/DefectPieChart";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const defects = [
    {
      name: "Non-filling",
      count: "2,031",
      percent: "31.36%",
      rate: "7.09%",
      color: "bg-cyan-400",
      width: "31%",
    },
    {
      name: "Warm-up Defects",
      count: "3,352",
      percent: "51.76%",
      rate: "11.69%",
      color: "bg-purple-500",
      width: "52%",
    },
    {
      name: "Blowhole",
      count: "275",
      percent: "4.25%",
      rate: "0.96%",
      color: "bg-blue-400",
      width: "4%",
    },
    {
      name: "Porosity",
      count: "245",
      percent: "3.78%",
      rate: "0.85%",
      color: "bg-yellow-400",
      width: "3.7%",
    },
    {
      name: "Shrinkage",
      count: "215",
      percent: "3.32%",
      rate: "0.75%",
      color: "bg-pink-500",
      width: "3.3%",
    },
    {
      name: "Chip-off",
      count: "155",
      percent: "2.39%",
      rate: "0.54%",
      color: "bg-green-400",
      width: "2.4%",
    },
    {
      name: "Crack",
      count: "120",
      percent: "1.85%",
      rate: "0.42%",
      color: "bg-red-500",
      width: "1.8%",
    },
    {
      name: "Others",
      count: "83",
      percent: "1.28%",
      rate: "0.29%",
      color: "bg-gray-400",
      width: "1.2%",
    },
  ];
  const [summary, setSummary] = useState({
  total_parts: 0,
  defective_parts: 0,
  defect_rate: 0,
});

useEffect(() => {
  fetch("http://127.0.0.1:8000/api/dashboard/summary")
    .then((res) => res.json())
    .then((data) => {
      setSummary(data);
    })
    .catch((err) => {
      console.error(err);
    });
}, []);

  return (
    <div className="bg-[#0B1120] min-h-screen text-white px-7 py-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[42px] font-bold text-cyan-400 tracking-wide leading-none">
            DEFECTS DASHBOARD
          </h1>

          <p className="text-gray-500 mt-2 text-sm tracking-wide">
            Production quality overview & defect distribution
          </p>
        </div>

        <div className="text-gray-500 text-xs mt-3 tracking-widest">
          ● LIVE • 4/30/2026, 6:41:50 AM
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {[
          {
            label: "CLIENT",
            value: "Suzuki",
          },
          {
            label: "MACHINE",
            value: "850T-1 Die Casting Machine",
          },
          {
            label: "DIE",
            value: "S-16",
          },
          {
            label: "PERIOD",
            value: "Last Month",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#151C2C] border border-[#252D3D] rounded-xl h-[82px] px-5 flex flex-col justify-center relative"
          >
            <span className="text-[10px] tracking-[2px] text-gray-500 mb-2">
              {item.label}
            </span>

            <span className="text-[18px] text-gray-100">
              {item.value}
            </span>

            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              ▼
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Card 1 */}
        <div className="bg-[#151C2C] rounded-xl border border-[#252D3D] border-l-[3px] border-l-cyan-400 p-5 h-[118px]">
          <p className="text-gray-500 text-[11px] tracking-[2px] uppercase">
            Total Parts Produced
          </p>

          <h2 className="text-[54px] leading-none font-bold text-cyan-400 mt-3">
            {summary.total_parts.toLocaleString()}
          </h2>

          <p className="text-gray-500 text-xs mt-2">
            Last Month • 850T-1 • incl. warm-up
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#151C2C] rounded-xl border border-[#252D3D] border-l-[3px] border-l-red-500 p-5 h-[118px]">
          <p className="text-gray-500 text-[11px] tracking-[2px] uppercase">
            Total Defective Parts
          </p>

          <h2 className="text-[54px] leading-none font-bold text-red-400 mt-3">
            {summary.defective_parts.toLocaleString()}
          </h2>

          <p className="text-gray-500 text-xs mt-2">
            Incl. 3,352 warm-up defects
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#151C2C] rounded-xl border border-[#252D3D] border-l-[3px] border-l-yellow-400 p-5 h-[118px]">
          <p className="text-gray-500 text-[11px] tracking-[2px] uppercase">
            % Defect Rate
          </p>

          <h2 className="text-[54px] leading-none font-bold text-yellow-400 mt-3">
           {summary.defect_rate}%
          </h2>

          <p className="text-gray-500 text-xs mt-2">
             {summary.defective_parts.toLocaleString()} of{" "}
  {summary.total_parts.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-[1.05fr_1.7fr] gap-5">
        {/* Pie Chart */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-5 h-[500px]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[15px] tracking-[2px] text-gray-400 font-semibold uppercase">
              Defect Distribution
            </h2>

            <span className="text-gray-500 text-sm">
             n = {summary.defective_parts.toLocaleString()}
            </span>
          </div>

          <div className="h-[420px]">
            <DefectPieChart />
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-5 h-[500px] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[15px] tracking-[2px] text-gray-400 font-semibold uppercase">
              Defect Breakdown
            </h2>

            <span className="text-gray-500 text-xs">
              % of defects • % of total parts
            </span>
          </div>

          {/* Column Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] text-[11px] text-gray-500 uppercase tracking-[1px] border-b border-[#252D3D] pb-3 mb-3">
            <span>Defect</span>
            <span>Count</span>
            <span>% of Defects</span>
            <span>% Defect Rate</span>
            <span>Share</span>
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {defects.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] items-center text-sm"
              >
                {/* Defect Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${item.color}`}
                  />

                  <span className="text-gray-200">
                    {item.name}
                  </span>
                </div>

                {/* Count */}
                <span className="text-gray-200 font-semibold">
                  {item.count}
                </span>

                {/* Percent */}
                <span className="text-gray-400">
                  {item.percent}
                </span>

                {/* Rate */}
                <span className="text-gray-400">
                  {item.rate}
                </span>

                {/* Progress */}
                <div className="w-full bg-[#1E293B] rounded-full h-[7px] overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}