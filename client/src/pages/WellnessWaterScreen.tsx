import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const QUICK_ADD = [
  { label: "250 ml", value: 250, icon: "🥛" },
  { label: "500 ml", value: 500, icon: "🧃" },
  { label: "750 ml", value: 750, icon: "🍶" },
  { label: "1000 ml", value: 1000, icon: "🧴" },
];

const CUP_SIZES = [200, 250, 300, 350, 500];

const CupIcon = ({ selected }: { selected: boolean }) => (
  <div className="flex flex-col items-center justify-end" style={{ width: 32, height: 38 }}>
    <div
      className="relative rounded-b-lg rounded-t-sm"
      style={{
        width: 24, height: 30,
        background: selected
          ? "linear-gradient(160deg, #f9a8d4 0%, #ec4899 100%)"
          : "linear-gradient(160deg, #fda4af 0%, #fb7185 80%)",
        boxShadow: selected ? "0 2px 8px rgba(236,72,153,0.35)" : "none",
      }}
    >
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[3px] h-[8px] rounded-full bg-white/60" />
      <div className="absolute bottom-0 left-0 right-0 h-[10px] rounded-b-lg" style={{ background: "rgba(255,255,255,0.18)" }} />
      <div
        className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[10px] h-[6px] rounded-t-sm"
        style={{ background: selected ? "#ec4899" : "#fb7185", borderBottom: "none" }}
      />
    </div>
  </div>
);

const HydrationRing = ({ current, goal }: { current: number; goal: number }) => {
  const pct = Math.min(current / goal, 1);
  const size = 200;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  const getColor = (p: number) => {
    if (p < 0.4) return "#93C5FD";
    if (p < 0.7) return "#3B82F6";
    return "#1D4ED8";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DBEAFE" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={getColor(pct)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={current}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[38px] font-bold text-[#1e40af]"
          style={{ fontFamily: "Instrument Sans, sans-serif" }}
        >
          {current >= 1000 ? `${(current / 1000).toFixed(1)}L` : `${current}ml`}
        </motion.span>
        <span className="text-[11px] text-[#3B82F6] font-semibold mt-0.5">of {goal / 1000}L goal</span>
        <span className="text-[13px] font-bold mt-1.5" style={{ color: pct >= 1 ? "#059669" : "#2563EB" }}>
          {pct >= 1 ? "🎉 Hydrated!" : `${Math.round(pct * 100)}%`}
        </span>
      </div>
    </div>
  );
};

