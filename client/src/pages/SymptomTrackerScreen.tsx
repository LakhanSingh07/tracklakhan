import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import { ChevronLeft } from "lucide-react";

type Category = "physical" | "emotional" | "lifestyle";

const physicalSymptoms = [
  { id: "cramps", label: "Cramps", icon: "🤕", color: "#FF657D" },
  { id: "bloating", label: "Bloating", icon: "🫧", color: "#FB923C" },
  { id: "headache", label: "Headache", icon: "🤯", color: "#8B5CF6" },
  { id: "acne", label: "Acne", icon: "🔴", color: "#EF4444" },
  { id: "back-pain", label: "Back pain", icon: "🦴", color: "#F59E0B" },
  { id: "breast-tender", label: "Breast tenderness", icon: "💗", color: "#EC4899" },
  { id: "fatigue", label: "Fatigue", icon: "😴", color: "#60A5FA" },
  { id: "nausea", label: "Nausea", icon: "🤢", color: "#34D399" },
  { id: "spotting", label: "Spotting", icon: "🩸", color: "#FF657D" },
  { id: "hot-flashes", label: "Hot flashes", icon: "🌡️", color: "#F87171" },
  { id: "dizziness", label: "Dizziness", icon: "💫", color: "#A78BFA" },
  { id: "insomnia", label: "Insomnia", icon: "🌙", color: "#6366F1" },
];

const emotionalSymptoms = [
  { id: "happy", label: "Happy", icon: "😊", color: "#FBBF24" },
  { id: "calm", label: "Calm", icon: "😌", color: "#34D399" },
  { id: "sad", label: "Sad", icon: "😢", color: "#60A5FA" },
  { id: "irritated", label: "Irritated", icon: "😤", color: "#EF4444" },
  { id: "stressed", label: "Stressed", icon: "😰", color: "#F59E0B" },
  { id: "anxious", label: "Anxious", icon: "😟", color: "#8B5CF6" },
  { id: "energetic", label: "Energetic", icon: "⚡", color: "#EC4899" },
  { id: "motivated", label: "Motivated", icon: "🔥", color: "#FB923C" },
  { id: "overwhelmed", label: "Overwhelmed", icon: "🌀", color: "#7C3AED" },
  { id: "hopeful", label: "Hopeful", icon: "🌈", color: "#10B981" },
  { id: "moody", label: "Mood swings", icon: "🎭", color: "#F472B6" },
  { id: "lonely", label: "Lonely", icon: "💔", color: "#94A3B8" },
];

const lifestyleData = {
  sleepOptions: [
    { value: 1, label: "Very poor", icon: "😫" },
    { value: 2, label: "Poor", icon: "😞" },
    { value: 3, label: "Okay", icon: "😐" },
    { value: 4, label: "Good", icon: "😊" },
    { value: 5, label: "Excellent", icon: "😄" },
  ],
  exerciseOptions: [
    { id: "none", label: "None", icon: "🛋️" },
    { id: "walk", label: "Walk", icon: "🚶‍♀️" },
    { id: "yoga", label: "Yoga", icon: "🧘‍♀️" },
    { id: "light", label: "Light", icon: "🤸‍♀️" },
    { id: "moderate", label: "Moderate", icon: "🏃‍♀️" },
    { id: "intense", label: "Intense", icon: "💪" },
  ],
  stressLevels: [
    { value: 1, label: "Very low", color: "#34D399" },
    { value: 2, label: "Low", color: "#86EFAC" },
    { value: 3, label: "Moderate", color: "#FBBF24" },
    { value: 4, label: "High", color: "#FB923C" },
    { value: 5, label: "Very high", color: "#EF4444" },
  ],
};

const categoryConfig: Record<Category, { label: string; emoji: string; color: string; bg: string }> = {
  physical: { label: "Physical", emoji: "🫀", color: "#FF657D", bg: "#FFF0F3" },
  emotional: { label: "Emotional", emoji: "🧠", color: "#8B5CF6", bg: "#F5F0FF" },
  lifestyle: { label: "Lifestyle", emoji: "🌿", color: "#34D399", bg: "#ECFDF5" },
};

