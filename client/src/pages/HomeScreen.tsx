import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const CycleCircle = ({ day, phase, daysUntil }: { day: number; phase: string; daysUntil: number }) => {
  const totalDays = 28;
  const progress = day / totalDays;
  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference * (1 - progress);

  const phaseColors: Record<string, string> = {
    "Menstrual": "#FF657D",
    "Follicular": "#FB923C",
    "Ovulation": "#8B5CF6",
    "Luteal": "#60A5FA",
  };
  const phaseEmojis: Record<string, string> = {
    "Menstrual": "🩸",
    "Follicular": "🌱",
    "Ovulation": "🌟",
    "Luteal": "🌙",
  };
  const color = phaseColors[phase] || "#FF657D";

  return (
    <div className="relative flex items-center justify-center w-[216px] h-[216px]">
      <svg width="216" height="216" className="absolute">
        <circle cx="108" cy="108" r="88" fill="none" stroke="#F3F0FF" strokeWidth="11" />
        <motion.circle
          cx="108" cy="108" r="88"
          fill="none" stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          transform="rotate(-90 108 108)"
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-0.5">Day</div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-[54px] font-bold leading-none"
          style={{ color, fontFamily: "Instrument Sans, sans-serif" }}
        >
          {day}
        </motion.div>
        <div className="text-[12px] text-gray-500 mt-1 font-medium">
          {phaseEmojis[phase]} {phase} Phase
        </div>
        <div className="text-[11px] mt-1.5 font-semibold" style={{ color }}>
          {daysUntil === 0 ? "Period today!" : `${daysUntil}d until next period`}
        </div>
      </div>
    </div>
  );
};

