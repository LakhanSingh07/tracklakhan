import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp, SleepLog } from "@/lib/appContext";

const DURATIONS = [
  { label: "4h", value: 4 },
  { label: "5h", value: 5 },
  { label: "6h", value: 6 },
  { label: "7h", value: 7 },
  { label: "8h", value: 8 },
  { label: "9h+", value: 9 },
];

const QUALITIES: { label: string; value: SleepLog["quality"]; emoji: string; color: string }[] = [
  { label: "Poor", value: "poor", emoji: "😞", color: "#EF4444" },
  { label: "Fair", value: "fair", emoji: "😐", color: "#F59E0B" },
  { label: "Good", value: "good", emoji: "😊", color: "#34D399" },
  { label: "Excellent", value: "excellent", emoji: "🤩", color: "#8B5CF6" },
];

const qualityScore = (q: SleepLog["quality"]) => {
  if (q === "poor") return 25;
  if (q === "fair") return 50;
  if (q === "good") return 75;
  return 100;
};

const qualityColor = (q: SleepLog["quality"]) => {
  if (q === "poor") return "#EF4444";
  if (q === "fair") return "#F59E0B";
  if (q === "good") return "#34D399";
  return "#8B5CF6";
};

const sleepScore = (duration: number, quality: SleepLog["quality"], goal: number): number => {
  const durationScore = Math.min((duration / goal) * 60, 60);
  const qScore = qualityScore(quality) * 0.4;
  return Math.round(Math.min(durationScore + qScore, 100));
};

const ScoreRing = ({ score }: { score: number }) => {
  const size = 110;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#8B5CF6" : score >= 60 ? "#34D399" : score >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE9FE" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-bold" style={{ color }}>{score}</span>
        <span className="text-[8px] text-gray-400 font-medium">SCORE</span>
      </div>
    </div>
  );
};

