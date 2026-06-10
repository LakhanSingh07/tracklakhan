import { useMemo } from "react";
import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { computeCyclePrediction } from "@/lib/cyclePrediction";

const WellnessRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" className="absolute inset-0">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
          <motion.circle
            cx="40" cy="40" r={r}
            fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[17px] font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-[11px] text-gray-500 font-medium text-center">{label}</span>
    </div>
  );
};

const TrendBar = ({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-base flex-shrink-0">{icon}</span>
    <div className="flex-1">
      <div className="flex justify-between mb-1">
        <span className="text-[12px] font-medium text-gray-700">{label}</span>
        <span className="text-[12px] font-bold" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  </div>
);

const MoodTag = ({ mood, pct, color }: { mood: string; pct: number; color: string }) => (
  <motion.div whileTap={{ scale: 0.95 }} className="flex flex-col items-center gap-1.5">
    <div className="text-2xl">{mood}</div>
    <div className="w-1.5 rounded-full" style={{ height: pct * 0.6 + 8, background: color, opacity: 0.8 }} />
    <span className="text-[10px] text-gray-400">{pct}%</span>
  </motion.div>
);

const dateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

export const InsightsScreen = () => {
  const { navigate, cycleData, logs, waterLogs, waterGoal, sleepLogs, sleepGoal, stepsLogs, stepsGoal } = useApp();
  const prediction = useMemo(
    () => computeCyclePrediction(logs, cycleData.cycleLength, cycleData.periodLength, cycleData.lastPeriodStart),
    [logs, cycleData]
  );

  const { cycleScore, moodScore, hydrationScore, sleepScore, wellnessScore, moodTrends, wellnessLabel, cycleStatus, moodStatus, sleepStatus, avgWaterL } = useMemo(() => {
    const since7 = dateStr(7);
    const since30 = dateStr(30);

    // Cycle health
    const cycleScore = prediction.usingAI
      ? Math.min(95, prediction.confidence)
      : Math.min(80, 30 + logs.length * 5);

    // Mood score from last 30 days logs
    const recent = logs.filter(l => l.date >= since30);
    const positiveMoods = ["😊", "😄", "🤗", "😌"];
    const negativeMoods = ["😰", "😢", "😤"];
    const moodTotal = recent.reduce((s, l) => {
      if (!l.mood) return s + 65;
      if (positiveMoods.includes(l.mood)) return s + 90;
      if (negativeMoods.includes(l.mood)) return s + 35;
      return s + 60;
    }, 0);
    const moodScore = recent.length > 0 ? Math.round(moodTotal / recent.length) : 65;

    // Hydration from last 7 days waterLogs
    const recentWater = waterLogs.filter(l => l.date >= since7);
    const avgWater = recentWater.length > 0
      ? recentWater.reduce((s, l) => s + (l.amount ?? 0), 0) / recentWater.length
      : 0;
    const hydrationScore = Math.min(100, Math.round((avgWater / waterGoal) * 100));
    const avgWaterL = recentWater.length > 0 ? (avgWater / 1000).toFixed(1) : null;

    // Sleep from last 7 days sleepLogs
    const recentSleep = sleepLogs.filter(l => l.date >= since7);
    const avgSleep = recentSleep.length > 0
      ? recentSleep.reduce((s, l) => s + l.duration, 0) / recentSleep.length
      : 0;
    const sleepScore = Math.min(100, Math.round((avgSleep / (sleepGoal * 60)) * 100));

    const wellnessScore = Math.round((cycleScore + moodScore + hydrationScore + sleepScore) / 4);

    const wellnessLabel = wellnessScore >= 80 ? "Excellent 🌟" : wellnessScore >= 65 ? "Good — keep it up! 🌸" : wellnessScore >= 50 ? "Fair — room to grow 🌱" : "Needs attention 💙";

    // Cycle status
    const cycleStatus = prediction.usingAI && cycleScore >= 70 ? "Regular" : logs.length < 3 ? "Learning" : "Tracking";
    const moodStatus = moodScore >= 70 ? "Stable" : moodScore >= 50 ? "Mixed" : "Low";
    const sleepStatus = sleepScore >= 70 ? "Good" : sleepScore >= 40 ? "Fair" : "Low";

    // Mood breakdown from last 30 days
    const moodEmojis = ["😊", "😌", "😤", "😢", "😰", "😴", "😄", "🤗"];
    const moodColors = ["#EC4899", "#8B5CF6", "#F59E0B", "#60A5FA", "#34D399", "#F97316", "#EC4899", "#A78BFA"];
    const moodCounts: Record<string, number> = {};
    recent.forEach(l => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1; });
    const total = Math.max(1, Object.values(moodCounts).reduce((a, b) => a + b, 0));

    let moodTrends = moodEmojis
      .map((m, i) => ({ mood: m, pct: Math.round(((moodCounts[m] || 0) / total) * 100), color: moodColors[i] }))
      .filter(m => m.pct > 0)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);

    if (moodTrends.length === 0) {
      moodTrends = [
        { mood: "😊", pct: 40, color: "#EC4899" },
        { mood: "😌", pct: 25, color: "#8B5CF6" },
        { mood: "😴", pct: 20, color: "#F97316" },
        { mood: "😢", pct: 15, color: "#60A5FA" },
      ];
    }

    return { cycleScore, moodScore, hydrationScore, sleepScore, wellnessScore, moodTrends, wellnessLabel, cycleStatus, moodStatus, sleepStatus, avgWaterL };
  }, [prediction, logs, waterLogs, waterGoal, sleepLogs, sleepGoal, stepsLogs, stepsGoal]);

  // Symptom frequency from flow logs
  const symptomData = useMemo(() => {
    const recent30 = logs.filter(l => l.date >= dateStr(30));
    const heavyCount = recent30.filter(l => l.flow === "heavy").length;
    const medHeavyCount = recent30.filter(l => l.flow === "medium" || l.flow === "heavy").length;
    const total = Math.max(1, recent30.length);
    return [
      { label: "Cramps (heavy flow days)", value: heavyCount, max: Math.max(heavyCount, 5), color: "#EC4899", icon: "😣" },
      { label: "Bloating (medium+ flow)", value: medHeavyCount, max: Math.max(medHeavyCount, 8), color: "#8B5CF6", icon: "🤰" },
      { label: "Logged days (30d)", value: recent30.length, max: 30, color: "#F59E0B", icon: "📅" },
      { label: "Period days logged", value: recent30.filter(l => l.flow && l.flow !== "none").length, max: Math.max(1, recent30.filter(l => l.flow && l.flow !== "none").length || 5), color: "#60A5FA", icon: "🩸" },
    ];
  }, [logs]);

  const tips = useMemo(() => [
    { icon: "🧘‍♀️", title: "Try gentle yoga", desc: "Reduces period cramps by 30%", color: "#8B5CF6", bg: "#F5F0FF" },
    {
      icon: "💧", title: "Stay hydrated",
      desc: avgWaterL
        ? `You averaged ${avgWaterL}L/day this week${parseFloat(avgWaterL) >= waterGoal / 1000 ? " — goal met! 🎉" : ` — ${((waterGoal - parseFloat(avgWaterL) * 1000) / 1000).toFixed(1)}L below goal`}`
        : "Aim for 2–3L daily for hormone balance",
      color: "#60A5FA", bg: "#EFF6FF"
    },
    { icon: "🌙", title: "Improve sleep", desc: sleepScore < 70 ? "You're averaging below your sleep goal" : "Sleep score looking good — keep it up!", color: "#EC4899", bg: "#FDF2F8" },
    { icon: "🥗", title: "Iron-rich diet", desc: cycleData.currentDay <= cycleData.periodLength ? "You're in the menstrual phase — eat iron-rich foods" : "Support your cycle with leafy greens & legumes", color: "#34D399", bg: "#ECFDF5" },
  ], [avgWaterL, waterGoal, sleepScore, cycleData]);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FAF5FF 0%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto scrollbar-none pb-4">
          {/* Header */}
          <div className="px-5 pt-2 pb-4">
            <p className="text-gray-400 text-sm">Your health</p>
            <h1 className="text-[24px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Insights ✨
            </h1>
          </div>

          {/* Wellness Score */}
          <div className="mx-5 mb-5 rounded-3xl p-5 shadow-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #C026D3 50%, #EC4899 100%)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-[12px] font-medium">Overall Wellness</p>
                <p className="text-white text-[28px] font-bold leading-none">{wellnessScore}<span className="text-base font-medium">/100</span></p>
                <p className="text-white/60 text-[11px] mt-0.5">{wellnessLabel}</p>
              </div>
              <div className="relative w-20 h-20">
                <svg width="80" height="80" className="absolute inset-0">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
                  <motion.circle
                    cx="40" cy="40" r="36"
                    fill="none" stroke="white" strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 36}
                    initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - wellnessScore / 100) }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xl">🏆</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Cycle", val: cycleStatus, ok: cycleStatus !== "Learning" },
                { label: "Mood", val: moodStatus, ok: moodStatus === "Stable" },
                { label: "Sleep", val: sleepStatus, ok: sleepStatus === "Good" },
              ].map(item => (
                <div key={item.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <span className="text-base">{item.ok ? "✅" : "⚠️"}</span>
                  <p className="text-white/90 text-[11px] font-semibold mt-1">{item.val}</p>
                  <p className="text-white/50 text-[10px]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Report CTA */}
          <div className="px-5 mb-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("health-report")}
              className="w-full rounded-3xl p-5 relative overflow-hidden shadow-md flex items-center gap-4"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #C026D3 50%, #EC4899 100%)" }}
              data-testid="button-generate-health-report"
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/10 -translate-y-4 translate-x-4" />
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0 relative z-10">📋</div>
              <div className="flex-1 text-left relative z-10">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-bold text-[15px]">AI Health Report</p>
                  <span className="bg-yellow-300 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                </div>
                <p className="text-white/70 text-[12px]">Get your personalized PDF report + AI summary</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 relative z-10">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>

          {/* AI Prediction shortcut card */}
          <div className="px-5 mb-5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("prediction")}
              className="w-full rounded-2xl p-4 flex items-center gap-3 shadow-sm"
              style={{ background: "linear-gradient(135deg, #F5F0FF 0%, #FDF2F8 100%)", border: "1.5px solid #DDD6FE" }}
              data-testid="button-ai-prediction-insights"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}>🧠</div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-bold text-gray-900">AI Cycle Predictions</p>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                    style={{ background: prediction.usingAI ? "#8B5CF6" : "#9CA3AF" }}>
                    {prediction.usingAI ? `${prediction.confidence}% confidence` : "Start training"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  {prediction.usingAI
                    ? `${prediction.cycleHistory.length} cycles analyzed · avg ${prediction.averageCycleLength}d`
                    : "Log periods to activate AI predictions"}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M9 18L15 12L9 6" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>

          {/* Mini wellness rings — computed from real data */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">Health Scores</h2>
            <div className="flex justify-between">
              <WellnessRing score={Math.round(cycleScore)} label="Cycle Health" color="#EC4899" />
              <WellnessRing score={moodScore} label="Mood Score" color="#8B5CF6" />
              <WellnessRing score={hydrationScore} label="Hydration" color="#60A5FA" />
              <WellnessRing score={sleepScore} label="Sleep" color="#34D399" />
            </div>
          </div>

          {/* Mood trends from real logs */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-gray-800">Mood This Month</h2>
              <span className="text-xs text-purple-500 font-medium">{logs.filter(l => l.date >= dateStr(30) && l.mood).length} logs</span>
            </div>
            <div className="flex items-end justify-around gap-2 h-16">
              {moodTrends.map(m => <MoodTag key={m.mood} mood={m.mood} pct={m.pct} color={m.color} />)}
            </div>
          </div>

          {/* Symptom frequency from flow logs */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">Cycle Log Summary</h2>
            <div className="space-y-3.5">
              {symptomData.map(s => (
                <TrendBar key={s.label} label={s.label} value={s.value} max={s.max} color={s.color} icon={s.icon} />
              ))}
            </div>
          </div>

          {/* AI Tips — context-aware */}
          <div className="px-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-800">AI Recommendations</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("ai-coach")}
                className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
              >
                Ask AI ✨
              </motion.button>
            </div>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-2xl p-4 shadow-sm"
                  style={{ background: tip.bg }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-white shadow-sm">
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800">{tip.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{tip.desc}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke={tip.color} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              ))}
            </div>
          </div>

          {/* PCOS Risk Banner */}
          <div className="mx-5 mb-5">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("pcos")}
              className="rounded-3xl p-5 relative overflow-hidden shadow-md"
              style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 50%, #6D28D9 100%)" }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -translate-y-4 translate-x-4" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🩺</span>
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">PCOS Module</span>
                  <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto">PREMIUM</span>
                </div>
                <h3 className="text-white text-[17px] font-bold mb-1">Check Your PCOS Risk</h3>
                <p className="text-white/60 text-[12px] leading-relaxed">Track weight, acne, hair fall, sleep & get your weekly PCOS health score.</p>
                <div className="flex items-center gap-1 mt-3 text-purple-300 text-sm font-medium">
                  <span>Unlock now</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Fertility banner */}
          <div className="mx-5 mb-5">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("premium")}
              className="rounded-3xl p-5 relative overflow-hidden shadow-md"
              style={{ background: "linear-gradient(135deg, #0C4A6E 0%, #0284C7 100%)" }}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="text-4xl">🥚</div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-bold text-[15px]">Fertility Mode</span>
                    <span className="bg-pink-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                  </div>
                  <p className="text-white/60 text-[12px]">Ovulation tracking & fertility predictions</p>
                  <div className="flex items-center gap-1 mt-2 text-sky-300 text-sm font-medium">
                    <span>Explore →</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
