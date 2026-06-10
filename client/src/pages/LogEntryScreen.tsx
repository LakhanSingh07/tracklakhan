import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";

const FlowOption = ({ level, selected, onSelect }: { level: string; selected: boolean; onSelect: () => void }) => {
  const configs = {
    none: { icon: "○", color: "#9CA3AF", bg: "#F9FAFB", label: "None" },
    light: { icon: "●", color: "#FCA5A5", bg: "#FEF2F2", label: "Light" },
    medium: { icon: "●●", color: "#FF657D", bg: "#FFF0F3", label: "Medium" },
    heavy: { icon: "●●●", color: "#DC2626", bg: "#FEE2E2", label: "Heavy" },
  }[level] || { icon: "○", color: "#9CA3AF", bg: "#F9FAFB", label: level };

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onSelect}
      className="flex flex-col items-center gap-2 px-3 py-3 rounded-2xl border-2 transition-all"
      style={{
        borderColor: selected ? configs.color : "transparent",
        background: selected ? configs.bg : "#F9FAFB",
      }}
    >
      <span className="text-lg" style={{ color: configs.color }}>{configs.icon}</span>
      <span className="text-[11px] font-medium text-gray-600">{configs.label}</span>
    </motion.button>
  );
};

const MoodOption = ({ emoji, label, selected, onSelect }: { emoji: string; label: string; selected: boolean; onSelect: () => void }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onSelect}
    className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all"
    style={{ background: selected ? "#FFF0F3" : "#F9FAFB", border: selected ? "2px solid #FF657D" : "2px solid transparent" }}
  >
    <span className="text-2xl">{emoji}</span>
    <span className="text-[10px] font-medium text-gray-500">{label}</span>
  </motion.button>
);

