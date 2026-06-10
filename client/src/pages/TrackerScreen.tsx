import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

export const TrackerScreen = () => {
  const { navigate, cycleData, logs } = useApp();

  const articles = [
    { title: "Understanding Your Menstrual Cycle", category: "Education", icon: "📚", color: "#FF657D", bg: "#FFF0F3", read: "3 min" },
    { title: "Foods That Help During Your Period", category: "Nutrition", icon: "🥗", color: "#34D399", bg: "#ECFDF5", read: "5 min" },
    { title: "Exercise Tips for Each Cycle Phase", category: "Fitness", icon: "🏃‍♀️", color: "#A78BFA", bg: "#F5F0FF", read: "4 min" },
    { title: "Managing PMS Symptoms Naturally", category: "Wellness", icon: "🌿", color: "#F59E0B", bg: "#FFFBEB", read: "6 min" },
  ];

  const phaseCards = [
    { phase: "Menstrual", screen: "phase-period" as const, color: "#dc143c", bg: "#FFF5F5", icon: "🩸", days: `Day 1–${cycleData.periodLength}`, desc: "Rest & recover" },
    { phase: "Follicular", screen: "phase-growth" as const, color: "#60A5FA", bg: "#EFF6FF", icon: "🌱", days: "Day 6-13", desc: "Energy rising" },
    { phase: "Ovulation", screen: "phase-release" as const, color: "#A78BFA", bg: "#F5F0FF", icon: "⭐", days: "Day 14", desc: "Peak fertility" },
    { phase: "Luteal", screen: "phase-progesterone" as const, color: "#F59E0B", bg: "#FFFBEB", icon: "🌙", days: "Day 15-28", desc: "Wind down" },
  ];

  const pLen = cycleData.periodLength;
  const cLen = cycleData.cycleLength;
  const ovDay = Math.round(cLen / 2);
  const currentPhaseIndex = phaseCards.findIndex(p =>
    (cycleData.currentDay <= pLen && p.phase === "Menstrual") ||
    (cycleData.currentDay > pLen && cycleData.currentDay < ovDay - 1 && p.phase === "Follicular") ||
    (cycleData.currentDay >= ovDay - 1 && cycleData.currentDay <= ovDay + 1 && p.phase === "Ovulation") ||
    (cycleData.currentDay > ovDay + 1 && p.phase === "Luteal")
  );

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto pb-2">
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Tracker</h1>
              <p className="text-sm text-gray-400">Cycle day {cycleData.currentDay} of {cycleData.cycleLength}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>

          {/* Cycle phases */}
          <div className="px-5 mb-5">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">Cycle Phases</h2>
            <div className="grid grid-cols-2 gap-3">
              {phaseCards.map((card, i) => (
                <motion.button
                  key={card.phase}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(card.screen)}
                  className="rounded-2xl p-4 text-left relative overflow-hidden shadow-sm"
                  style={{ background: card.bg, border: i === currentPhaseIndex ? `2px solid ${card.color}` : "2px solid transparent" }}
                >
                  {i === currentPhaseIndex && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: card.color }}>
                      NOW
                    </div>
                  )}
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <div className="text-[13px] font-bold text-gray-900 mb-0.5">{card.phase}</div>
                  <div className="text-[11px] text-gray-400 mb-1">{card.days}</div>
                  <div className="text-[11px] font-medium" style={{ color: card.color }}>{card.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Period duration */}
          <div className="mx-5 bg-white rounded-3xl p-5 shadow-sm mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Period Duration</h3>
              <span className="text-sm font-semibold" style={{ color: "#dc143c" }}>{cycleData.periodLength} days avg</span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: cycleData.cycleLength }, (_, i) => {
                const day = i + 1;
                const ovulationDay = Math.round(cycleData.cycleLength / 2);
                const isPeriod = day <= cycleData.periodLength;
                const isFertile = day >= ovulationDay - 2 && day <= ovulationDay + 2;
                const isOvulation = day === ovulationDay;
                const isCurrent = day === cycleData.currentDay;
                return (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.02, type: "spring" }}
                    className="flex-1 rounded-sm"
                    style={{
                      height: 32,
                      background: isCurrent ? "#dc143c" : isOvulation ? "#A78BFA" : isFertile ? "#A78BFA44" : isPeriod ? "#dc143c77" : "#F3F4F6",
                      transformOrigin: "bottom",
                      border: isCurrent ? "2px solid #dc143c" : "none",
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
              <span>Day 1</span><span>Day 14</span><span>Day 28</span>
            </div>
          </div>

          {/* Quick log section */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">Quick Log</h2>
              <button onClick={() => navigate("log-entry")} className="text-[#FF657D] text-sm font-medium">View all</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: "🩸", label: "Flow", screen: "log-entry" as const },
                { icon: "😊", label: "Mood", screen: "log-mood" as const },
                { icon: "⚖️", label: "Weight", screen: "log-weight" as const },
                { icon: "💧", label: "Water", screen: "log-water" as const },
              ].map(item => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(item.screen)}
                  className="bg-white rounded-2xl py-4 flex flex-col items-center gap-2 shadow-sm"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div className="px-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">Health Articles</h2>
              <button className="text-[#FF657D] text-sm font-medium">See all</button>
            </div>
            <div className="space-y-3">
              {articles.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: a.bg }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 leading-tight mb-1 truncate">{a.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: a.bg, color: a.color }}>{a.category}</span>
                      <span className="text-[10px] text-gray-400">{a.read} read</span>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6L15 12L9 18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
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
