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

export const InsightsScreen = () => {
  const { navigate, cycleData, logs } = useApp();
  const prediction = useMemo(
    () => computeCyclePrediction(logs, cycleData.cycleLength, cycleData.periodLength, cycleData.lastPeriodStart),
    [logs, cycleData]
  );

  const tips = [
    { icon: "🧘‍♀️", title: "Try gentle yoga", desc: "Reduces period cramps by 30%", color: "#8B5CF6", bg: "#F5F0FF" },
    { icon: "💧", title: "Drink more water", desc: "You averaged only 1.2L this week", color: "#60A5FA", bg: "#EFF6FF" },
    { icon: "🌙", title: "Improve sleep", desc: "Aim for 7–8 hrs to balance hormones", color: "#EC4899", bg: "#FDF2F8" },
    { icon: "🥗", title: "Iron-rich diet", desc: "You're in the menstrual phase", color: "#34D399", bg: "#ECFDF5" },
  ];

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
                <p className="text-white text-[28px] font-bold leading-none">78<span className="text-base font-medium">/100</span></p>
                <p className="text-white/60 text-[11px] mt-0.5">Good — keep it up! 🌸</p>
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
                    animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - 0.78) }}
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
                { label: "Cycle", val: "Regular", ok: true },
                { label: "Mood", val: "Stable", ok: true },
                { label: "Sleep", val: "Low", ok: false },
              ].map(item => (
                <div key={item.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <span className="text-base">{item.ok ? "✅" : "⚠️"}</span>
                  <p className="text-white/90 text-[11px] font-semibold mt-1">{item.val}</p>
                  <p className="text-white/50 text-[10px]">{item.label}</p>
                </div>
              ))}
            </div>
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
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
              >
                🧠
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-bold text-gray-900">AI Cycle Predictions</p>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                    style={{ background: prediction.usingAI ? "#8B5CF6" : "#9CA3AF" }}
                  >
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

          {/* Mini wellness rings */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">Health Scores</h2>
            <div className="flex justify-between">
              <WellnessRing score={85} label="Cycle Health" color="#EC4899" />
              <WellnessRing score={70} label="Mood Score" color="#8B5CF6" />
              <WellnessRing score={60} label="Hydration" color="#60A5FA" />
              <WellnessRing score={72} label="Sleep" color="#34D399" />
            </div>
          </div>

          {/* Mood trends */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-gray-800">Mood This Month</h2>
              <span className="text-xs text-purple-500 font-medium">View all →</span>
            </div>
            <div className="flex items-end justify-around gap-2 h-16">
              <MoodTag mood="😊" pct={42} color="#EC4899" />
              <MoodTag mood="😌" pct={28} color="#8B5CF6" />
              <MoodTag mood="😤" pct={12} color="#F59E0B" />
              <MoodTag mood="😢" pct={8} color="#60A5FA" />
              <MoodTag mood="😰" pct={6} color="#34D399" />
              <MoodTag mood="⚡" pct={4} color="#F97316" />
            </div>
          </div>

          {/* Symptom tracking */}
          <div className="mx-5 mb-5 bg-white rounded-3xl p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-800 mb-4">Symptom Frequency</h2>
            <div className="space-y-3.5">
              <TrendBar label="Cramps" value={8} max={10} color="#EC4899" icon="😣" />
              <TrendBar label="Bloating" value={6} max={10} color="#8B5CF6" icon="🤰" />
              <TrendBar label="Fatigue" value={7} max={10} color="#F59E0B" icon="😴" />
              <TrendBar label="Headache" value={3} max={10} color="#60A5FA" icon="🤕" />
              <TrendBar label="Acne" value={4} max={10} color="#34D399" icon="😕" />
            </div>
          </div>

          {/* AI Tips */}
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
