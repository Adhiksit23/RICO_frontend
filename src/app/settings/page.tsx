"use client";

import { useState } from "react";
import { SettingsService } from "@/services";


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"masters" | "iot" | "ai">("masters");
  const [status, setStatus] = useState("");
  
  // Form states
  const [customer, setCustomer] = useState("");
  const [part, setPart] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("Suzuki");
  const [machine, setMachine] = useState("");
  const [machineType, setMachineType] = useState("HPDC (High Pressure Die Casting)");
  const [location, setLocation] = useState("");
  const [die, setDie] = useState("");
  const [partType, setPartType] = useState("Gear Housing");
  const [assignedMachine, setAssignedMachine] = useState("Assigned Machine: UBE 850T-1");

  const [isLoading, setIsLoading] = useState(false);

  const handleIoTStart = async () => {
    setIsLoading(true);
    setStatus("Starting IoT data stream...");
    try {
      const res = await SettingsService.updateIoTStreamStatus("start");
      setStatus(res.message || "IoT Data Fetching Started.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to start IoT stream.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIoTStop = async () => {
    setIsLoading(true);
    setStatus("Stopping IoT data stream...");
    try {
      const res = await SettingsService.updateIoTStreamStatus("stop");
      setStatus(res.message || "IoT Data Fetching Stopped.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to stop IoT stream.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrain = async () => {
    setIsLoading(true);
    setStatus("Triggering model training pipeline...");
    try {
      const res = await SettingsService.trainModel();
      setStatus(res.status || "Model training completed successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to trigger model training.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalibration = async () => {
    setIsLoading(true);
    setStatus("Triggering machine calibration workflow...");
    try {
      await SettingsService.runCalibrationWorkflow();
      setStatus("Calibration Workflow Triggered Successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Failed to trigger calibration workflow.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-4 sm:space-y-5">
      {/* HEADER & TABS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-cyan-400 tracking-tight leading-none uppercase">
            INDUSTRY SETTINGS & CONTROL
          </h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm font-medium">
            Enterprise configuration for master data, IoT streams & AI pipelines
          </p>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex bg-[#151C2C] border border-[#252D3D] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("masters")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "masters"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Master Data
          </button>
          <button
            onClick={() => setActiveTab("iot")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "iot"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            IoT Control
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            AI Pipelines
          </button>
        </div>
      </div>

      {/* STATUS BANNER */}
      {status && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-cyan-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{status}</span>
          </div>
          <button
            onClick={() => setStatus("")}
            className="text-cyan-400/60 hover:text-cyan-400 text-xs font-bold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: MASTER DATA SETUP */}
      {activeTab === "masters" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CUSTOMER MANAGEMENT */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#252D3D]">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                    Customer Management
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Create and manage industrial customer accounts
                  </p>
                </div>
                <span className="text-2xl shrink-0">🏭</span>
              </div>

              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="Enter Customer Name"
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-colors font-medium"
                  />
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 transition-colors text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
              CREATE CUSTOMER
            </button>
          </div>

          {/* PART MASTER */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-green-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#252D3D]">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                    Part Master
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Add industrial parts under customer profiles
                  </p>
                </div>
                <span className="text-2xl shrink-0">🧩</span>
              </div>

              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Part Name
                  </label>
                  <input
                    type="text"
                    value={part}
                    onChange={(e) => setPart(e.target.value)}
                    placeholder="Enter Part Name"
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Select Customer
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer font-medium"
                  >
                    <option value="Tata">Tata</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Suzuki">Suzuki</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-green-500 hover:bg-green-400 transition-colors text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
              CREATE PART
            </button>
          </div>

          {/* MACHINE MASTER */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-yellow-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#252D3D]">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                    Machine Master
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Configure machines & IoT connectivity
                  </p>
                </div>
                <span className="text-2xl shrink-0">⚙️</span>
              </div>

              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Machine ID
                  </label>
                  <input
                    type="text"
                    value={machine}
                    onChange={(e) => setMachine(e.target.value)}
                    placeholder="e.g. 850T-1"
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500 transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Casting Process Type
                  </label>
                  <select
                    value={machineType}
                    onChange={(e) => setMachineType(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer font-medium"
                  >
                    <option>HPDC (High Pressure Die Casting)</option>
                    <option>LPDC (Low Pressure Die Casting)</option>
                    <option>Gravity Die Casting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Factory Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Plant #1 Bay 4"
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-yellow-500 transition-colors font-medium"
                  />
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 transition-colors text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
              ADD MACHINE
            </button>
          </div>

          {/* DIE MASTER */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-pink-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#252D3D]">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                    Die Master
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Manage die lifecycle & machine assignment
                  </p>
                </div>
                <span className="text-2xl shrink-0">🏗️</span>
              </div>

              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Die ID
                  </label>
                  <input
                    type="text"
                    value={die}
                    onChange={(e) => setDie(e.target.value)}
                    placeholder="e.g. S-16"
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-600 outline-none focus:border-pink-500 transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Target Part Specification
                  </label>
                  <select
                    value={partType}
                    onChange={(e) => setPartType(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer font-medium"
                  >
                    <option>Gear Housing</option>
                    <option>Engine Block</option>
                    <option>Crankcase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                    Assigned Machine
                  </label>
                  <select
                    value={assignedMachine}
                    onChange={(e) => setAssignedMachine(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer font-medium"
                  >
                    <option>Assigned Machine: UBE 850T-1</option>
                    <option>Assigned Machine: UBE 850T-2</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 bg-pink-500 hover:bg-pink-400 transition-colors text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer">
              CREATE DIE
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: IoT CONTROL */}
      {activeTab === "iot" && (
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-[#252D3D]">
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                IoT Data Stream Control
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Monitor and control live telemetry sensor feeds
              </p>
            </div>
            <span className="text-2xl shrink-0">📡</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0F172A] border border-[#252D3D] rounded-xl p-3.5">
              <span className="text-gray-400 text-[10px] uppercase tracking-widest font-extrabold">Connected Machines</span>
              <span className="block text-2xl font-black text-cyan-400 mt-1 font-mono">12</span>
            </div>

            <div className="bg-[#0F172A] border border-[#252D3D] rounded-xl p-3.5">
              <span className="text-gray-400 text-[10px] uppercase tracking-widest font-extrabold">Active Streams</span>
              <span className="block text-2xl font-black text-green-400 mt-1 font-mono">8</span>
            </div>

            <div className="bg-[#0F172A] border border-[#252D3D] rounded-xl p-3.5">
              <span className="text-gray-400 text-[10px] uppercase tracking-widest font-extrabold">Last Telemetry Sync</span>
              <span className="block text-base font-bold text-yellow-400 mt-2 font-mono">2 mins ago</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleIoTStart}
              disabled={isLoading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-colors text-black font-extrabold px-5 py-3 rounded-lg text-xs uppercase tracking-wider cursor-pointer text-center"
            >
              {isLoading ? "WORKING..." : "START FETCHING IoT"}
            </button>
            <button
              onClick={handleIoTStop}
              disabled={isLoading}
              className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 transition-colors font-extrabold px-5 py-3 rounded-lg text-xs uppercase tracking-wider cursor-pointer text-center"
            >
              {isLoading ? "WORKING..." : "STOP IoT"}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AI PIPELINES & CALIBRATION */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MODEL TRAINING */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#252D3D]">
                <div>
                  <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                    AI Model Training
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Train defect prediction models using historical industrial datasets
                  </p>
                </div>
                <span className="text-2xl shrink-0">🧠</span>
              </div>
              <div className="bg-[#0F172A] border border-[#252D3D] rounded-lg p-3 my-3 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold block">Current Engine</span>
                <span className="text-xs text-cyan-400 font-mono font-bold block">XGBoost Quality Classifier v2.1</span>
              </div>
            </div>
            <button
              onClick={handleTrain}
              disabled={isLoading}
              className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 transition-colors text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? "TRAINING..." : "TRAIN MODEL"}
            </button>
          </div>

          {/* CALIBRATION WORKFLOW */}
          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-green-500/30 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-3 pb-2 border-b border-[#252D3D]">
                <div>
                  <h2 className="text-base font-extrabold text-white uppercase tracking-wider">
                    Machine Calibration Workflow
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Trigger AI-assisted tolerance optimization pipeline
                  </p>
                </div>
                <span className="text-2xl shrink-0">⚖️</span>
              </div>
              <div className="bg-[#0F172A] border border-[#252D3D] rounded-lg p-3 my-3 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold block">Target Optimization</span>
                <span className="text-xs text-green-400 font-mono font-bold block">Dynamic Tolerance Alignment (UBE 850T)</span>
              </div>
            </div>
            <button
              onClick={handleCalibration}
              disabled={isLoading}
              className="w-full mt-4 bg-green-500 hover:bg-green-400 disabled:opacity-50 transition-colors text-black font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? "RUNNING..." : "RUN CALIBRATION"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