const MoodButton = ({ emoji, label, color, onClick }: { emoji: string; label: string; color: string; onClick: () => void }) => (
  <motion.button
    whileTap={{ scale: 0.85 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1"
  >
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100"
      style={{ background: color + "20" }}
    >
      {emoji}
    </motion.div>
    <span className="text-[10px] text-gray-500 font-medium">{label}</span>
  </motion.button>
);

export const HomeScreen = () => {
  const { cycleData, user, navigate, logs } = useApp();
  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickStats = [
    { label: "Cycle Length", value: "28", unit: "days", icon: "🔄", color: "#FF657D", bg: "#FFF0F3" },
    { label: "Period Length", value: "5", unit: "days", icon: "📍", color: "#8B5CF6", bg: "#F5F0FF" },
    { label: "Next Period", value: String(cycleData.daysUntilNextPeriod), unit: "days", icon: "📅", color: "#60A5FA", bg: "#EFF6FF" },
    { label: "Water Today", value: "1.5", unit: "L", icon: "💧", color: "#34D399", bg: "#ECFDF5" },
  ];

  const moods = [
    { emoji: "😊", label: "Happy", color: "#F59E0B" },
    { emoji: "😌", label: "Calm", color: "#34D399" },
    { emoji: "😔", label: "Sad", color: "#60A5FA" },
    { emoji: "😤", label: "Irritated", color: "#EF4444" },
    { emoji: "😰", label: "Anxious", color: "#8B5CF6" },
    { emoji: "⚡", label: "Energetic", color: "#EC4899" },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F5FF 0%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto scrollbar-none pb-4">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-4">
            <div>
              <p className="text-gray-400 text-[12px] font-medium">{greeting},</p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[22px] font-bold text-gray-900"
                style={{ fontFamily: "Instrument Sans, sans-serif" }}
              >
                {user.name} 👋
              </motion.h1>
            </div>
            <div className="flex items-center gap-2">
              {/* AI Coach shortcut */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("ai-coach")}
                className="h-9 px-3 rounded-full flex items-center gap-1.5 shadow-sm"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
                data-testid="button-ai-coach-shortcut"
              >
                <span className="text-sm">✨</span>
                <span className="text-white text-[11px] font-bold">Ask AI</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("personal-data")}
                className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center shadow-sm"
                data-testid="button-profile-avatar"
              >
                <span className="text-white font-bold text-sm">{user.name[0]}</span>
              </motion.button>
            </div>
          </div>

          {/* Week strip */}
          <div className="px-5 mb-5">
            <div className="flex justify-between bg-white rounded-2xl px-3 py-3 shadow-sm">
              {weekDays.map((d, i) => {
                const isToday = d.toDateString() === today.toDateString();
                const isPeriod = i < 5;
                return (
                  <motion.div
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate("calendar")}
                    className="flex flex-col items-center gap-1"
                    data-testid={`day-${days[d.getDay()]}`}
                  >
                    <span className="text-[10px] text-gray-400 font-medium">{days[d.getDay()]}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold transition-all
                      ${isToday
                        ? "text-white shadow-md"
                        : isPeriod ? "text-[#FF657D] bg-[#FFF0F3]" : "text-gray-500"}`}
                      style={isToday ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)" } : {}}
                    >
                      {d.getDate()}
                    </div>
                    {isPeriod && <div className="w-1 h-1 rounded-full bg-[#FF657D]" style={{ opacity: isToday ? 1 : 0.4 }} />}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Cycle Circle */}
          <div className="px-5 mb-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl py-6 px-5 shadow-sm flex flex-col items-center"
              style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.08)" }}
            >
              <CycleCircle
                day={cycleData.currentDay}
                phase={cycleData.phase}
                daysUntil={cycleData.daysUntilNextPeriod}
              />
              {/* Fertile + ovulation */}
              <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100 w-full justify-center">
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 font-medium">Fertile Window</div>
                  <div className="text-[14px] font-bold text-[#8B5CF6]">Mar 12–16</div>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 font-medium">Ovulation</div>
                  <div className="text-[14px] font-bold text-[#60A5FA]">Mar 14</div>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="text-center">
                  <div className="text-[11px] text-gray-400 font-medium">Wellness</div>
                  <div className="text-[14px] font-bold text-[#34D399]">78/100</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Mood Log */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">How are you feeling?</h2>
              <button onClick={() => navigate("log-mood")} className="text-[11px] text-[#8B5CF6] font-semibold">More →</button>
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex justify-between">
              {moods.map(m => (
                <MoodButton key={m.label} {...m} onClick={() => navigate("log-mood")} />
              ))}
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="px-5 mb-5">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("ai-coach")}
              className="rounded-3xl p-5 text-white relative overflow-hidden shadow-lg"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #C026D3 50%, #EC4899 100%)" }}
            >
              <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white opacity-[0.07] -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-[0.05] translate-y-8 -translate-x-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-xl"
                  >
                    ✨
                  </motion.span>
                  <span className="text-[12px] font-semibold opacity-90 uppercase tracking-wide">FlowAI Coach</span>
                </div>
                <h3 className="text-[17px] font-bold mb-1.5 leading-snug">
                  {cycleData.phase === "Menstrual"
                    ? "Rest & replenish iron today 🩸"
                    : cycleData.phase === "Follicular"
                    ? "Energy rising — start new projects! 🌱"
                    : cycleData.phase === "Ovulation"
                    ? "Peak energy & creativity today! 🌟"
                    : "Go gentle — your progesterone is high 🌙"}
                </h3>
                <p className="text-[12px] opacity-75 leading-relaxed">
                  {cycleData.phase === "Menstrual"
                    ? "Eat spinach, lentils & dark chocolate. Avoid caffeine. Your body is working hard."
                    : cycleData.phase === "Follicular"
                    ? "Estrogen is rising. Great time to exercise harder, socialize, and tackle goals."
                    : cycleData.phase === "Ovulation"
                    ? "You're at peak fertility and creativity. Great day for important decisions!"
                    : "Your body craves comfort. Prioritize sleep, warm foods, and gentle movement."}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-[12px] font-semibold">
                    <span>Ask FlowAI</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-[10px] opacity-60">Powered by AI</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick stats grid */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">Today's Overview</h2>
              <button onClick={() => navigate("insights")} className="text-[11px] text-[#8B5CF6] font-semibold">Insights →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("log-entry")}
                  className="rounded-2xl p-4 shadow-sm"
                  style={{ background: stat.bg }}
                  data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}
                >
                  <div className="text-xl mb-2">{stat.icon}</div>
                  <div className="text-[22px] font-bold" style={{ color: stat.color }}>
                    {stat.value}<span className="text-xs font-medium ml-1 opacity-70">{stat.unit}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Phase insight card */}
          <div className="px-5 mb-5">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("phase-period")}
              className="rounded-2xl p-4 flex gap-4 items-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #FFF0F3 0%, #FFE7EA 100%)" }}
            >
              <div className="text-3xl flex-shrink-0">🩸</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[#FF657D] font-semibold uppercase tracking-wide mb-0.5">Phase Insight</div>
                <h3 className="text-[14px] font-bold text-gray-800">{cycleData.phase} Phase</h3>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                  {cycleData.phase === "Menstrual" ? "Rest and prioritize self-care." :
                   cycleData.phase === "Follicular" ? "Energy levels rising! Start new projects." :
                   cycleData.phase === "Ovulation" ? "Peak energy and creativity today!" :
                   "Focus on gentle exercise and calm."}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M9 18L15 12L9 6" stroke="#FF657D" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.div>
          </div>

          {/* Feature shortcuts row */}
          <div className="px-5 mb-5">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">Quick Access</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {[
                { icon: "🩺", label: "PCOS Check", color: "#8B5CF6", bg: "#F5F0FF", screen: "pcos" as const },
                { icon: "🥚", label: "Fertility", color: "#60A5FA", bg: "#EFF6FF", screen: "premium" as const },
                { icon: "📊", label: "My Cycles", color: "#EC4899", bg: "#FDF2F8", screen: "cycles" as const },
                { icon: "🌡️", label: "Temperature", color: "#F59E0B", bg: "#FFFBEB", screen: "log-temperature" as const },
                { icon: "⚖️", label: "Weight", color: "#34D399", bg: "#ECFDF5", screen: "log-weight" as const },
              ].map(item => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => navigate(item.screen)}
                  className="flex flex-col items-center gap-2 flex-shrink-0"
                  data-testid={`shortcut-${item.label.toLowerCase()}`}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm" style={{ background: item.bg }}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium text-center w-14 leading-tight">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Recent logs */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">Recent Logs</h2>
              <button onClick={() => navigate("log-entry")} className="text-[11px] text-[#FF657D] font-semibold">+ Add Log</button>
            </div>
            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-gray-500 text-sm">No logs yet. Start tracking today!</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("log-entry")}
                  className="mt-3 px-5 py-2 rounded-full text-white text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
                >
                  Log Now
                </motion.button>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.slice(-3).reverse().map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
                    data-testid={`log-entry-${i}`}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-gray-800">
                        {new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        {log.flow && <span className="text-[11px] text-gray-400">Flow: {log.flow}</span>}
                        {log.mood && <span className="text-[12px]">{log.mood}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {log.water && <p className="text-[11px] text-[#34D399] font-semibold">{log.water}ml 💧</p>}
                      {log.weight && <p className="text-[11px] text-[#60A5FA] font-semibold">{log.weight}kg ⚖️</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