export const WellnessSleepScreen = () => {
  const { navigate, sleepLogs, sleepGoal, setSleepGoal, addSleepLog } = useApp();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<SleepLog["quality"] | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(String(sleepGoal));

  const todayStr = new Date().toISOString().split("T")[0];
  const lastSleep = useMemo(() => {
    const sorted = [...sleepLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0] ?? null;
  }, [sleepLogs]);

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const log = sleepLogs.find(l => l.date === ds);
      out.push({
        date: ds,
        duration: log?.duration ?? 0,
        quality: log?.quality ?? null,
        label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
      });
    }
    return out;
  }, [sleepLogs]);

  const avgDuration = useMemo(() => {
    const withData = last7.filter(d => d.duration > 0);
    if (!withData.length) return 0;
    return Math.round((withData.reduce((a, b) => a + b.duration, 0) / withData.length) * 10) / 10;
  }, [last7]);

  const avgScore = useMemo(() => {
    const withData = last7.filter(d => d.duration > 0 && d.quality);
    if (!withData.length) return 0;
    const scores = withData.map(d => sleepScore(d.duration, d.quality as SleepLog["quality"], sleepGoal));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [last7, sleepGoal]);

  const todayScore = lastSleep ? sleepScore(lastSleep.duration, lastSleep.quality, sleepGoal) : 0;

  const maxDuration = Math.max(...last7.map(d => d.duration), sleepGoal);

  const handleLogSleep = () => {
    if (selectedDuration === null || selectedQuality === null) return;
    addSleepLog({ date: todayStr, duration: selectedDuration, quality: selectedQuality });
    setSelectedDuration(null);
    setSelectedQuality(null);
    setShowLog(false);
  };

  const handleGoalSave = () => {
    const n = parseInt(goalInput);
    if (!isNaN(n) && n > 0) setSleepGoal(n);
    setShowGoalEdit(false);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F5F0FF 0%, #EDE9FE 60%, #F5F0FF 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto scrollbar-none pb-4">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("home")}
              className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-sm"
              data-testid="button-back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#5b21b6" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            <h1 className="text-[17px] font-bold text-[#5b21b6]">Sleep Tracker</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGoalEdit(true)}
              className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-sm"
              data-testid="button-edit-goal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Last night summary */}
          <div className="px-5 mb-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 shadow-sm"
              style={{ boxShadow: "0 4px 24px rgba(139,92,246,0.10)" }}
            >
              <p className="text-[11px] text-[#8B5CF6] font-semibold uppercase tracking-wide mb-3">Last Night</p>
              {lastSleep ? (
                <div className="flex items-center gap-4">
                  <ScoreRing score={todayScore} />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-[36px] font-bold text-[#5b21b6]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                        {lastSleep.duration}h
                      </span>
                      <span className="text-[13px] text-[#8B5CF6] font-medium">/ {sleepGoal}h goal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const q = QUALITIES.find(q => q.value === lastSleep.quality)!;
                        return (
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                            style={{ background: q.color }}
                          >
                            {q.emoji} {q.label}
                          </span>
                        );
                      })()}
                      <span className="text-[11px] text-gray-400">
                        {lastSleep.duration >= sleepGoal ? "Goal met! 🎉" : `${sleepGoal - lastSleep.duration}h short`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 gap-2">
                  <span className="text-3xl">😴</span>
                  <p className="text-[13px] text-gray-500">No sleep logged yet. Log last night's sleep!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="px-5 mb-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Avg Duration", value: `${avgDuration}h`, icon: "🕐", color: "#7C3AED" },
                { label: "Week Score", value: String(avgScore), icon: "⭐", color: "#F59E0B" },
                { label: "Sleep Goal", value: `${sleepGoal}h`, icon: "🎯", color: "#8B5CF6" },
              ].map(s => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-3 shadow-sm text-center"
                >
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-[18px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly trend */}
          <div className="px-5 mb-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-800 mb-4">Weekly Sleep Trend</h2>
              <div className="flex items-end gap-1.5 h-28">
                {last7.map((d, i) => {
                  const h = maxDuration > 0 ? Math.max((d.duration / maxDuration) * 112, d.duration > 0 ? 6 : 0) : 0;
                  const isToday = d.date === todayStr;
                  const barColor = d.quality
                    ? qualityColor(d.quality as SleepLog["quality"])
                    : isToday ? "#A78BFA" : "#DDD6FE";
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex-1 flex items-end w-full">
                        <motion.div
                          className="w-full rounded-t-lg"
                          style={{ height: h, background: barColor, minHeight: d.duration > 0 ? 6 : 0 }}
                          initial={{ scaleY: 0, originY: 1 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-[8px] text-gray-400 font-medium">{d.label}</span>
                      {d.duration > 0 && (
                        <span className="text-[7px] text-gray-400">{d.duration}h</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 justify-center">
                {QUALITIES.map(q => (
                  <div key={q.value} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm" style={{ background: q.color }} />
                    <span className="text-[8px] text-gray-400">{q.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log sleep button */}
          <div className="px-5 mb-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLog(true)}
              className="w-full py-4 rounded-2xl text-white font-bold text-[15px] shadow-md flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)" }}
              data-testid="button-log-sleep"
            >
              <span>😴</span> Log Sleep
            </motion.button>
          </div>

          {/* Sleep tips */}
          <div className="px-5 mb-5">
            <div className="rounded-2xl p-4 border border-purple-100" style={{ background: "#F5F0FF" }}>
              <p className="text-[12px] font-bold text-[#5b21b6] mb-2">💡 Sleep Tips for Your Cycle</p>
              <p className="text-[11px] text-[#7C3AED] leading-relaxed">
                During your luteal phase, progesterone rises which can disrupt sleep. Try magnesium-rich foods, limit caffeine after 2pm, and maintain a consistent bedtime.
              </p>
            </div>
          </div>
        </div>

        {/* Log sleep modal */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-end z-50"
              onClick={() => setShowLog(false)}
            >
              <motion.div
                initial={{ y: 400 }}
                animate={{ y: 0 }}
                exit={{ y: 400 }}
                transition={{ type: "spring", damping: 26 }}
                onClick={e => e.stopPropagation()}
                className="bg-white w-full rounded-t-3xl p-6 pb-10"
              >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                <p className="text-[16px] font-bold text-gray-900 mb-4">Log Last Night's Sleep</p>

                <p className="text-[12px] font-semibold text-gray-600 mb-3">How long did you sleep?</p>
                <div className="flex gap-2 flex-wrap mb-5">
                  {DURATIONS.map(d => (
                    <motion.button
                      key={d.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDuration(d.value)}
                      className="px-4 py-2.5 rounded-xl text-[13px] font-bold border"
                      style={{
                        background: selectedDuration === d.value ? "#8B5CF6" : "#F5F0FF",
                        borderColor: selectedDuration === d.value ? "#7C3AED" : "#DDD6FE",
                        color: selectedDuration === d.value ? "white" : "#5b21b6",
                      }}
                      data-testid={`button-duration-${d.value}h`}
                    >{d.label}</motion.button>
                  ))}
                </div>

                <p className="text-[12px] font-semibold text-gray-600 mb-3">How was your sleep quality?</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {QUALITIES.map(q => (
                    <motion.button
                      key={q.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedQuality(q.value)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border text-left"
                      style={{
                        background: selectedQuality === q.value ? q.color + "20" : "white",
                        borderColor: selectedQuality === q.value ? q.color : "#e5e7eb",
                      }}
                      data-testid={`button-quality-${q.value}`}
                    >
                      <span className="text-xl">{q.emoji}</span>
                      <span className="text-[13px] font-semibold" style={{ color: selectedQuality === q.value ? q.color : "#374151" }}>
                        {q.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {selectedDuration !== null && selectedQuality !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4 p-3 rounded-xl border border-purple-100"
                    style={{ background: "#F5F0FF" }}
                  >
                    <ScoreRing score={sleepScore(selectedDuration, selectedQuality, sleepGoal)} />
                    <div>
                      <p className="text-[13px] font-bold text-[#5b21b6]">Sleep Score Preview</p>
                      <p className="text-[11px] text-[#8B5CF6] mt-0.5">
                        {sleepScore(selectedDuration, selectedQuality, sleepGoal) >= 80
                          ? "Excellent sleep! 🌟"
                          : sleepScore(selectedDuration, selectedQuality, sleepGoal) >= 60
                          ? "Good night's rest 😊"
                          : "Room to improve 💪"}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLog(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-semibold"
                  >Cancel</button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleLogSleep}
                    disabled={selectedDuration === null || selectedQuality === null}
                    className="flex-1 py-3 rounded-xl text-white text-[13px] font-bold disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #A78BFA, #8B5CF6)" }}
                    data-testid="button-save-sleep"
                  >Save Sleep</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal edit modal */}
        <AnimatePresence>
          {showGoalEdit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 flex items-end z-50"
              onClick={() => setShowGoalEdit(false)}
            >
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", damping: 26 }}
                onClick={e => e.stopPropagation()}
                className="bg-white w-full rounded-t-3xl p-6"
              >
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                <p className="text-[16px] font-bold text-gray-900 mb-4">Sleep Goal</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {[6, 7, 8, 9].map(n => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGoalInput(String(n))}
                      className="px-5 py-2.5 rounded-xl text-[13px] font-semibold border"
                      style={{
                        background: goalInput === String(n) ? "#8B5CF6" : "#F5F0FF",
                        borderColor: goalInput === String(n) ? "#7C3AED" : "#DDD6FE",
                        color: goalInput === String(n) ? "white" : "#5b21b6",
                      }}
                    >{n}h</motion.button>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoalSave}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-[14px]"
                  style={{ background: "linear-gradient(135deg, #A78BFA, #8B5CF6)" }}
                  data-testid="button-save-sleep-goal"
                >Save Goal</motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
