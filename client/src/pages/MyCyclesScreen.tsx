import { useState } from "react";
import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const cycleHistory = [
  { start: "Feb 2", end: "Feb 6", length: 28, period: 5, color: "#FF657D" },
  { start: "Jan 5", end: "Jan 9", length: 27, period: 5, color: "#A78BFA" },
  { start: "Dec 9", end: "Dec 14", length: 29, period: 6, color: "#60A5FA" },
  { start: "Nov 10", end: "Nov 15", length: 28, period: 5, color: "#34D399" },
  { start: "Oct 13", end: "Oct 18", length: 28, period: 5, color: "#F59E0B" },
];

const filters = ["All", "Monthly Cycle", "Fertile Window", "Fertile"];

export const MyCyclesScreen = () => {
  const { navigate, cycleData } = useApp();
  const [activeFilter, setActiveFilter] = useState("All");

  const avgCycle = Math.round(cycleHistory.reduce((s, c) => s + c.length, 0) / cycleHistory.length);
  const avgPeriod = Math.round(cycleHistory.reduce((s, c) => s + c.period, 0) / cycleHistory.length);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto pb-2">
          {/* Header */}
          <div className="px-5 pt-2 pb-2 flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>My Cycles</h1>
              <p className="text-sm text-gray-400">Your cycle history</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("edit-period")}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.4 4 3 4.4 3 5V20C3 20.6 3.4 21 4 21H19C19.6 21 20 20.6 20 20V13" stroke="#FF657D" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z" stroke="#FF657D" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Summary cards */}
          <div className="px-5 mb-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Avg Cycle", value: `${avgCycle}`, unit: "days", color: "#FF657D", bg: "#FFF0F3", icon: "🔄" },
                { label: "Avg Period", value: `${avgPeriod}`, unit: "days", color: "#A78BFA", bg: "#F5F0FF", icon: "📍" },
                { label: "Next in", value: `${cycleData.daysUntilNextPeriod}`, unit: "days", color: "#60A5FA", bg: "#EFF6FF", icon: "📅" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-3 shadow-sm text-center"
                  style={{ background: s.bg }}
                >
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-[22px] font-bold" style={{ color: s.color }}>
                    {s.value}<span className="text-[10px] font-normal ml-0.5">{s.unit}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current cycle info */}
          <div className="mx-5 mb-4 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5" style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white text-xs opacity-80">Current cycle</p>
                  <p className="text-white text-[17px] font-bold">Mar 1 – Mar {1 + cycleData.periodLength - 1}</p>
                </div>
                <div className="bg-white/20 rounded-2xl px-3 py-1.5">
                  <span className="text-white text-sm font-bold">Day {cycleData.currentDay}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="w-full h-2 rounded-full bg-white/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${(cycleData.currentDay / cycleData.cycleLength) * 100}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Phase segments */}
              <div className="flex gap-1 mt-2">
                {[
                  { label: "Period", days: 5, color: "#FF8FA3" },
                  { label: "Follicular", days: 8, color: "rgba(255,255,255,0.5)" },
                  { label: "Ovulation", days: 1, color: "#E9D5FF" },
                  { label: "Luteal", days: 14, color: "rgba(255,255,255,0.3)" },
                ].map(p => (
                  <div key={p.label} className="flex flex-col items-center" style={{ flex: p.days }}>
                    <div className="w-full h-1 rounded-full" style={{ background: p.color }} />
                    <span className="text-[8px] text-white/70 mt-1 hidden">{p.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/70">Mar 1</span>
                <span className="text-[10px] text-white/70">Mar 29</span>
              </div>
            </div>

            <div className="bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F3] flex items-center justify-center">
                    <span className="text-sm">🌸</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Pregnancy chance</p>
                    <p className="text-sm font-bold text-gray-800">Low • {cycleData.phase} Phase</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("calendar")}
                  className="text-[#FF657D] text-xs font-semibold"
                >
                  Edit cycle
                </motion.button>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-5 mb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {filters.map(f => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(f)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all border"
                  style={{
                    background: activeFilter === f ? "#FF657D" : "white",
                    color: activeFilter === f ? "white" : "#6B7280",
                    borderColor: activeFilter === f ? "#FF657D" : "#E5E7EB",
                  }}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Past records */}
          <div className="px-5 mb-4">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">Past Records</h2>
            <div className="space-y-3">
              {cycleHistory.map((cycle, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${cycle.color}22` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: cycle.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-gray-900">{cycle.start} – {cycle.end}</p>
                    <p className="text-[11px] text-gray-400">Period: {cycle.period} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold" style={{ color: cycle.color }}>{cycle.length}d</p>
                    <p className="text-[10px] text-gray-400">cycle</p>
                  </div>
                  {/* Progress segments */}
                  <div className="flex gap-0.5 w-16">
                    {Array.from({ length: 10 }, (_, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-sm"
                        style={{
                          height: 20,
                          background: j < Math.round(cycle.period / cycle.length * 10) ? cycle.color : `${cycle.color}22`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