const WaterCustomModal = ({
  todayTotal,
  waterGoal,
  onAdd,
  onRemove,
  onClose,
}: {
  todayTotal: number;
  waterGoal: number;
  onAdd: (ml: number) => void;
  onRemove: (ml: number) => void;
  onClose: () => void;
}) => {
  const [selectedSize, setSelectedSize] = useState(250);
  const pillCount = 10;
  const filledPills = Math.round(Math.min(todayTotal / waterGoal, 1) * pillCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/40 flex items-end z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 420 }}
        animate={{ y: 0 }}
        exit={{ y: 420 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className="w-full rounded-t-3xl px-5 pt-5 pb-6"
        style={{ background: "#E8F9F6" }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300/70 rounded-full mx-auto mb-4" />

        {/* Card */}
        <div className="bg-white rounded-3xl px-5 py-5 shadow-sm mb-4">
          {/* Drop + amount */}
          <div className="flex flex-col items-center mb-1">
            <span style={{ fontSize: 36 }}>💧</span>
            <div className="flex items-end gap-1 mt-1">
              <motion.span
                key={todayTotal}
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-bold leading-none"
                style={{ fontSize: 52, color: "#34D399", fontFamily: "Instrument Sans, sans-serif" }}
              >
                {todayTotal}
              </motion.span>
              <span className="text-[20px] font-semibold text-gray-400 mb-2">ml</span>
            </div>
            <span className="text-[13px] text-gray-400 font-medium mt-0.5">Goal: {waterGoal}ml</span>
          </div>

          {/* Pill progress bar */}
          <div className="flex gap-[5px] justify-center mt-3 mb-4">
            {Array.from({ length: pillCount }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: 28, height: 38,
                  background: i < filledPills
                    ? "linear-gradient(180deg, #6EE7B7 0%, #34D399 100%)"
                    : "#E5E7EB",
                }}
                initial={{ scaleY: 0.6, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              />
            ))}
          </div>

          {/* Cup size selector */}
          <p className="text-[13px] font-bold text-gray-800 mb-3">Select Cup Size</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CUP_SIZES.map(size => (
              <motion.button
                key={size}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedSize(size)}
                className="flex flex-col items-center gap-1 rounded-2xl py-3"
                style={{
                  width: 70,
                  border: selectedSize === size ? "2px solid #34D399" : "2px solid #E5E7EB",
                  background: selectedSize === size ? "#F0FDF9" : "white",
                }}
                data-testid={`button-cup-${size}ml`}
              >
                <CupIcon selected={selectedSize === size} />
                <span
                  className="text-[11px] font-bold"
                  style={{ color: selectedSize === size ? "#059669" : "#6B7280" }}
                >
                  {size}ml
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Remove / Add buttons */}
        <div className="flex gap-3 mb-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onRemove(selectedSize)}
            className="flex-1 py-4 rounded-2xl font-bold text-[15px] border-2"
            style={{ borderColor: "#34D399", color: "#059669", background: "white" }}
            data-testid="button-remove-water"
          >
            – Remove
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onAdd(selectedSize)}
            className="flex-1 py-4 rounded-2xl font-bold text-[15px] text-white"
            style={{ background: "linear-gradient(135deg, #6EE7B7, #34D399)" }}
            data-testid="button-add-custom-water"
          >
            + Add {selectedSize}ml
          </motion.button>
        </div>

        {/* Done */}
        <button
          onClick={onClose}
          className="w-full text-center text-[14px] font-semibold text-gray-400 py-1"
          data-testid="button-custom-done"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

export const WellnessWaterScreen = () => {
  const { navigate, waterLogs, waterGoal, setWaterGoal, addWaterLog } = useApp();
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [goalInput, setGoalInput] = useState(String(waterGoal));
  const [lastAdded, setLastAdded] = useState<number | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTotal = waterLogs.find(l => l.date === todayStr)?.amount ?? 0;

  const handleQuickAdd = (ml: number) => {
    addWaterLog({ date: todayStr, amount: ml });
    setLastAdded(ml);
    setTimeout(() => setLastAdded(null), 2000);
  };

  const handleCustomAdd = (ml: number) => {
    addWaterLog({ date: todayStr, amount: ml });
    setLastAdded(ml);
    setTimeout(() => setLastAdded(null), 2000);
  };

  const handleCustomRemove = (ml: number) => {
    if (todayTotal >= ml) {
      addWaterLog({ date: todayStr, amount: -ml });
      setLastAdded(-ml);
      setTimeout(() => setLastAdded(null), 2000);
    }
  };

  const last7 = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const log = waterLogs.find(l => l.date === ds);
      out.push({
        date: ds,
        amount: log?.amount ?? 0,
        label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
      });
    }
    return out;
  }, [waterLogs]);

  const weekAvg = useMemo(() => {
    const withData = last7.filter(d => d.amount > 0);
    if (!withData.length) return 0;
    return Math.round(withData.reduce((a, b) => a + b.amount, 0) / withData.length);
  }, [last7]);

  const daysMetGoal = last7.filter(d => d.amount >= waterGoal).length;
  const maxAmount = Math.max(...last7.map(d => d.amount), waterGoal);
  const remaining = Math.max(waterGoal - todayTotal, 0);

  const handleGoalSave = () => {
    const n = parseInt(goalInput);
    if (!isNaN(n) && n > 0) setWaterGoal(n);
    setShowGoalEdit(false);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 60%, #EFF6FF 100%)">
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
                <path d="M15 18L9 12L15 6" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            <h1 className="text-[17px] font-bold text-[#1e40af]">Hydration</h1>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGoalEdit(true)}
              className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shadow-sm"
              data-testid="button-edit-goal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#1e40af" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1e40af" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Hydration ring */}
          <div className="flex flex-col items-center mb-5">
            <HydrationRing current={todayTotal} goal={waterGoal} />
            <AnimatePresence>
              {lastAdded && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 px-4 py-1.5 rounded-full text-white text-[12px] font-bold shadow"
                  style={{ background: lastAdded > 0 ? "linear-gradient(135deg, #3B82F6, #1D4ED8)" : "linear-gradient(135deg, #F87171, #EF4444)" }}
                >
                  {lastAdded > 0 ? `+${lastAdded}ml added 💧` : `${lastAdded}ml removed`}
                </motion.div>
              )}
            </AnimatePresence>
            {remaining > 0 && (
              <p className="text-[12px] text-[#3B82F6] font-medium mt-2">
                {remaining >= 1000 ? `${(remaining / 1000).toFixed(1)}L` : `${remaining}ml`} more to reach goal
              </p>
            )}
          </div>

          {/* Quick add */}
          <div className="px-5 mb-5">
            <h2 className="text-[14px] font-bold text-gray-800 mb-3">Quick Add</h2>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {QUICK_ADD.map(item => (
                <motion.button
                  key={item.value}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleQuickAdd(item.value)}
                  className="flex flex-col items-center gap-2 py-3 rounded-2xl shadow-sm border border-blue-100"
                  style={{ background: "white" }}
                  data-testid={`button-add-${item.value}ml`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[11px] font-bold text-[#1e40af]">{item.label}</span>
                </motion.button>
              ))}
            </div>
            {/* Custom Add button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCustom(true)}
              className="w-full py-3 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 border-2"
              style={{
                borderColor: "#34D399",
                background: "linear-gradient(135deg, #F0FDF9, #DCFCE7)",
                color: "#059669",
              }}
              data-testid="button-custom-add"
            >
              <span className="text-lg">🥤</span>
              Custom Add / Remove
            </motion.button>
          </div>

          {/* Stats row */}
          <div className="px-5 mb-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Week Avg", value: weekAvg >= 1000 ? `${(weekAvg / 1000).toFixed(1)}L` : `${weekAvg}ml`, icon: "📊", color: "#2563EB" },
                { label: "Days on Track", value: `${daysMetGoal}/7`, icon: "✅", color: "#059669" },
                { label: "Daily Goal", value: `${waterGoal / 1000}L`, icon: "🎯", color: "#7C3AED" },
              ].map(s => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-3 shadow-sm text-center"
                >
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-[16px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly trend */}
          <div className="px-5 mb-5">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-800 mb-4">Weekly Trend</h2>
              <div className="flex items-end gap-1.5 h-24">
                {last7.map((d, i) => {
                  const h = maxAmount > 0 ? Math.max((d.amount / maxAmount) * 96, d.amount > 0 ? 4 : 0) : 0;
                  const isToday = d.date === todayStr;
                  const metGoal = d.amount >= waterGoal;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        className="w-full rounded-t-lg"
                        style={{
                          height: h,
                          background: metGoal ? "linear-gradient(180deg, #34D399, #059669)" : isToday ? "linear-gradient(180deg, #60A5FA, #3B82F6)" : "#BFDBFE",
                          minHeight: d.amount > 0 ? 4 : 0,
                        }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                      />
                      <span className="text-[8px] text-gray-400 font-medium">{d.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Goal line: {waterGoal / 1000}L</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#34D399]" /><span className="text-[9px] text-gray-400">Met goal</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#3B82F6]" /><span className="text-[9px] text-gray-400">Partial</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hydration tips */}
          <div className="px-5 mb-5">
            <div className="rounded-2xl p-4 border border-blue-100" style={{ background: "#EFF6FF" }}>
              <p className="text-[12px] font-bold text-[#1e40af] mb-2">💡 Hydration Tips</p>
              <ul className="space-y-1.5">
                {[
                  "Start your day with a full glass of water",
                  "Drink 500ml 30 mins before each meal",
                  "Add lemon or mint for variety",
                ].map((tip, i) => (
                  <li key={i} className="text-[11px] text-[#3B82F6] flex items-start gap-1.5">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Custom add/remove modal */}
        <AnimatePresence>
          {showCustom && (
            <WaterCustomModal
              todayTotal={todayTotal}
              waterGoal={waterGoal}
              onAdd={handleCustomAdd}
              onRemove={handleCustomRemove}
              onClose={() => setShowCustom(false)}
            />
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
                <p className="text-[16px] font-bold text-gray-900 mb-4">Daily Water Goal</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {[1500, 2000, 2500, 3000, 3500].map(n => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGoalInput(String(n))}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold border"
                      style={{
                        background: goalInput === String(n) ? "#3B82F6" : "#EFF6FF",
                        borderColor: goalInput === String(n) ? "#1D4ED8" : "#BFDBFE",
                        color: goalInput === String(n) ? "white" : "#1e40af",
                      }}
                    >{n >= 1000 ? `${n / 1000}L` : `${n}ml`}</motion.button>
                  ))}
                </div>
                <input
                  type="number"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 text-[15px] font-bold text-gray-800 outline-none mb-4"
                  data-testid="input-water-goal"
                  placeholder="ml per day"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoalSave}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-[14px]"
                  style={{ background: "linear-gradient(135deg, #60A5FA, #3B82F6)" }}
                  data-testid="button-save-water-goal"
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