export const LogEntryScreen = () => {
  const { navigate, addLog, selectedDate } = useApp();
  const [flow, setFlow] = useState("medium");
  const [mood, setMood] = useState("😊");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😄", label: "Excited" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😤", label: "Irritated" },
    { emoji: "🤗", label: "Loved" },
  ];

  const symptoms = ["Cramps", "Bloating", "Headache", "Backache", "Fatigue", "Nausea", "Tender breasts", "Mood swings"];
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleSave = () => {
    addLog({
      date: selectedDate.toISOString().split("T")[0],
      flow: flow as any,
      mood,
      notes,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("home"); }, 1200);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex items-center justify-between px-5 py-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("home")} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[17px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Add Log</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
          >
            Save
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Date */}
          <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400">Logging for</p>
              <p className="text-[15px] font-bold text-gray-900">
                {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
              </p>
            </div>
            <button onClick={() => navigate("calendar")} className="text-[#FF657D] text-sm font-medium">Change</button>
          </div>

          {/* Flow */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-800 mb-3">Period Flow</h3>
            <div className="grid grid-cols-4 gap-2">
              {["none", "light", "medium", "heavy"].map(f => (
                <FlowOption key={f} level={f} selected={flow === f} onSelect={() => setFlow(f)} />
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-800 mb-3">How are you feeling?</h3>
            <div className="grid grid-cols-4 gap-2">
              {moods.map(m => (
                <MoodOption key={m.emoji} emoji={m.emoji} label={m.label} selected={mood === m.emoji} onSelect={() => setMood(m.emoji)} />
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-gray-800">Quick Symptoms</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("symptom-tracker")}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
                data-testid="button-detailed-symptoms"
              >
                Detailed →
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    borderColor: selectedSymptoms.includes(s) ? "#FF657D" : "#E5E7EB",
                    background: selectedSymptoms.includes(s) ? "#FFF0F3" : "white",
                    color: selectedSymptoms.includes(s) ? "#FF657D" : "#6B7280",
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("symptom-tracker")}
              className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-[#FFD6E0] text-[12px] text-[#FF657D] font-medium flex items-center justify-center gap-2"
              data-testid="button-full-symptom-tracker"
            >
              <span>🩺</span>
              Open full symptom tracker (Physical · Emotional · Lifestyle)
            </motion.button>
          </div>

          {/* Quick log shortcuts */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Weight", icon: "⚖️", screen: "log-weight" as const, color: "#60A5FA" },
              { label: "Temperature", icon: "🌡️", screen: "log-temperature" as const, color: "#F59E0B" },
              { label: "Water", icon: "💧", screen: "log-water" as const, color: "#34D399" },
            ].map(item => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate(item.screen)}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm border border-gray-50"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-semibold" style={{ color: item.color }}>{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-800 mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              className="w-full h-20 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Success overlay */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl mx-10"
              >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                    <path d="M2 12L12 22L30 2" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[18px] font-bold text-gray-900">Log Saved!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};

export const LogWeightScreen = () => {
  const { navigate, addLog, selectedDate } = useApp();
  const [weight, setWeight] = useState(58.0);
  const bmi = (weight / (1.65 * 1.65)).toFixed(1);
  const bmiCategory = Number(bmi) < 18.5 ? "Underweight" : Number(bmi) < 25 ? "Normal" : Number(bmi) < 30 ? "Overweight" : "Obese";
  const bmiColor = Number(bmi) < 18.5 ? "#60A5FA" : Number(bmi) < 25 ? "#34D399" : Number(bmi) < 30 ? "#F59E0B" : "#EF4444";

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #EFF6FF 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 py-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("log-entry")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Weight Tracker</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm flex flex-col items-center">
          <div className="text-6xl mb-2">⚖️</div>
          <div className="flex items-end gap-2 mb-2">
            <motion.span
              key={weight}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-[56px] font-bold text-[#60A5FA]"
              style={{ fontFamily: "Instrument Sans, sans-serif" }}
            >
              {weight.toFixed(1)}
            </motion.span>
            <span className="text-[20px] text-gray-400 mb-3">kg</span>
          </div>
          <div className="flex gap-3 mb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeight(w => Math.max(30, +(w - 0.1).toFixed(1)))}
              className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 text-2xl font-bold flex items-center justify-center">−</motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setWeight(w => +(w + 0.1).toFixed(1))}
              className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 text-2xl font-bold flex items-center justify-center">+</motion.button>
          </div>

          <div className="w-full h-px bg-gray-100 mb-4" />

          <div className="w-full">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">BMI</span>
              <span className="text-sm font-bold" style={{ color: bmiColor }}>{bmi} — {bmiCategory}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-300 via-green-400 via-yellow-400 to-red-500 relative mb-3">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md"
                style={{ borderColor: bmiColor, left: `${Math.min(90, Math.max(5, (Number(bmi) - 15) * 5))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { addLog({ date: selectedDate.toISOString().split("T")[0], weight }); navigate("log-entry"); }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
          style={{ background: "linear-gradient(135deg, #93C5FD, #60A5FA)" }}
        >
          Save Weight
        </motion.button>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const LogTemperatureScreen = () => {
  const { navigate, addLog, selectedDate } = useApp();
  const [temp, setTemp] = useState(36.5);

  const getStatus = (t: number) => {
    if (t < 36) return { label: "Low", color: "#60A5FA" };
    if (t < 37.5) return { label: "Normal", color: "#34D399" };
    if (t < 38) return { label: "Elevated", color: "#F59E0B" };
    return { label: "Fever", color: "#EF4444" };
  };
  const status = getStatus(temp);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFFBEB 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 py-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("log-entry")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Body Temperature</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm flex flex-col items-center">
          <div className="text-5xl mb-3">🌡️</div>
          <motion.div
            key={temp}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-[64px] font-bold mb-1"
            style={{ color: status.color, fontFamily: "Instrument Sans, sans-serif" }}
          >
            {temp.toFixed(1)}°
          </motion.div>
          <div className="px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: `${status.color}22`, color: status.color }}>
            {status.label}
          </div>

          <div className="flex gap-4 mb-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTemp(t => Math.max(35, +(t - 0.1).toFixed(1)))}
              className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 text-3xl font-bold flex items-center justify-center shadow-sm">−</motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTemp(t => Math.min(42, +(t + 0.1).toFixed(1)))}
              className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 text-3xl font-bold flex items-center justify-center shadow-sm">+</motion.button>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>35°C</span><span>36°C</span><span>37.5°C</span><span>38°C</span><span>42°C</span>
            </div>
            <div className="relative w-full h-3 rounded-full bg-gradient-to-r from-blue-300 via-green-400 via-yellow-400 to-red-500">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-md"
                style={{ borderColor: status.color, left: `${Math.min(93, Math.max(3, (temp - 35) / 7 * 100))}%` }}
                animate={{ left: `${Math.min(93, Math.max(3, (temp - 35) / 7 * 100))}%` }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { addLog({ date: selectedDate.toISOString().split("T")[0], temperature: temp }); navigate("log-entry"); }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
          style={{ background: "linear-gradient(135deg, #FCD34D, #F59E0B)" }}
        >
          Save Temperature
        </motion.button>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const LogWaterScreen = () => {
  const { navigate, todayWater, setTodayWater, waterGoal } = useApp();
  const goal = waterGoal;
  const cups = [200, 250, 300, 350, 500];
  const [selectedCup, setSelectedCup] = useState(250);

  const addWater = (ml: number) => setTodayWater(Math.min(goal * 1.5, todayWater + ml));
  const removeWater = (ml: number) => setTodayWater(Math.max(0, todayWater - ml));

  const progress = Math.min(1, todayWater / goal);
  const filledBars = Math.round(progress * 10);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F0FFFE 0%, #ECFDF5 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 py-3 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("log-entry")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Water Tracker</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm flex flex-col items-center">
          <div className="text-4xl mb-3">💧</div>
          <motion.div
            key={todayWater}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-[56px] font-bold text-[#34D399] mb-1"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            {todayWater}<span className="text-xl text-gray-400 ml-1">ml</span>
          </motion.div>
          <p className="text-sm text-gray-400 mb-4">Goal: {goal}ml</p>

          {/* Water bar visualization */}
          <div className="flex gap-1.5 mb-4 w-full justify-center">
            {Array.from({ length: 10 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.04, type: "spring" }}
                className="flex-1 rounded-full overflow-hidden"
                style={{ height: 40, background: "#E5E7EB", transformOrigin: "bottom" }}
              >
                <motion.div
                  className="w-full rounded-full"
                  style={{
                    height: i < filledBars ? "100%" : "0%",
                    background: i < filledBars ? "linear-gradient(180deg, #6EE7B7, #34D399)" : "transparent",
                    transformOrigin: "bottom",
                  }}
                  animate={{ height: i < filledBars ? "100%" : "0%" }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                />
              </motion.div>
            ))}
          </div>

          <div className="w-full">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Select Cup Size</span>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {cups.map(c => (
                <motion.button
                  key={c}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCup(c)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: selectedCup === c ? "#34D399" : "transparent",
                    background: selectedCup === c ? "#ECFDF5" : "#F9FAFB",
                  }}
                >
                  <span className="text-lg">🥤</span>
                  <span className="text-[11px] font-medium text-gray-600">{c}ml</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => removeWater(selectedCup)}
            className="flex-1 py-4 rounded-2xl border-2 border-[#34D399] text-[#34D399] font-semibold text-[16px]">
            − Remove
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => addWater(selectedCup)}
            className="flex-1 py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
            style={{ background: "linear-gradient(135deg, #6EE7B7, #34D399)" }}>
            + Add {selectedCup}ml
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("log-entry")}
          className="w-full py-3 text-gray-400 text-sm font-medium"
        >
          Done
        </motion.button>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
