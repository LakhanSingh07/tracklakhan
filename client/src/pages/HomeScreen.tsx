import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { NotificationBell } from "@/pages/NotificationCenterScreen";
import { computeCyclePrediction } from "@/lib/cyclePrediction";

const PHASE_MAP: Record<number, string> = {};
for (let d = 1; d <= 5; d++) PHASE_MAP[d] = "menstruation";
for (let d = 6; d <= 9; d++) PHASE_MAP[d] = "lowFertility";
for (let d = 10; d <= 13; d++) PHASE_MAP[d] = "highFertility";
PHASE_MAP[14] = "ovulation";
for (let d = 15; d <= 17; d++) PHASE_MAP[d] = "highFertility";
for (let d = 18; d <= 22; d++) PHASE_MAP[d] = "safe";
for (let d = 23; d <= 28; d++) PHASE_MAP[d] = "verySafe";

const PHASE_STYLE: Record<string, { bg: string; glow: string; text: string; label: string }> = {
  menstruation: { bg: "#FF6B8A", glow: "rgba(255,107,138,0.22)", text: "#be185d", label: "Period" },
  lowFertility:  { bg: "#FBBF24", glow: "rgba(251,191,36,0.18)",   text: "#92400e", label: "Low Fertility" },
  highFertility: { bg: "#F472B6", glow: "rgba(244,114,182,0.2)",   text: "#9d174d", label: "Fertile" },
  ovulation:     { bg: "#8B5CF6", glow: "rgba(139,92,246,0.25)",   text: "#5b21b6", label: "Ovulation" },
  safe:          { bg: "#34D399", glow: "rgba(52,211,153,0.18)",   text: "#065f46", label: "Safe" },
  verySafe:      { bg: "#60A5FA", glow: "rgba(96,165,250,0.18)",   text: "#1e40af", label: "Very Safe" },
};

function polarXY(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segPath(cx: number, cy: number, ro: number, ri: number, s: number, e: number) {
  const os = polarXY(cx, cy, ro, s), oe = polarXY(cx, cy, ro, e);
  const is = polarXY(cx, cy, ri, s), ie = polarXY(cx, cy, ri, e);
  const l = (e - s) > 180 ? 1 : 0;
  return `M${os.x},${os.y} A${ro},${ro} 0 ${l} 1 ${oe.x},${oe.y} L${ie.x},${ie.y} A${ri},${ri} 0 ${l} 0 ${is.x},${is.y} Z`;
}

const DropIcon = ({ x, y, color, delay, size = 7 }: { x: number; y: number; color: string; delay: number; size?: number }) => (
  <motion.g
    initial={{ opacity: 0, y: y - 6 }}
    animate={{ opacity: [0, 1, 1, 0.7], y: [y - 6, y, y + 1, y] }}
    transition={{ duration: 0.8, delay, ease: "easeOut", times: [0, 0.4, 0.7, 1] }}
  >
    <motion.path
      d={`M${x},${y - size} C${x - size},${y - size * 0.3} ${x - size},${y + size * 0.6} ${x},${y + size} C${x + size},${y + size * 0.6} ${x + size},${y - size * 0.3} ${x},${y - size} Z`}
      fill={color}
      fillOpacity={0.9}
      animate={{ scale: [1, 1.08, 1] }}
      style={{ transformOrigin: `${x}px ${y}px` }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.8 }}
    />
    <circle cx={x} cy={y - size * 0.35} r={size * 0.28} fill="white" fillOpacity={0.45} />
  </motion.g>
);

