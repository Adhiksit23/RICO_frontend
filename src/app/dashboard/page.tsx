"use client";

import DefectPieChart from "@/components/DefectPieChart";
import SummaryCard from "@/components/SummaryCard";
import CustomDropdown from "@/components/CustomDropdown";

import { useEffect, useState } from "react";
import { DashboardService } from "@/services";


export default function DashboardPage() {
  const [selectedClient, setSelectedClient] = useState("Suzuki");
  const [selectedMachine, setSelectedMachine] = useState("UBE 850T-1");
  const [selectedDie, setSelectedDie] = useState("S-16");
  const [selectedPeriod, setSelectedPeriod] = useState("Last Month");

  const clients = ["Suzuki", "Hero", "Bajaj", "TVS"];
  const machines = ["UBE 850T-1", "UBE 850T-2", "UBE 850T-3"];
  const dies = ["S-14", "S-16", "S-17", "S-18"];
  const periods = ["Today", "Last 7 Days", "Last Month", "Year to Date"];

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
    DashboardService
      .getSummary()
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/60 pb-3.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-cyan-400 tracking-tight leading-none uppercase">
            DEFECTS DASHBOARD
          </h1>
          <p className="text-gray-400 mt-1 text-xs font-medium">
            Production quality overview & defect distribution analytics
          </p>
        </div>

        <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold tracking-wider bg-[#151C2C] px-3 py-1.5 rounded-full border border-gray-800/80 shrink-0 w-fit">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-[10px]">LIVE TELEMETRY</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <CustomDropdown
          label="CLIENT"
          options={clients}
          value={selectedClient}
          onChange={setSelectedClient}
        />
        <CustomDropdown
          label="MACHINE"
          options={machines}
          value={selectedMachine}
          onChange={setSelectedMachine}
        />
        <CustomDropdown
          label="DIE"
          options={dies}
          value={selectedDie}
          onChange={setSelectedDie}
        />
        <CustomDropdown
          label="PERIOD"
          options={periods}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />
      </div>


      {/* Stats Summary Cards — Reusable Component with Title (Top-Left), Info (Top-Right), Centered Number */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          title="Total Parts Produced"
          topRightText="Live Stream"
          value={summary.total_parts.toLocaleString()}
          subtitle="Last Month • 850T-1 • incl. warm-up"
          variant="cyan"
        />

        <SummaryCard
          title="Total Defective Parts"
          topRightText="Sync Active"
          value={summary.defective_parts.toLocaleString()}
          subtitle="Incl. 3,352 warm-up defects"
          variant="red"
        />

        <SummaryCard
          title="% Defect Rate"
          topRightText="Target <15%"
          value={`${summary.defect_rate}%`}
          subtitle={`${summary.defective_parts.toLocaleString()} of ${summary.total_parts.toLocaleString()} parts`}
          variant="yellow"
        />
      </div>

      {/* Analytics Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Pie Chart Card (Made Larger) */}
        <div className="lg:col-span-5 bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-[#252D3D]/60">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase">
              Defect Distribution
            </h2>
            <span className="text-gray-400 text-[11px] font-mono font-semibold">
              n = {summary.defective_parts.toLocaleString()}
            </span>
          </div>
          <div className="flex-1 w-full flex items-center justify-center my-2">
            <DefectPieChart />
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="lg:col-span-7 bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-3 pb-2 border-b border-[#252D3D]">
            <h2 className="text-xs sm:text-sm font-extrabold tracking-wider text-gray-200 uppercase">
              Defect Breakdown
            </h2>
            <span className="text-gray-400 text-[10px] font-medium">
              % of defects • % of total parts
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-[#252D3D] pb-2">
                  <th className="pb-2 font-extrabold">Defect Category</th>
                  <th className="pb-2 font-extrabold">Count</th>
                  <th className="pb-2 font-extrabold">% Defects</th>
                  <th className="pb-2 font-extrabold">Defect Rate</th>
                  <th className="pb-2 font-extrabold">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252D3D]/40 text-xs font-semibold">
                {defects.map((item) => (
                  <tr key={item.name} className="hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                        <span className="text-gray-200">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-white font-mono">{item.count}</td>
                    <td className="py-2 text-gray-300 font-mono">{item.percent}</td>
                    <td className="py-2 text-gray-300 font-mono">{item.rate}</td>
                    <td className="py-2 w-28 sm:w-32">
                      <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`${item.color} h-full rounded-full`}
                          style={{ width: item.width }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-2">
            {defects.map((item) => (
              <div key={item.name} className="bg-[#111827] border border-[#252D3D] rounded-lg p-2.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-gray-200 font-bold text-xs">{item.name}</span>
                  </div>
                  <span className="text-cyan-400 font-bold text-xs font-mono">{item.count}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>Share: <strong className="text-gray-200 font-mono">{item.percent}</strong></span>
                  <span>Rate: <strong className="text-gray-200 font-mono">{item.rate}</strong></span>
                </div>
                <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}