import { useState } from "react";
import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const ScoreGauge = ({ score, label }: { score: number; label: string }) => {
  const color = score < 30 ? "#34D399" : score < 60 ? "#F59E0B" : "#EF4444";
  const r = 54;
  const circ = Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 140, height: 80 }}>
        <svg width="140" height="80" viewBox="0 0 140 80">
          <path d="M 14 78 A 56 56 0 0 1 126 78" fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d="M 14 78 A 56 56 0 0 1 126 78"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[28px] font-bold"
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-[11px] text-gray-400 font-medium">/100</span>
        </div>
      </div>
      <div className="flex gap-4 mt-1">
        <span className="text-[11px] text-green-500 font-semibold">Low Risk</span>
        <span className="text-[11px] text-gray-300">|</span>
        <span className="text-[11px] text-yellow-500 font-semibold">Moderate</span>
        <span className="text-[11px] text-gray-300">|</span>
        <span className="text-[11px] text-red-500 font-semibold">High</span>
      </div>
    </div>
  );
};

const TrackerItem = ({ icon, label, value, unit, color, bg }: {
  icon: string; label: string; value: number; unit: string; color: string; bg: string;
}) => {
  const [val, setVal] = useState(value);
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: bg }}>
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-700">{label}</p>
        <p className="text-[11px] text-gray-400">{unit}</p>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setVal(v => Math.max(0, v - 1))}
          className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          <span className="text-gray-600 text-lg leading-none">−</span>
        </motion.button>
        <span className="text-[16px] font-bold w-8 text-center" style={{ color }}>{val}</span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setVal(v => v + 1)}
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: color }}
        >
          <span className="text-white text-lg leading-none">+</span>
        </motion.button>
      </div>
    </div>
  );
};

export const PCOSScreen = () => {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "track" | "tips">("overview");

  const symptoms = [
    { icon: "⚖️", label: "Weight", value: 0, unit: "kg gained this week", color: "#EC4899", bg: "#FDF2F8" },
    { icon: "😕", label: "Acne Severity", value: 3, unit: "scale 0–10", color: "#8B5CF6", bg: "#F5F0FF" },
    { icon: "🌀", label: "Hair Fall", value: 2, unit: "scale 0–10", color: "#F59E0B", bg: "#FFFBEB" },
    { icon: "😴", label: "Sleep Quality", value: 6, unit: "hours last night", color: "#60A5FA", bg: "#EFF6FF" },
    { icon: "🏃‍♀️", label: "Activity Level", value: 4, unit: "scale 0–10", color: "#34D399", bg: "#ECFDF5" },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #1E1B4B 0%, #4C1D95 30%, #FAF5FF 60%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div className="px-5 pt-2 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("insights")}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            <div>
              <h1 className="text-white font-bold text-[20px]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                PCOS Dashboard
              </h1>
              <p className="text-white/50 text-[12px]">Track. Understand. Thrive.</p>
            </div>
            <span className="ml-auto bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2.5 py-1 rounded-full">PREMIUM</span>
          </div>

          {/* Risk gauge */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
            <p className="text-white/70 text-[12px] font-medium mb-3 text-center">Your PCOS Risk Score</p>
            <ScoreGauge score={32} label="PCOS Risk" />
            <p className="text-white/60 text-[11px] text-center mt-3 leading-relaxed">
              🟢 Low risk detected based on your current symptoms and cycle regularity. Keep logging daily for more accurate results.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 mx-5 rounded-2xl p-1 mb-4 flex-shrink-0">
          {(["overview", "track", "tips"] as const).map(tab => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold capitalize"
              animate={{
                background: activeTab === tab ? "white" : "transparent",
                color: activeTab === tab ? "#8B5CF6" : "rgba(255,255,255,0.6)",
              }}
              transition={{ duration: 0.2 }}
            >
              {tab === "overview" ? "Overview" : tab === "track" ? "Log Today" : "AI Tips"}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none pb-4">
          {activeTab === "overview" && (
            <div className="px-5 space-y-3">
              {/* Weekly scores */}
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4">Weekly Health Score</h3>
                <div className="flex items-end justify-between gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                    const scores = [62, 58, 71, 68, 75, 80, 78];
                    const h = (scores[i] / 100) * 80;
                    const color = scores[i] > 70 ? "#34D399" : scores[i] > 55 ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={day} className="flex flex-col items-center gap-1 flex-1">
                        <motion.div
                          className="w-full rounded-t-lg"
                          style={{ height: h, background: color, opacity: 0.85 }}
                          initial={{ height: 0 }}
                          animate={{ height: h }}
                          transition={{ delay: i * 0.07, duration: 0.5 }}
                        />
                        <span className="text-[9px] text-gray-400">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key metrics */}
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-800 mb-3">Key Indicators</h3>
                <div className="space-y-3">
                  {[
                    { label: "Cycle Regularity", val: "Regular ✅", good: true },
                    { label: "Avg Cycle Length", val: "28 days ✅", good: true },
                    { label: "BMI", val: "22.4 (Normal) ✅", good: true },
                    { label: "Acne Pattern", val: "Mild ⚠️", good: false },
                    { label: "Hair Fall Level", val: "Moderate ⚠️", good: false },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-[13px] text-gray-600">{item.label}</span>
                      <span className={`text-[13px] font-semibold ${item.good ? "text-green-500" : "text-yellow-500"}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "track" && (
            <div className="px-5 space-y-3">
              <p className="text-[12px] text-gray-500 font-medium mb-1">Log today's symptoms to update your PCOS score</p>
              {symptoms.map(s => <TrackerItem key={s.label} {...s} />)}
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl text-white font-semibold text-[15px] shadow-lg mt-2"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
              >
                Save Today's Log ✓
              </motion.button>
            </div>
          )}

          {activeTab === "tips" && (
            <div className="px-5 space-y-3">
              {[
                { icon: "🥦", title: "Low-GI Diet", desc: "Reduces insulin resistance common in PCOS. Focus on whole grains, legumes, and vegetables.", color: "#34D399", bg: "#ECFDF5" },
                { icon: "🏋️‍♀️", title: "Strength Training", desc: "30 min 3x/week improves insulin sensitivity and reduces testosterone levels.", color: "#8B5CF6", bg: "#F5F0FF" },
                { icon: "😴", title: "Prioritize Sleep", desc: "Poor sleep worsens PCOS symptoms. Aim for 7–9 hours consistently.", color: "#60A5FA", bg: "#EFF6FF" },
                { icon: "🧘‍♀️", title: "Stress Management", desc: "High cortisol worsens PCOS. Try meditation, yoga, or journaling.", color: "#EC4899", bg: "#FDF2F8" },
                { icon: "💊", title: "Track Supplements", desc: "Inositol, Vitamin D, Magnesium may help. Consult your doctor first.", color: "#F59E0B", bg: "#FFFBEB" },
              ].map((tip, i) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-4 flex gap-3"
                  style={{ background: tip.bg }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">{tip.icon}</div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">{tip.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </motion.div>
              ))}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("ai-coach")}
                className="w-full py-4 rounded-2xl text-white font-semibold text-[15px] shadow-lg mt-2 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
              >
                <span>✨</span> Ask FlowAI Coach
              </motion.button>
            </div>
          )}
        </div>

        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
