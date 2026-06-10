import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const BAR_COLORS = ["#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309", "#92400E"];

const formatSteps = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const CircularProgress = ({
  value, max, size = 180, stroke = 14,
  color = "#F59E0B", bg = "#FDE68A",
  children,
}: {
  value: number; max: number; size?: number; stroke?: number;
  color?: string; bg?: string; children?: React.ReactNode;
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const WellnessStepsScreen = () => {
  const { navigate, stepsLogs, stepsGoal, setStepsGoal, addStepsLog, getStepStreak } = useApp();
  const [inputSteps, setInputSteps] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(String(stepsGoal));
  const [activeTab, setActiveTab] = useState<"week" | "month">("week");

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySteps = stepsLogs.find(l => l.date === todayStr)?.steps ?? 0;
  const streak = getStepStreak();
  const pct = Math.min(todaySteps / stepsGoal, 1);

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const log = stepsLogs.find(l => l.date === ds);
      out.push({ date: ds, steps: log?.steps ?? 0, label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3) });
    }
    return out;
  }, [stepsLogs]);

  const last30 = useMemo(() => {
    const out = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const log = stepsLogs.find(l => l.date === ds);
      out.push({ date: ds, steps: log?.steps ?? 0, label: String(d.getDate()) });
    }
    return out;
  }, [stepsLogs]);

  const weekAvg = useMemo(() => {
    const withData = last7.filter(d => d.steps > 0);
    if (!withData.length) return 0;
    return Math.round(withData.reduce((a, b) => a + b.steps, 0) / withData.length);
  }, [last7]);

  const prevWeek = useMemo(() => {
    const out = [];
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const log = stepsLogs.find(l => l.date === ds);
      out.push(log?.steps ?? 0);
    }
    return out;
  }, [stepsLogs]);

  const prevAvg = useMemo(() => {
    const withData = prevWeek.filter(v => v > 0);
    if (!withData.length) return weekAvg;
    return Math.round(withData.reduce((a, b) => a + b, 0) / withData.length);
  }, [prevWeek, weekAvg]);

  const weekChange = prevAvg > 0 ? Math.round(((weekAvg - prevAvg) / prevAvg) * 100) : 0;

  const chartData = activeTab === "week" ? last7 : last30;
  const maxSteps = Math.max(...chartData.map(d => d.steps), stepsGoal);

  const handleAddSteps = () => {
    const n = parseInt(inputSteps);
    if (isNaN(n) || n <= 0) return;
    addStepsLog({ date: todayStr, steps: n, source: "manual" });
    setInputSteps("");
    setShowInput(false);
  };

  const handleGoalSave = () => {
    const n = parseInt(goalInput);
    if (!isNaN(n) && n > 0) setStepsGoal(n);
    setShowGoalEdit(false);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 60%, #FFF7ED 100%)">
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
                <path d="M15 18L9 12L15 6" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            <h1 className="text-[17px] font-bold text-[#92400e]">Steps Tracker</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGoalEdit(true)}
              className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-sm"
              data-testid="button-edit-goal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Circular progress */}
          <div className="flex flex-col items-center mb-6">
            <CircularProgress value={todaySteps} max={stepsGoal} size={200} stroke={16} color="#F59E0B" bg="#FDE68A">
              <span className="text-4xl font-bold text-[#92400e]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                {todaySteps.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#B45309] font-semibold mt-1">of {stepsGoal.toLocaleString()} steps</span>
              <span className="text-[13px] font-bold mt-1" style={{ color: pct >= 1 ? "#059669" : "#D97706" }}>
                {pct >= 1 ? "🎉 Goal reached!" : `${Math.round(pct * 100)}%`}
              </span>
            </CircularProgress>

            {/* Health Connect badge */}
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-white/70 border border-amber-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[11px] text-[#92400e] font-medium">Manual Entry · Health Connect ready</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-5 mb-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Week Avg", value: formatSteps(weekAvg), unit: "steps", icon: "📊", color: "#D97706" },
                { label: "Step Streak", value: String(streak), unit: streak === 1 ? "day" : "days", icon: "🔥", color: "#EF4444" },
                { label: "vs Last Week", value: `${weekChange >= 0 ? "+" : ""}${weekChange}%`, unit: "", icon: weekChange >= 0 ? "📈" : "📉", color: weekChange >= 0 ? "#059669" : "#EF4444" },
              ].map(s => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-3 shadow-sm text-center"
                >
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-[18px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                  {s.unit && <div className="text-[9px] text-gray-400 font-medium mt-0.5">{s.unit}</div>}
                  <div className="text-[9px] text-gray-400 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Goal progress bar */}
          <div className="px-5 mb-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] font-bold text-gray-800">Goal Progress</span>
                <span className="text-[12px] text-[#D97706] font-semibold">{todaySteps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
              </div>
              <div className="relative h-3 rounded-full bg-amber-100 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #FBBF24, #F59E0B)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400">0</span>
                <span className="text-[10px] text-gray-400">{(stepsGoal / 2).toLocaleString()}</span>
                <span className="text-[10px] text-gray-400">{stepsGoal.toLocaleString()}</span>
              </div>
              {pct < 1 && (
                <p className="text-[11px] text-[#D97706] font-medium mt-2 text-center">
                  {(stepsGoal - todaySteps).toLocaleString()} more steps to hit your goal!
                </p>
              )}
            </div>
          </div>

          {/* Trend chart */}
          <div className="px-5 mb-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-bold text-gray-800">Trend</span>
                <div className="flex rounded-xl overflow-hidden border border-amber-200">
                  {(["week", "month"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="px-3 py-1 text-[11px] font-semibold transition-all"
                      style={{
                        background: activeTab === tab ? "#F59E0B" : "transparent",
                        color: activeTab === tab ? "white" : "#D97706",
                      }}
                      data-testid={`tab-${tab}`}
                    >
                      {tab === "week" ? "7 Days" : "30 Days"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-1 h-24">
                {chartData.map((d, i) => {
                  const h = maxSteps > 0 ? Math.max((d.steps / maxSteps) * 96, d.steps > 0 ? 4 : 0) : 0;
                  const isToday = d.date === todayStr;
                  const metGoal = d.steps >= stepsGoal;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className="w-full rounded-t-lg"
                        style={{
                          height: h,
                          background: metGoal ? "linear-gradient(180deg, #10B981, #059669)" : isToday ? "linear-gradient(180deg, #FBBF24, #F59E0B)" : "#FDE68A",
                          minHeight: d.steps > 0 ? 4 : 0,
                        }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                      />
                      {activeTab === "week" && (
                        <span className="text-[8px] text-gray-400 font-medium">{d.label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-3 justify-center">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: "#10B981" }} /><span className="text-[9px] text-gray-400">Goal met</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: "#F59E0B" }} /><span className="text-[9px] text-gray-400">In progress</span></div>
              </div>
            </div>
          </div>

          {/* Log steps */}
          <div className="px-5 mb-5">
            <AnimatePresence>
              {showInput ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <p className="text-[13px] font-bold text-gray-800 mb-3">Enter today's steps</p>
                  <input
                    type="number"
                    value={inputSteps}
                    onChange={e => setInputSteps(e.target.value)}
                    placeholder="e.g. 8500"
                    className="w-full border border-amber-200 rounded-xl px-4 py-3 text-[15px] font-semibold text-gray-800 outline-none focus:border-amber-400"
                    data-testid="input-steps"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowInput(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-semibold"
                    >Cancel</button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleAddSteps}
                      className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-bold"
                      style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}
                      data-testid="button-save-steps"
                    >Save Steps</motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowInput(true)}
                  className="w-full py-4 rounded-2xl text-white font-bold text-[15px] shadow-md flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" }}
                  data-testid="button-log-steps"
                >
                  <span>🚶</span> Log Today's Steps
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Health Connect info */}
          <div className="px-5 mb-5">
            <div className="rounded-2xl p-4 border border-amber-200" style={{ background: "#FFFBEB" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">⌚</div>
                <div>
                  <p className="text-[13px] font-bold text-[#92400e]">Health Connect Integration</p>
                  <p className="text-[11px] text-[#B45309] mt-0.5">Automatically sync steps from your Android device and wearables via Health Connect.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <p className="text-[16px] font-bold text-gray-900 mb-4">Daily Step Goal</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {[5000, 7500, 10000, 12500, 15000].map(n => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGoalInput(String(n))}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold border"
                      style={{
                        background: goalInput === String(n) ? "#F59E0B" : "#FFF7ED",
                        borderColor: goalInput === String(n) ? "#D97706" : "#FDE68A",
                        color: goalInput === String(n) ? "white" : "#92400e",
                      }}
                    >{n.toLocaleString()}</motion.button>
                  ))}
                </div>
                <input
                  type="number"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  className="w-full border border-amber-200 rounded-xl px-4 py-3 text-[15px] font-bold text-gray-800 outline-none mb-4"
                  data-testid="input-steps-goal"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoalSave}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-[14px]"
                  style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)" }}
                  data-testid="button-save-goal"
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