const SmartCycleDial = ({
  currentDay,
  daysUntilNextPeriod,
  periodLength,
  cycleLength,
}: {
  currentDay: number;
  daysUntilNextPeriod: number;
  periodLength: number;
  cycleLength: number;
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      setPulse(((ts - startRef.current) / 1000) % (Math.PI * 2));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const TOTAL = cycleLength || 28;
  const CX = 155, CY = 155;
  const RO = 138, RI = 88, RM = 113;
  const GAP = 2.6;
  const segA = 360 / TOTAL;

  const activeDay = hoveredDay ?? currentDay;
  const activePh = PHASE_MAP[activeDay] || "verySafe";
  const curPh = PHASE_MAP[currentDay] || "verySafe";
  const activeStyle = PHASE_STYLE[activePh];
  const curStyle = PHASE_STYLE[curPh];

  const isOnPeriod = currentDay <= periodLength;
  const nextPeriodDay = isOnPeriod ? 1 : TOTAL - daysUntilNextPeriod + 1;

  const pulseR = 1 + 0.06 * Math.sin(pulse * 2.5);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative" style={{ width: 310, height: 310 }}>
        <svg
          width={310}
          height={310}
          viewBox="0 0 310 310"
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={curStyle.bg} stopOpacity="0.10" />
              <stop offset="100%" stopColor={curStyle.bg} stopOpacity="0" />
            </radialGradient>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={activeStyle.bg} floodOpacity="0.3" />
            </filter>
          </defs>

          <circle cx={CX} cy={CY} r={RO + 5} fill="url(#dialGlow)" />
          <circle cx={CX} cy={CY} r={RO + 5} fill="none" stroke={curStyle.bg} strokeWidth="22" strokeOpacity="0.06" />

          {Array.from({ length: TOTAL }, (_, i) => {
            const day = i + 1;
            const ph = PHASE_MAP[day] || "verySafe";
            const style = PHASE_STYLE[ph];
            const s = i * segA + GAP / 2;
            const e = (i + 1) * segA - GAP / 2;
            const mid = (s + e) / 2;
            const isHov = day === hoveredDay;
            const isCur = day === currentDay;
            const isOvl = day === 14;
            const isPeriodDay = day <= periodLength;
            const isNextPeriodDay = day === nextPeriodDay && !isCur && daysUntilNextPeriod > 0;

            const roActual = isHov ? RO + 8 : RO;
            const path = segPath(CX, CY, roActual, RI, s, e);
            const lp = polarXY(CX, CY, RM, mid);
            const dp = polarXY(CX, CY, RO + 18, mid);

            return (
              <motion.g
                key={day}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.022, duration: 0.38, ease: "easeOut" }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              >
                <path
                  d={path}
                  fill={style.bg}
                  fillOpacity={isHov ? 1 : isCur ? 1 : 0.72}
                  stroke={isCur || isHov ? "white" : "none"}
                  strokeWidth={isCur || isHov ? 1.8 : 0}
                  filter={isCur ? "url(#dropShadow)" : undefined}
                  style={{ cursor: "pointer", transition: "fill-opacity 0.15s, d 0.15s" }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onTouchStart={() => setHoveredDay(day)}
                  onTouchEnd={() => setHoveredDay(null)}
                />

                {isPeriodDay ? (
                  <DropIcon
                    x={lp.x}
                    y={lp.y}
                    color="white"
                    delay={i * 0.055}
                    size={isHov ? 8 : 6.5}
                  />
                ) : isOvl ? (
                  <motion.g style={{ pointerEvents: "none" }}>
                    <circle cx={lp.x} cy={lp.y} r={11 * pulseR} fill={style.bg} fillOpacity={0.22} />
                    <circle cx={lp.x} cy={lp.y} r={7 * pulseR} fill={style.bg} fillOpacity={0.38} />
                    <circle cx={lp.x} cy={lp.y} r={4} fill="white" fillOpacity={0.95} />
                    <circle cx={lp.x} cy={lp.y} r={1.8} fill={style.bg} />
                  </motion.g>
                ) : (
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isHov ? 11 : 9}
                    fontWeight={isCur || isHov ? "700" : "400"}
                    fill="white"
                    fillOpacity={isHov || isCur ? 1 : 0.85}
                    style={{ pointerEvents: "none", fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    {day}
                  </text>
                )}

                {isCur && (
                  <motion.g style={{ pointerEvents: "none" }}>
                    <motion.circle
                      cx={dp.x} cy={dp.y}
                      r={8 * pulseR}
                      fill={style.bg}
                      fillOpacity={0.22}
                    />
                    <circle cx={dp.x} cy={dp.y} r={5} fill={style.bg} stroke="white" strokeWidth={2.2} />
                  </motion.g>
                )}

                {isNextPeriodDay && (
                  <circle
                    cx={dp.x} cy={dp.y}
                    r={4.5}
                    fill="none"
                    stroke="#FF6B8A"
                    strokeWidth={1.8}
                    strokeDasharray="2.8 2"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </motion.g>
            );
          })}

          <circle cx={CX} cy={CY} r={RI - 1} fill="white" />
          <circle cx={CX} cy={CY} r={RI - 1} fill="none" stroke={activeStyle.bg} strokeWidth={1.5} strokeOpacity={0.3} />

          <AnimatePresence mode="wait">
            <motion.g
              key={activeDay}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <text
                x={CX} y={CY - 30}
                textAnchor="middle"
                fill={activeStyle.bg}
                fontSize={8.5}
                fontWeight="700"
                letterSpacing="1.8"
                style={{ fontFamily: "Instrument Sans, sans-serif", textTransform: "uppercase" }}
              >
                {activeStyle.label.toUpperCase()}
              </text>

              <text
                x={CX} y={CY + 6}
                textAnchor="middle"
                fill="#1a1a2e"
                fontSize={46}
                fontWeight="800"
                style={{ fontFamily: "Instrument Sans, sans-serif" }}
              >
                {activeDay}
              </text>

              <text
                x={CX} y={CY + 22}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={9}
                style={{ fontFamily: "Instrument Sans, sans-serif" }}
              >
                of {TOTAL} days
              </text>

              <line x1={CX - 28} y1={CY + 32} x2={CX + 28} y2={CY + 32} stroke="#e2e8f0" strokeWidth={0.8} />

              {isOnPeriod ? (
                <motion.g
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: `${CX}px ${CY + 52}px` }}
                >
                  <text
                    x={CX} y={CY + 50}
                    textAnchor="middle"
                    fill="#FF6B8A"
                    fontSize={11.5}
                    fontWeight="700"
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    Period active
                  </text>
                  <text x={CX} y={CY + 64} textAnchor="middle" fill="#FF6B8A" fontSize={10} style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    {periodLength - currentDay + 1}d remaining
                  </text>
                </motion.g>
              ) : (
                <>
                  <text
                    x={CX} y={CY + 50}
                    textAnchor="middle"
                    fill="#FF6B8A"
                    fontSize={daysUntilNextPeriod >= 10 ? 28 : 32}
                    fontWeight="800"
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    {daysUntilNextPeriod}
                  </text>
                  <text
                    x={CX} y={CY + 66}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={8.5}
                    letterSpacing={0.4}
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    days to period
                  </text>
                </>
              )}
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mt-3 px-2">
        {Object.entries(PHASE_STYLE).map(([key, s]) => {
          const isActive = (PHASE_MAP[activeDay] || "verySafe") === key;
          return (
            <motion.div
              key={key}
              animate={{ scale: isActive ? 1 : 0.95, opacity: isActive ? 1 : 0.55 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold"
              style={{
                background: isActive ? s.glow : "transparent",
                borderColor: isActive ? s.bg : "#e2e8f0",
                color: isActive ? s.text : "#94a3b8",
              }}
            >
              {key === "menstruation" && <span style={{ color: s.bg, fontSize: 9 }}>🩸</span>}
              {key === "ovulation" && <span style={{ fontSize: 9 }}>✨</span>}
              {!["menstruation", "ovulation"].includes(key) && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.bg }} />
              )}
              {s.label}
            </motion.div>
          );
        })}
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

  const streak = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const logDates = new Set(logs.map((l) => l.date));
    let s = 0;
    const check = new Date(d);
    while (true) {
      const ds = check.toISOString().split("T")[0];
      if (logDates.has(ds)) { s++; check.setDate(check.getDate() - 1); }
      else break;
    }
    return s;
  }, [logs]);

  const prediction = useMemo(
    () => computeCyclePrediction(logs, cycleData.cycleLength, cycleData.periodLength, cycleData.lastPeriodStart),
    [logs, cycleData]
  );
  const aiDaysUntil = Math.ceil((prediction.nextPeriodDate.getTime() - today.getTime()) / 86400000);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickStats = [
    { label: "Cycle Length", value: String(Math.round(prediction.averageCycleLength)), unit: "days", icon: "🔄", color: "#FF657D", bg: "#FFF0F3" },
    { label: "Period Length", value: String(Math.round(prediction.averagePeriodLength)), unit: "days", icon: "📍", color: "#8B5CF6", bg: "#F5F0FF" },
    { label: prediction.usingAI ? "AI Next Period" : "Next Period", value: String(Math.max(0, aiDaysUntil)), unit: "days", icon: prediction.usingAI ? "🧠" : "📅", color: "#60A5FA", bg: "#EFF6FF" },
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
              <NotificationBell onPress={() => navigate("notifications")} />
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
              <SmartCycleDial
                currentDay={cycleData.currentDay}
                daysUntilNextPeriod={cycleData.daysUntilNextPeriod}
                periodLength={cycleData.periodLength}
                cycleLength={cycleData.cycleLength}
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

          {/* Streak + Monthly snapshot row */}
          <div className="px-5 mb-5">
            <div className="flex gap-3">
              {/* Streak card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("log-entry")}
                className="flex-1 rounded-2xl p-4 shadow-sm relative overflow-hidden"
                style={{ background: streak >= 7 ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "linear-gradient(135deg, #FFF7ED, #FEF3C7)" }}
                data-testid="streak-card"
              >
                {streak >= 1 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-3 -right-3 text-4xl opacity-20"
                  >🔥</motion.div>
                )}
                <div className="text-2xl mb-1">🔥</div>
                <div className={`text-[28px] font-bold leading-none ${streak >= 7 ? "text-white" : "text-[#F59E0B]"}`}
                  style={{ fontFamily: "Instrument Sans, sans-serif" }}
                >
                  {streak}
                </div>
                <div className={`text-[11px] font-semibold mt-0.5 ${streak >= 7 ? "text-white/80" : "text-[#D97706]"}`}>
                  day streak
                </div>
                {streak === 0 && (
                  <div className="text-[10px] text-gray-400 mt-0.5">Log today to start!</div>
                )}
                {streak >= 3 && streak < 7 && (
                  <div className={`text-[9px] font-medium mt-1 text-[#D97706]`}>
                    {7 - streak}d to 🔥 week
                  </div>
                )}
                {streak >= 7 && (
                  <div className="text-[9px] font-bold text-white/70 mt-1">🏆 On fire!</div>
                )}
              </motion.div>

              {/* Monthly snapshot card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("insights")}
                className="flex-1 rounded-2xl p-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #F5F0FF, #EDE9FE)" }}
                data-testid="monthly-insights-card"
              >
                <div className="text-2xl mb-1">📊</div>
                <div className="text-[28px] font-bold leading-none text-[#8B5CF6]"
                  style={{ fontFamily: "Instrument Sans, sans-serif" }}
                >
                  {logs.length}
                </div>
                <div className="text-[11px] font-semibold text-[#7C3AED] mt-0.5">logs this month</div>
                <div className="text-[9px] text-[#A78BFA] mt-1">
                  {logs.length >= 10 ? "Great consistency!" : "Keep tracking!"}
                </div>
              </motion.div>

              {/* Symptoms card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("symptom-tracker")}
                className="flex-1 rounded-2xl p-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #FFF0F3, #FFE7EA)" }}
                data-testid="symptoms-card"
              >
                <div className="text-2xl mb-1">🩺</div>
                <div className="text-[12px] font-bold text-[#FF657D] leading-tight mt-1">Log Symptoms</div>
                <div className="text-[9px] text-[#FF8FA3] mt-1 leading-tight">Track body & mood</div>
              </motion.div>
            </div>
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

          {/* AI Prediction banner (show when AI is active) */}
          {prediction.usingAI && (
            <div className="px-5 mb-5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("prediction")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #F5F0FF 0%, #FDF2F8 100%)", border: "1.5px solid #DDD6FE" }}
                data-testid="button-ai-prediction-banner"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}>
                  <span className="text-white text-lg">🧠</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[13px] font-bold text-gray-900">AI Prediction Active</p>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: "#8B5CF6" }}>
                      {prediction.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    Next period: {prediction.nextPeriodDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {prediction.cycleHistory.length} cycles analyzed
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M9 18L15 12L9 6" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>
          )}

          {/* Feature shortcuts row */}
          <div className="px-5 mb-5">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">Quick Access</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {[
                { icon: "🧠", label: "AI Predict", color: "#8B5CF6", bg: "#F5F0FF", screen: "prediction" as const },
                { icon: "🩺", label: "PCOS Check", color: "#EC4899", bg: "#FDF2F8", screen: "pcos" as const },
                { icon: "🥚", label: "Fertility", color: "#60A5FA", bg: "#EFF6FF", screen: "premium" as const },
                { icon: "📊", label: "My Cycles", color: "#FF657D", bg: "#FFF0F3", screen: "cycles" as const },
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
