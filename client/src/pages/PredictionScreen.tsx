import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import { computeCyclePrediction, DataQuality } from "@/lib/cyclePrediction";
import { ChevronLeft, Brain, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

const qualityConfig: Record<DataQuality, { label: string; color: string; bg: string; barColor: string; steps: number }> = {
  insufficient: { label: "Just Starting", color: "#9CA3AF", bg: "#F9FAFB", barColor: "#D1D5DB", steps: 1 },
  learning:     { label: "Learning",      color: "#F59E0B", bg: "#FFFBEB", barColor: "#FBBF24", steps: 2 },
  good:         { label: "Good",          color: "#8B5CF6", bg: "#F5F0FF", barColor: "#A78BFA", steps: 3 },
  excellent:    { label: "Expert",        color: "#10B981", bg: "#ECFDF5", barColor: "#34D399", steps: 4 },
};

const phaseColors: Record<string, string> = {
  Menstrual: "#FF657D",
  Follicular: "#FB923C",
  Ovulation: "#8B5CF6",
  Luteal: "#60A5FA",
};

function ConfidenceArc({ confidence }: { confidence: number }) {
  const r = 70;
  const cx = 100;
  const cy = 100;
  const totalAngle = 200;
  const startAngle = -190 + (360 - totalAngle) / 2;
  const endAngle = startAngle + totalAngle;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcPath = (start: number, end: number) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  const filledEnd = startAngle + (totalAngle * confidence) / 100;
  const color = confidence < 40 ? "#9CA3AF" : confidence < 65 ? "#F59E0B" : confidence < 80 ? "#8B5CF6" : "#10B981";

  return (
    <svg width="200" height="140" viewBox="0 0 200 140" className="overflow-visible">
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#F3F0FF" strokeWidth="12" strokeLinecap="round" />
      <motion.path
        d={arcPath(startAngle, filledEnd)}
        fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
      />
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="32" fontWeight="700" fill={color} fontFamily="Instrument Sans, sans-serif">
        {confidence}%
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="sans-serif">
        confidence
      </text>
    </svg>
  );
}

function MiniBarChart({ cycles }: { cycles: { startDate: string; length: number }[] }) {
  if (cycles.length === 0) return null;
  const max = Math.max(...cycles.map(c => c.length), 35);
  const min = Math.min(...cycles.map(c => c.length), 21);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1.5 h-14">
      {cycles.slice(-8).map((c, i) => {
        const heightPct = 20 + ((c.length - min) / range) * 75;
        const isLast = i === Math.min(cycles.length, 8) - 1;
        return (
          <motion.div
            key={c.startDate}
            initial={{ height: 0 }}
            animate={{ height: `${heightPct}%` }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
            className="flex-1 rounded-t-md relative group"
            style={{ background: isLast ? "#8B5CF6" : "#DDD6FE" }}
          >
            {isLast && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#8B5CF6] whitespace-nowrap">
                {c.length}d
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const color = phaseColors[phase] || "#8B5CF6";
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: color + "20", color }}>
      {phase}
    </span>
  );
}

const stepLabels: Record<DataQuality, string[]> = {
  insufficient: ["📊 Collecting", "🔬 Analyzing", "🎯 Predicting", "✨ Expert"],
  learning:     ["📊 Collecting", "🔬 Analyzing", "🎯 Predicting", "✨ Expert"],
  good:         ["📊 Collecting", "🔬 Analyzing", "🎯 Predicting", "✨ Expert"],
  excellent:    ["📊 Collecting", "🔬 Analyzing", "🎯 Predicting", "✨ Expert"],
};

const qualityStep: Record<DataQuality, number> = {
  insufficient: 0,
  learning: 1,
  good: 2,
  excellent: 3,
};

export const PredictionScreen = () => {
  const { navigate, cycleData, logs } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "patterns" | "history">("overview");

  const prediction = useMemo(
    () => computeCyclePrediction(logs, cycleData.cycleLength, cycleData.periodLength, cycleData.lastPeriodStart),
    [logs, cycleData]
  );

  const qCfg = qualityConfig[prediction.dataQuality];
  const currentStep = qualityStep[prediction.dataQuality];

  const nextPeriodStr = prediction.nextPeriodDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
  const daysUntil = Math.ceil((prediction.nextPeriodDate.getTime() - Date.now()) / 86400000);

  const profileNextPeriod = cycleData.nextPeriod.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const aiNextPeriod = prediction.nextPeriodDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const predictionDiff = Math.abs(
    Math.round((prediction.nextPeriodDate.getTime() - cycleData.nextPeriod.getTime()) / 86400000)
  );

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F5F0FF 0%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("home")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-gray-700" strokeWidth={2.2} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              AI Predictions
            </h1>
            <p className="text-[11px] font-medium" style={{ color: qCfg.color }}>
              {qCfg.label} mode · {prediction.cycleHistory.length} cycle{prediction.cycleHistory.length !== 1 ? "s" : ""} analyzed
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
          >
            <Sparkles size={16} className="text-white" />
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 mb-3">
          {(["overview", "patterns", "history"] as const).map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={
                activeTab === tab
                  ? { background: "linear-gradient(135deg, #8B5CF6, #EC4899)", color: "white" }
                  : { background: "white", color: "#6B7280" }
              }
            >
              {tab === "overview" ? "🎯 Overview" : tab === "patterns" ? "📊 Patterns" : "📅 History"}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Confidence gauge card */}
                <div className="bg-white rounded-3xl p-5 shadow-sm flex flex-col items-center"
                  style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.08)" }}>
                  <ConfidenceArc confidence={prediction.confidence} />
                  <div className="text-center mt-1">
                    <p className="text-[18px] font-bold text-gray-900 leading-tight">{nextPeriodStr}</p>
                    <p className="text-[13px] text-gray-400 mt-0.5">
                      {daysUntil > 0
                        ? `in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`
                        : daysUntil === 0
                        ? "Today!"
                        : `${Math.abs(daysUntil)} days ago`}
                    </p>
                  </div>

                  {prediction.usingAI && predictionDiff > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 w-full flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: "#F5F0FF" }}
                    >
                      <div className="text-center flex-1">
                        <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Profile</p>
                        <p className="text-[12px] font-bold text-gray-500">{profileNextPeriod}</p>
                      </div>
                      <div className="px-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#8B5CF6" }}>
                          <Brain size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: "#8B5CF6" }}>AI Predicts</p>
                        <p className="text-[12px] font-bold" style={{ color: "#8B5CF6" }}>{aiNextPeriod}</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">Shift</p>
                        <p className="text-[12px] font-bold text-gray-600">±{predictionDiff}d</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* AI Learning progress bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
                      <Brain size={14} style={{ color: qCfg.color }} />
                      AI Training Progress
                    </h3>
                    <span className="text-[11px] font-semibold" style={{ color: qCfg.color }}>{qCfg.label}</span>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {stepLabels[prediction.dataQuality].map((lbl, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.12, duration: 0.5 }}
                          className="w-full h-1.5 rounded-full origin-left"
                          style={{ background: i <= currentStep ? qCfg.barColor : "#E5E7EB" }}
                        />
                        <span className="text-[8px] text-center leading-tight" style={{ color: i <= currentStep ? qCfg.color : "#9CA3AF" }}>
                          {lbl}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {prediction.dataQuality === "insufficient"
                      ? "Log your first period to begin AI training. The more you log, the smarter predictions get."
                      : prediction.dataQuality === "learning"
                      ? `${prediction.cycleHistory.length} cycle${prediction.cycleHistory.length !== 1 ? "s" : ""} analyzed. ${4 - prediction.cycleHistory.length} more until Good accuracy.`
                      : prediction.dataQuality === "good"
                      ? `${prediction.cycleHistory.length} cycles analyzed. Predictions are personalized to your cycle.`
                      : `${prediction.cycleHistory.length} cycles analyzed. Expert-level predictions — FlowAI knows your body.`}
                  </p>
                </div>

                {/* Key stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Avg Cycle", value: `${prediction.averageCycleLength}`, unit: "days", icon: "🔄", color: "#8B5CF6", bg: "#F5F0FF" },
                    { label: "Avg Period", value: `${prediction.averagePeriodLength}`, unit: "days", icon: "🩸", color: "#FF657D", bg: "#FFF0F3" },
                    { label: "Variability", value: `±${prediction.variability}`, unit: "days", icon: "📊", color: "#F59E0B", bg: "#FFFBEB" },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-3 shadow-sm"
                      style={{ background: stat.bg }}
                    >
                      <div className="text-lg mb-1">{stat.icon}</div>
                      <div className="text-[20px] font-bold leading-none" style={{ color: stat.color, fontFamily: "Instrument Sans, sans-serif" }}>
                        {stat.value}
                        <span className="text-[9px] font-medium ml-0.5 opacity-70">{stat.unit}</span>
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5 font-medium">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Insights */}
                <div className="space-y-2">
                  {prediction.patternInsights.map((insight, i) => (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl p-4 shadow-sm flex gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-50">
                        {insight.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-gray-800">{insight.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{insight.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Log more CTA if insufficient data */}
                {prediction.dataQuality === "insufficient" && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("log-entry")}
                    className="w-full py-4 rounded-2xl text-white font-semibold text-[15px] shadow-md"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
                    data-testid="button-log-period"
                  >
                    ✨ Log Your Period to Start AI Training
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* ── PATTERNS TAB ── */}
            {activeTab === "patterns" && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Mood patterns */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                    🧠 Mood by Phase
                  </h3>
                  {prediction.moodPatterns.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-[13px] text-gray-400">No mood patterns yet. Log your mood daily to see trends.</p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("log-entry")}
                        className="mt-3 px-4 py-2 rounded-full text-white text-sm font-semibold"
                        style={{ background: "#8B5CF6" }}
                      >
                        Log Mood
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {prediction.moodPatterns.map((m) => (
                        <div key={m.mood} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{m.emoji}</span>
                            <div>
                              <span className="text-[12px] font-semibold text-gray-800">{m.mood}</span>
                              <span className="text-[10px] text-gray-400 ml-1">({m.count}×)</span>
                            </div>
                          </div>
                          <PhaseBadge phase={m.phase} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Symptom patterns */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3">🩺 Symptom Patterns</h3>
                  {prediction.symptomPatterns.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-[13px] text-gray-400">
                        No symptom patterns yet. Use the Symptom Tracker to log physical and emotional symptoms.
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("symptom-tracker")}
                        className="mt-3 px-4 py-2 rounded-full text-white text-sm font-semibold"
                        style={{ background: "#FF657D" }}
                      >
                        Track Symptoms
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {prediction.symptomPatterns.map((s) => (
                        <div key={s.symptom} className="flex items-center justify-between">
                          <div>
                            <span className="text-[12px] font-semibold text-gray-800 capitalize">{s.symptom}</span>
                            <span className="text-[10px] text-gray-400 ml-1">({s.count}× logged)</span>
                          </div>
                          <PhaseBadge phase={s.phase} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cycle predictability gauge */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3">🎯 Cycle Predictability</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prediction.confidence}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: prediction.confidence < 50
                            ? "linear-gradient(90deg, #9CA3AF, #D1D5DB)"
                            : prediction.confidence < 75
                            ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
                            : "linear-gradient(90deg, #8B5CF6, #EC4899)",
                        }}
                      />
                    </div>
                    <span className="text-[14px] font-bold text-gray-700">{prediction.confidence}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Shortest", value: `${prediction.shortestCycle}d`, color: "#34D399" },
                      { label: "Average", value: `${prediction.averageCycleLength}d`, color: "#8B5CF6" },
                      { label: "Longest", value: `${prediction.longestCycle}d`, color: "#FF657D" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl py-2.5 px-2" style={{ background: s.color + "15" }}>
                        <div className="text-[16px] font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[9px] text-gray-400 font-medium">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Bar chart */}
                {prediction.cycleHistory.length > 0 ? (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[14px] font-bold text-gray-800">Cycle Length History</h3>
                      <div className="flex items-center gap-1 text-[11px] text-[#8B5CF6] font-semibold">
                        <TrendingUp size={12} />
                        {prediction.cycleHistory.length} cycles
                      </div>
                    </div>
                    <MiniBarChart cycles={prediction.cycleHistory} />
                    <div className="flex justify-between mt-2 text-[9px] text-gray-400">
                      <span>Earliest</span>
                      <span>Most recent ←</span>
                    </div>
                    <div className="mt-3 flex gap-3 justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#DDD6FE]" />
                        <span className="text-[10px] text-gray-500">Past cycles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" />
                        <span className="text-[10px] text-gray-500">Latest cycle</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-[14px] font-semibold text-gray-600">No cycle history yet</p>
                    <p className="text-[12px] text-gray-400 mt-1">Log at least 2 periods to see your cycle history chart.</p>
                  </div>
                )}

                {/* Period events list */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3">Period Log</h3>
                  {prediction.periodEvents.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-[12px] text-gray-400">No periods logged yet.</p>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("log-entry")}
                        className="mt-2 px-4 py-1.5 rounded-full text-[12px] font-semibold text-white"
                        style={{ background: "#FF657D" }}
                      >
                        Log Period
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prediction.periodEvents.slice().reverse().map((ev, i) => (
                        <motion.div
                          key={ev.startDate}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="text-[13px] font-semibold text-gray-800">
                              {new Date(ev.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              {ev.startDate !== ev.endDate && (
                                <span className="text-gray-400 font-normal">
                                  {" – "}
                                  {new Date(ev.endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </p>
                            {i < prediction.cycleHistory.slice().reverse().length && (
                              <p className="text-[10px] text-gray-400">
                                Cycle: {prediction.cycleHistory.slice().reverse()[i]?.length ?? "—"}d
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#FF657D]">{ev.durationDays}d period</span>
                            <span className="text-[10px] text-[#FF657D]">🩸</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next predictions */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3">📅 Upcoming Predictions</h3>
                  <div className="space-y-2">
                    {[0, 1, 2].map((offset) => {
                      const date = new Date(prediction.nextPeriodDate);
                      date.setDate(date.getDate() + Math.round(prediction.averageCycleLength) * offset);
                      const conf = Math.max(20, prediction.confidence - offset * 10);
                      return (
                        <div key={offset} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full`} style={{ background: offset === 0 ? "#8B5CF6" : "#DDD6FE" }} />
                            <div>
                              <p className="text-[12px] font-semibold text-gray-800">
                                {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                              <p className="text-[10px] text-gray-400">Period {offset === 0 ? "(next)" : offset === 1 ? "(cycle +1)" : "(cycle +2)"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-[#8B5CF6]" style={{ width: `${conf}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400">{conf}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