export const SymptomTrackerScreen = () => {
  const { navigate, addLog, selectedDate } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category>("physical");
  const [selectedPhysical, setSelectedPhysical] = useState<string[]>([]);
  const [selectedEmotional, setSelectedEmotional] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [exercise, setExercise] = useState("none");
  const [stressLevel, setStressLevel] = useState(2);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [saved, setSaved] = useState(false);

  const togglePhysical = (id: string) =>
    setSelectedPhysical((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleEmotional = (id: string) =>
    setSelectedEmotional((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const totalSelected = selectedPhysical.length + selectedEmotional.length;

  const handleSave = () => {
    addLog({
      date: selectedDate.toISOString().split("T")[0],
      mood: selectedEmotional[0] === "happy" ? "😊" : selectedEmotional[0] === "sad" ? "😢" : "😌",
      notes: `Physical: ${selectedPhysical.join(", ")} | Emotional: ${selectedEmotional.join(", ")} | Sleep: ${sleepQuality}/5 | Exercise: ${exercise} | Stress: ${stressLevel}/5 | Water: ${waterGlasses} glasses`,
      symptoms: [...selectedPhysical, ...selectedEmotional],
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate("home"); }, 1200);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F5FF 0%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("log-entry")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ChevronLeft size={20} className="text-gray-700" strokeWidth={2.2} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Symptom Tracker
            </h1>
            <p className="text-[11px] text-gray-400">
              {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          {totalSelected > 0 && (
            <div className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#FF657D" }}>
              {totalSelected} logged
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex px-5 gap-2 mb-4">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const count = cat === "physical" ? selectedPhysical.length : cat === "emotional" ? selectedEmotional.length : 0;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveCategory(cat)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all relative"
                style={
                  activeCategory === cat
                    ? { background: cfg.color, color: "white", boxShadow: `0 4px 12px ${cfg.color}40` }
                    : { background: "white", color: "#6B7280" }
                }
              >
                <span className="text-base">{cfg.emoji}</span>
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: activeCategory === cat ? "white" : cfg.color, color: activeCategory === cat ? cfg.color : "white" }}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <AnimatePresence mode="wait">
            {activeCategory === "physical" && (
              <motion.div
                key="physical"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[12px] text-gray-400 mb-3 font-medium">Select all that apply today</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {physicalSymptoms.map((s) => {
                    const sel = selectedPhysical.includes(s.id);
                    return (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => togglePhysical(s.id)}
                        data-testid={`symptom-physical-${s.id}`}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor: sel ? s.color : "transparent",
                          background: sel ? s.color + "18" : "white",
                        }}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        <span
                          className="text-[10px] font-semibold text-center leading-tight"
                          style={{ color: sel ? s.color : "#6B7280" }}
                        >
                          {s.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedPhysical.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-[#FFF0F3] border border-[#FFD6E0]"
                  >
                    <p className="text-xs text-[#FF657D] font-medium">
                      💡 <strong>{selectedPhysical.length} symptom{selectedPhysical.length > 1 ? "s" : ""}</strong> logged. FlowAI will use this to improve your predictions.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeCategory === "emotional" && (
              <motion.div
                key="emotional"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[12px] text-gray-400 mb-3 font-medium">How are you feeling emotionally?</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {emotionalSymptoms.map((s) => {
                    const sel = selectedEmotional.includes(s.id);
                    return (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleEmotional(s.id)}
                        data-testid={`symptom-emotional-${s.id}`}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor: sel ? s.color : "transparent",
                          background: sel ? s.color + "18" : "white",
                        }}
                      >
                        <span className="text-2xl">{s.icon}</span>
                        <span
                          className="text-[10px] font-semibold text-center leading-tight"
                          style={{ color: sel ? s.color : "#6B7280" }}
                        >
                          {s.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedEmotional.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-xl bg-[#F5F0FF] border border-[#DDD6FE]"
                  >
                    <p className="text-xs text-[#8B5CF6] font-medium">
                      🧠 Emotional patterns are tracked over your cycle to identify mood trends.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeCategory === "lifestyle" && (
              <motion.div
                key="lifestyle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Sleep Quality */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">😴 Sleep Quality</h3>
                    <span className="text-[12px] font-semibold text-[#60A5FA]">
                      {lifestyleData.sleepOptions[sleepQuality - 1]?.icon} {lifestyleData.sleepOptions[sleepQuality - 1]?.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {lifestyleData.sleepOptions.map((opt) => (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSleepQuality(opt.value)}
                        data-testid={`sleep-${opt.value}`}
                        className="flex-1 py-3 rounded-xl text-xl transition-all"
                        style={{
                          background: sleepQuality === opt.value ? "#EFF6FF" : "#F9FAFB",
                          border: sleepQuality === opt.value ? "2px solid #60A5FA" : "2px solid transparent",
                        }}
                      >
                        {opt.icon}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Exercise */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[14px] font-bold text-gray-800 mb-3">🏃‍♀️ Exercise Today</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {lifestyleData.exerciseOptions.map((opt) => (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setExercise(opt.id)}
                        data-testid={`exercise-${opt.id}`}
                        className="py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all"
                        style={{
                          background: exercise === opt.id ? "#ECFDF5" : "#F9FAFB",
                          border: exercise === opt.id ? "2px solid #34D399" : "2px solid transparent",
                        }}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: exercise === opt.id ? "#34D399" : "#6B7280" }}
                        >
                          {opt.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Stress Level */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-bold text-gray-800">😤 Stress Level</h3>
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: lifestyleData.stressLevels[stressLevel - 1]?.color }}
                    >
                      {lifestyleData.stressLevels[stressLevel - 1]?.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {lifestyleData.stressLevels.map((s) => (
                      <motion.button
                        key={s.value}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStressLevel(s.value)}
                        data-testid={`stress-${s.value}`}
                        className="flex-1 h-9 rounded-xl transition-all"
                        style={{
                          background: stressLevel === s.value ? s.color : s.color + "30",
                          border: stressLevel === s.value ? `2px solid ${s.color}` : "2px solid transparent",
                        }}
                      >
                        <span className="text-[11px] font-bold text-white drop-shadow">{s.value}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Water intake */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-bold text-gray-800">💧 Water Intake</h3>
                    <span className="text-[12px] font-semibold text-[#34D399]">{waterGlasses} glasses ({(waterGlasses * 250 / 1000).toFixed(1)}L)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setWaterGlasses((w) => Math.max(0, w - 1))}
                      className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 text-xl font-bold flex items-center justify-center"
                    >
                      −
                    </motion.button>
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => setWaterGlasses(i + 1)}
                          className="flex-1 h-8 rounded-lg transition-all"
                          style={{ background: i < waterGlasses ? "#34D399" : "#E5E7EB" }}
                        />
                      ))}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => setWaterGlasses((w) => Math.min(8, w + 1))}
                      className="w-10 h-10 rounded-full bg-green-50 text-green-500 text-xl font-bold flex items-center justify-center"
                    >
                      +
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save button */}
        <div className="px-5 pb-6 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-md"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            data-testid="button-save-symptoms"
          >
            Save Today's Log
          </motion.button>
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
                    <path d="M2 12L12 22L30 2" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[18px] font-bold text-gray-900">Symptoms Saved!</p>
                <p className="text-[12px] text-gray-400 mt-1 text-center">FlowAI is learning from your data</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
