import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const CycleCircle = ({ day, phase, daysUntil }: { day: number; phase: string; daysUntil: number }) => {
  const totalDays = 28;
  const progress = day / totalDays;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const phaseColors: Record<string, string> = {
    "Menstrual": "#FF657D",
    "Follicular": "#FF9F7F",
    "Ovulation": "#A78BFA",
    "Luteal": "#60A5FA",
  };
  const color = phaseColors[phase] || "#FF657D";

  return (
    <div className="relative flex items-center justify-center w-[220px] h-[220px]">
      <svg width="220" height="220" className="absolute">
        <circle cx="110" cy="110" r="90" fill="none" stroke="#FFE7EA" strokeWidth="12" />
        <motion.circle
          cx="110" cy="110" r="90"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Cycle Day</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-[52px] font-bold leading-none"
          style={{ color, fontFamily: "Instrument Sans, sans-serif" }}
        >
          {day}
        </motion.div>
        <div className="text-[12px] text-gray-500 mt-1">{phase} Phase</div>
        <div className="text-[11px] mt-1" style={{ color }}>
          {daysUntil === 0 ? "Period today!" : `${daysUntil}d until period`}
        </div>
      </div>
    </div>
  );
};

export const HomeScreen = () => {
  const { cycleData, user, navigate, logs } = useApp();
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  const quickStats = [
    { label: "Cycle Length", value: "28", unit: "days", icon: "🔄", color: "#FF657D", bg: "#FFF0F3" },
    { label: "Period Length", value: "5", unit: "days", icon: "📍", color: "#A78BFA", bg: "#F5F0FF" },
    { label: "Next Period", value: String(cycleData.daysUntilNextPeriod), unit: "days", icon: "📅", color: "#60A5FA", bg: "#EFF6FF" },
    { label: "Water Today", value: "1.5", unit: "L", icon: "💧", color: "#34D399", bg: "#ECFDF5" },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto scrollbar-none pb-4">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <div>
              <p className="text-gray-400 text-sm">Good morning,</p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[22px] font-bold text-gray-900"
                style={{ fontFamily: "Instrument Sans, sans-serif" }}
              >
                {user.name} 👋
              </motion.h1>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
                onClick={() => navigate("tracker")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#FF657D" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#FF657D" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("personal-data")}
                className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-sm"
              >
                <span className="text-white font-bold text-sm">{user.name[0]}</span>
              </motion.button>
            </div>
          </div>

          {/* Week view */}
          <div className="px-5 mb-5">
            <div className="flex justify-between">
              {weekDays.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                const isPeriod = i < 5;
                return (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("calendar")}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-gray-400 font-medium">{days[d.getDay()]}</span>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                      ${isToday ? "bg-[#FF657D] text-white shadow-md" : isPeriod ? "bg-[#FFE7EA] text-[#FF657D]" : "text-gray-500"}`}
                    >
                      {d.getDate()}
                    </div>
                    {isPeriod && <div className="w-1.5 h-1.5 rounded-full bg-[#FF657D]" style={{ opacity: isToday ? 1 : 0.5 }} />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Cycle Circle */}
          <div className="flex justify-center mb-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[28px] p-6 shadow-sm flex flex-col items-center mx-5 w-full"
              onClick={() => navigate("phase-period")}
            >
              <CycleCircle
                day={cycleData.currentDay}
                phase={cycleData.phase}
                daysUntil={cycleData.daysUntilNextPeriod}
              />
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <div className="text-[12px] text-gray-400">Fertile Window</div>
                  <div className="text-[14px] font-semibold text-[#A78BFA]">Mar 12-16</div>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <div className="text-[12px] text-gray-400">Ovulation</div>
                  <div className="text-[14px] font-semibold text-[#60A5FA]">Mar 14</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick stats */}
          <div className="px-5 mb-5">
            <h2 className="text-[16px] font-bold text-gray-800 mb-3">Today's Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("log-entry")}
                  className="rounded-2xl p-4 shadow-sm"
                  style={{ background: stat.bg }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-[22px] font-bold" style={{ color: stat.color }}>
                    {stat.value}<span className="text-sm font-medium ml-1">{stat.unit}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Phase insight card */}
          <div className="px-5 mb-5">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("phase-period")}
              className="rounded-2xl p-5 text-white relative overflow-hidden shadow-md"
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -translate-y-6 translate-x-6" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🩸</span>
                  <span className="text-sm font-semibold opacity-90">Phase Insight</span>
                </div>
                <h3 className="text-[18px] font-bold mb-1">{cycleData.phase} Phase</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {cycleData.phase === "Menstrual" ? "Rest and prioritize self-care. Your body is working hard." :
                   cycleData.phase === "Follicular" ? "Energy levels rising. Great time for new projects!" :
                   cycleData.phase === "Ovulation" ? "Peak energy! You're at your most creative and social." :
                   "Focus on gentle exercise and calming activities."}
                </p>
                <div className="flex items-center gap-1 mt-3 text-sm font-medium">
                  <span>Learn more</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent logs */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-gray-800">Recent Logs</h2>
              <button onClick={() => navigate("log-entry")} className="text-[#FF657D] text-sm font-medium">Add Log</button>
            </div>
            <div className="space-y-2">
              {logs.slice(-3).reverse().map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    <div className="flex gap-2 mt-1">
                      {log.flow && <span className="text-xs text-gray-400">Flow: {log.flow}</span>}
                      {log.mood && <span className="text-xs">{log.mood}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {log.water && <p className="text-xs text-[#34D399] font-medium">{log.water}ml</p>}
                    {log.weight && <p className="text-xs text-[#60A5FA] font-medium">{log.weight}kg</p>}
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
