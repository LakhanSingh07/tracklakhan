import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { NotificationBell } from "@/pages/NotificationCenterScreen";
import { computeCyclePrediction } from "@/lib/cyclePrediction";
import { useTranslation } from "react-i18next";
import stepIcon from "@assets/icons/step.png";
import waterIcon from "@assets/icons/water.png";
import sleepIcon from "@assets/icons/sleep.png";
import happyIcon from "@assets/icons/happy.png";
import calmIcon from "@assets/icons/calm.png";
import sadIcon from "@assets/icons/sad.png";
import irritatedIcon from "@assets/icons/irritated.png";
import anxiousIcon from "@assets/icons/anxious.png";
import energeticIcon from "@assets/icons/energetic.png";

const MiniRing = ({ pct, color, bg }: { pct: number; color: string; bg: string }) => {
  const r = 11;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-7 h-7">
      <svg viewBox="0 0 28 28" className="w-full h-full -rotate-90">
        <circle cx="14" cy="14" r={r} fill="none" stroke={bg} strokeWidth="3" />
        <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${circ * Math.min(pct, 1)} ${circ * (1 - Math.min(pct, 1))}`}
          strokeLinecap="round" />
      </svg>
    </div>
  );
};

const QuickCardIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="h-7 w-7 object-contain" draggable={false} />
);

const WellnessCards = () => {
  const { navigate, getTodaySteps, stepsGoal, getTodayWaterTotal, waterGoal, getLastSleep, sleepGoal } = useApp();
  const { t } = useTranslation();
  const todaySteps = getTodaySteps();
  const todayWaterMl = getTodayWaterTotal();
  const lastSleep = getLastSleep();

  return (
    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 w-full">
      {/* Steps */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => navigate("wellness-steps")}
        className="flex-1 rounded-2xl p-3 flex flex-col gap-1.5 text-left"
        style={{ background: "linear-gradient(135deg, #FFF7ED, #FEF3C7)" }}
        data-testid="quick-action-steps"
      >
        <div className="flex items-center justify-between">
          <QuickCardIcon src={stepIcon} alt="Steps" />
          <MiniRing pct={todaySteps / stepsGoal} color="#F59E0B" bg="#FDE68A" />
        </div>
        <div className="text-[15px] font-bold text-[#92400e] leading-none">
          {todaySteps >= 1000 ? `${(todaySteps / 1000).toFixed(1)}k` : todaySteps.toLocaleString()}
        </div>
        <div className="text-[9px] text-[#B45309] font-medium">/ {(stepsGoal / 1000).toFixed(0)}k {t("steps_goal")}</div>
      </motion.button>

      {/* Water */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => navigate("wellness-water")}
        className="flex-1 rounded-2xl p-3 flex flex-col gap-1.5 text-left"
        style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)" }}
        data-testid="quick-action-water"
      >
        <div className="flex items-center justify-between">
          <QuickCardIcon src={waterIcon} alt="Water" />
          <MiniRing pct={todayWaterMl / waterGoal} color="#3B82F6" bg="#BFDBFE" />
        </div>
        <div className="text-[15px] font-bold text-[#1e40af] leading-none">
          {todayWaterMl >= 1000 ? `${(todayWaterMl / 1000).toFixed(1)}L` : `${todayWaterMl}ml`}
        </div>
        <div className="text-[9px] text-[#3B82F6] font-medium">/ {waterGoal / 1000}L {t("water_goal")}</div>
      </motion.button>

      {/* Sleep */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => navigate("wellness-sleep")}
        className="flex-1 rounded-2xl p-3 flex flex-col gap-1.5 text-left"
        style={{ background: "linear-gradient(135deg, #F5F0FF, #EDE9FE)" }}
        data-testid="quick-action-sleep"
      >
        <div className="flex items-center justify-between">
          <QuickCardIcon src={sleepIcon} alt="Sleep" />
          <MiniRing pct={lastSleep ? lastSleep.duration / sleepGoal : 0} color="#8B5CF6" bg="#DDD6FE" />
        </div>
        <div className="text-[15px] font-bold text-[#5b21b6] leading-none">
          {lastSleep ? `${lastSleep.duration}h` : "--"}
        </div>
        <div className="text-[9px] text-[#7C3AED] font-medium">/ {sleepGoal}h {t("sleep_goal")}</div>
      </motion.button>
    </div>
  );
};

const PHASE_MAP: Record<number, string> = {};
for (let d = 1; d <= 5; d++) PHASE_MAP[d] = "menstruation";
for (let d = 6; d <= 9; d++) PHASE_MAP[d] = "lowFertility";
for (let d = 10; d <= 13; d++) PHASE_MAP[d] = "highFertility";
PHASE_MAP[14] = "ovulation";
for (let d = 15; d <= 17; d++) PHASE_MAP[d] = "highFertility";
for (let d = 18; d <= 22; d++) PHASE_MAP[d] = "safe";
for (let d = 23; d <= 28; d++) PHASE_MAP[d] = "verySafe";

const PHASE_STYLE: Record<string, { bg: string; glow: string; text: string; label: string }> = {
  menstruation: { bg: "#dc143c", glow: "rgba(220,20,60,0.25)", text: "#fff0f0", label: "Period" },
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
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: [0, 1, 1, 0.7], y: [-6, 0, 1, 0] }}
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
  const { t } = useTranslation();
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

  // Generate dynamic phase map for this user
  const phaseMap: Record<number, string> = {};
  for (let d = 1; d <= periodLength; d++) phaseMap[d] = "menstruation";
  const ovulationDay = Math.round(cycleLength - 14);
  for (let d = periodLength + 1; d < ovulationDay - 4; d++) phaseMap[d] = "lowFertility";
  for (let d = Math.max(1, ovulationDay - 4); d < ovulationDay; d++) phaseMap[d] = "highFertility";
  phaseMap[ovulationDay] = "ovulation";
  for (let d = ovulationDay + 1; d <= Math.min(TOTAL, ovulationDay + 3); d++) phaseMap[d] = "highFertility";
  for (let d = ovulationDay + 4; d <= Math.min(TOTAL, TOTAL - 6); d++) phaseMap[d] = "safe";
  for (let d = Math.max(1, TOTAL - 5); d <= TOTAL; d++) phaseMap[d] = "verySafe";

  const activeDay = hoveredDay ?? currentDay;
  const activePh = phaseMap[activeDay] || "verySafe";
  const curPh = phaseMap[currentDay] || "verySafe";
  const activeStyle = PHASE_STYLE[activePh];
  const curStyle = PHASE_STYLE[curPh];

  const isOnPeriod = currentDay <= periodLength;
  const nextPeriodDay = isOnPeriod ? 1 : TOTAL - daysUntilNextPeriod + 1;

  const pulseR = 1 + 0.06 * Math.sin(pulse * 2.5);

  const getPhaseLabel = (ph: string) => {
    if (ph === "menstruation") return t("phase_period");
    if (ph === "lowFertility") return t("phase_low_fertility");
    if (ph === "highFertility") return t("phase_fertile");
    if (ph === "ovulation") return t("phase_ovulation");
    if (ph === "safe") return t("phase_safe");
    return t("phase_very_safe");
  };

  const activeLabel = getPhaseLabel(activePh);

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
            const ph = phaseMap[day] || "verySafe";
            const style = PHASE_STYLE[ph];
            const s = i * segA + GAP / 2;
            const e = (i + 1) * segA - GAP / 2;
            const mid = (s + e) / 2;
            const isHov = day === hoveredDay;
            const isCur = day === currentDay;
            const isOvl = day === ovulationDay;
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
                    stroke="#dc143c"
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
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18 }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              {/* Phase label — top */}
              <text
                x={CX} y={CY - 38}
                textAnchor="middle"
                dominantBaseline="central"
                fill={activeStyle.bg}
                fontSize={11}
                fontWeight="600"
                letterSpacing="1.4"
                style={{ fontFamily: "Instrument Sans, sans-serif" }}
              >
                {activeLabel.toUpperCase()}
              </text>

              {/* Hero — dominant countdown */}
              {isOnPeriod ? (
                <motion.g
                  animate={{ opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <text
                    x={CX} y={CY - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#dc143c"
                    fontSize={48}
                    fontWeight="800"
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    {Math.max(periodLength - currentDay + 1, 0)}
                  </text>
                  <text
                    x={CX} y={CY + 34}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#dc143c"
                    fontSize={13}
                    fontWeight="700"
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    🩸 {t("days_remaining")}
                  </text>
                </motion.g>
              ) : (
                <>
                  <text
                    x={CX} y={CY - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#111827"
                    fontSize={52}
                    fontWeight="800"
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    {daysUntilNextPeriod}
                  </text>
                  <text
                    x={CX} y={CY + 34}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#94a3b8"
                    fontSize={12}
                    fontWeight="600"
                    style={{ fontFamily: "Instrument Sans, sans-serif" }}
                  >
                    {t("days_to_period")}
                  </text>
                </>
              )}

              {/* Secondary — cycle day */}
              <text
                x={CX} y={CY + 54}
                textAnchor="middle"
                dominantBaseline="central"
                fill={activeStyle.bg}
                fillOpacity={0.65}
                fontSize={10}
                fontWeight="500"
                style={{ fontFamily: "Instrument Sans, sans-serif" }}
              >
                {t("day")} {activeDay}
              </text>
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>

      <div className="flex gap-2 flex-wrap justify-center mt-3 px-2">
        {Object.entries(PHASE_STYLE).map(([key, s]) => {
          const isActive = (phaseMap[activeDay] || "verySafe") === key;
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
              {getPhaseLabel(key)}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const MoodButton = ({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) => (
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
      <img src={icon} alt={label} className="h-10 w-10 rounded-xl object-cover" draggable={false} />
    </motion.div>
    <span className="text-[10px] text-gray-500 font-medium">{label}</span>
  </motion.button>
);

export const HomeScreen = () => {
  const { cycleData, user, navigate, logs, getTodayWaterTotal, waterGoal } = useApp();
  const { t } = useTranslation();
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
  const greeting = hour < 12 ? t("greet_morning") : hour < 17 ? t("greet_afternoon") : t("greet_evening");

  const quickStats = [
    { label: t("stat_cycle_length"), value: String(Math.round(prediction.averageCycleLength)), unit: t("unit_days"), icon: "🔄", color: "#FF657D", bg: "#FFF0F3" },
    { label: t("stat_period_length"), value: String(Math.round(prediction.averagePeriodLength)), unit: t("unit_days"), icon: "📍", color: "#8B5CF6", bg: "#F5F0FF" },
    { label: prediction.usingAI ? t("stat_ai_next_period") : t("stat_next_period"), value: String(Math.max(0, aiDaysUntil)), unit: t("unit_days"), icon: prediction.usingAI ? "🧠" : "📅", color: "#60A5FA", bg: "#EFF6FF" },
    { label: t("stat_water_today"), value: (getTodayWaterTotal() / 1000).toFixed(1), unit: "L", icon: "💧", color: "#34D399", bg: "#ECFDF5" },
  ];

  const moods = [
    { icon: happyIcon, label: "Happy", color: "#F59E0B" },
    { icon: calmIcon, label: "Calm", color: "#34D399" },
    { icon: sadIcon, label: "Sad", color: "#60A5FA" },
    { icon: irritatedIcon, label: "Irritated", color: "#EF4444" },
    { icon: anxiousIcon, label: "Anxious", color: "#8B5CF6" },
    { icon: energeticIcon, label: "Energetic", color: "#EC4899" },
  ];

  const getMoodLabel = (mLabel: string) => {
    const lower = mLabel.toLowerCase();
    if (lower === "happy") return t("mood_happy");
    if (lower === "calm") return t("mood_calm");
    if (lower === "sad") return t("mood_sad");
    if (lower === "irritated") return t("mood_irritated");
    if (lower === "anxious") return t("mood_anxious");
    return t("mood_energetic");
  };

  const getPhaseLabel = (ph: string) => {
    if (ph === "Menstrual") return t("phase_period");
    if (ph === "Follicular") return t("phase_low_fertility");
    if (ph === "Ovulation") return t("phase_ovulation");
    return t("phase_safe");
  };

  const homePhaseLabel = getPhaseLabel(cycleData.phase);

  const insightTitle = (() => {
    if (cycleData.phase === "Menstrual") return t("insight_title_menstrual");
    if (cycleData.phase === "Follicular") return t("insight_title_follicular");
    if (cycleData.phase === "Ovulation") return t("insight_title_ovulation");
    return t("insight_title_luteal");
  })();

  const insightDesc = (() => {
    if (cycleData.phase === "Menstrual") return t("insight_desc_menstrual");
    if (cycleData.phase === "Follicular") return t("insight_desc_follicular");
    if (cycleData.phase === "Ovulation") return t("insight_desc_ovulation");
    return t("insight_desc_luteal");
  })();

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
                <span className="text-white text-[11px] font-bold">{t("ask_ai")}</span>
              </motion.button>
              <NotificationBell onPress={() => navigate("notifications")} />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("account")}
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
                const cycleDay = (() => {
                  const diffMs = d.getTime() - cycleData.lastPeriodStart.getTime();
                  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  return ((daysDiff % cycleData.cycleLength) + cycleData.cycleLength) % cycleData.cycleLength;
                })();
                const isPeriod = cycleDay < cycleData.periodLength;
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
                        : isPeriod ? "text-white" : "text-gray-500"}`}
                      style={isToday ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)" } : isPeriod ? { background: "#dc143c" } : {}}
                    >
                      {d.getDate()}
                    </div>
                    {isPeriod && <span className="text-[8px]" style={{ lineHeight: 1 }}>🩸</span>}
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
              {/* Wellness Cards */}
              <WellnessCards />
            </motion.div>
          </div>

          {/* Quick Mood Log */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">{t("how_feeling")}</h2>
              <button onClick={() => navigate("log-mood")} className="text-[11px] text-[#8B5CF6] font-semibold">{t("more")} →</button>
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex justify-between">
              {moods.map(m => (
                <MoodButton key={m.label} {...m} label={getMoodLabel(m.label)} onClick={() => navigate("log-mood")} />
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
                  {insightTitle}
                </h3>
                <p className="text-[12px] opacity-75 leading-relaxed">
                  {insightDesc}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 text-[12px] font-semibold">
                    <span>{t("ask_flowai")}</span>
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
                  {t("day_streak")}
                </div>
                {streak === 0 && (
                  <div className="text-[10px] text-gray-400 mt-0.5">{t("log_today")}</div>
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
                <div className="text-[11px] font-semibold text-[#7C3AED] mt-0.5">{t("logs_this_month")}</div>
                <div className="text-[9px] text-[#A78BFA] mt-1">
                  {logs.length >= 10 ? t("snap_consistency") : t("snap_keep_tracking")}
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
                <div className="text-[12px] font-bold text-[#FF657D] leading-tight mt-1">{t("symptoms_card")}</div>
                <div className="text-[9px] text-[#FF8FA3] mt-1 leading-tight">{t("track_symptoms")}</div>
              </motion.div>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">{t("todays_overview")}</h2>
              <button onClick={() => navigate("insights")} className="text-[11px] text-[#8B5CF6] font-semibold">{t("insights")} →</button>
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
                <div className="text-[11px] text-[#FF657D] font-semibold uppercase tracking-wide mb-0.5">{t("phase_insight")}</div>
                <h3 className="text-[14px] font-bold text-gray-800">{homePhaseLabel}</h3>
                <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">
                  {cycleData.phase === "Menstrual" ? t("insight_desc_menstrual") :
                   cycleData.phase === "Follicular" ? t("insight_desc_follicular") :
                   cycleData.phase === "Ovulation" ? t("insight_desc_ovulation") :
                   t("insight_desc_luteal")}
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
