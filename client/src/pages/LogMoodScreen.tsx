import { useState } from "react";
import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";

const moods = [
  { emoji: "😊", label: "Happy", color: "#F59E0B", bg: "#FFFBEB" },
  { emoji: "😴", label: "Tired", color: "#8B5CF6", bg: "#F5F3FF" },
  { emoji: "😰", label: "Anxious", color: "#60A5FA", bg: "#EFF6FF" },
  { emoji: "😄", label: "Excited", color: "#FF657D", bg: "#FFF0F3" },
  { emoji: "😢", label: "Sad", color: "#6B7280", bg: "#F9FAFB" },
  { emoji: "😌", label: "Calm", color: "#34D399", bg: "#ECFDF5" },
  { emoji: "😤", label: "Irritated", color: "#EF4444", bg: "#FEF2F2" },
  { emoji: "🤗", label: "Loved", color: "#EC4899", bg: "#FDF2F8" },
  { emoji: "😎", label: "Confident", color: "#F97316", bg: "#FFF7ED" },
  { emoji: "🥱", label: "Bored", color: "#9CA3AF", bg: "#F3F4F6" },
  { emoji: "🤩", label: "Energetic", color: "#EAB308", bg: "#FEFCE8" },
  { emoji: "🥺", label: "Emotional", color: "#A78BFA", bg: "#F5F0FF" },
];

export const LogMoodScreen = () => {
  const { navigate, addLog, selectedDate } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const selectedMood = moods.find(m => m.emoji === selected);

  return (
    <MobileLayout gradient={selected && selectedMood ? `linear-gradient(180deg, ${selectedMood.bg} 0%, ${selectedMood.bg}80 100%)` : "linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)"}>
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)]">
        <div className="px-5 pt-3 pb-4 flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("log-entry")}
            className="w-9 h-9 rounded-full bg-white/80 shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>How are you feeling?</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { if (selected) { addLog({ date: selectedDate.toISOString().split("T")[0], mood: selected, notes }); navigate("log-entry"); } }}
            className={`px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity ${selected ? "opacity-100" : "opacity-40"}`}
            style={{ background: selectedMood ? selectedMood.color : "#FF657D" }}
          >
            Save
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {/* Selected mood display */}
          {selected && selectedMood ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-4 mb-4"
            >
              <motion.div
                layoutId={selected}
                className="text-7xl mb-2"
              >
                {selected}
              </motion.div>
              <p className="text-[18px] font-bold mb-1" style={{ color: selectedMood.color }}>{selectedMood.label}</p>
              <p className="text-xs text-gray-400">Tap another mood to change</p>
            </motion.div>
          ) : (
            <div className="py-4 text-center text-gray-400 text-sm mb-4">
              Select a mood that describes how you feel today
            </div>
          )}

          {/* Mood grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {moods.map((mood, i) => (
              <motion.button
                key={mood.emoji}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring" }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setSelected(mood.emoji)}
                className="flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all border-2"
                style={{
                  background: selected === mood.emoji ? mood.bg : "white",
                  borderColor: selected === mood.emoji ? mood.color : "transparent",
                  boxShadow: selected === mood.emoji ? `0 0 0 2px ${mood.color}` : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <motion.span
                  className="text-3xl"
                  animate={{ scale: selected === mood.emoji ? 1.2 : 1 }}
                >
                  {mood.emoji}
                </motion.span>
                <span className="text-[10px] font-medium" style={{ color: selected === mood.emoji ? mood.color : "#6B7280" }}>
                  {mood.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Energy level */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-800 mb-3">Energy Level</h3>
            <div className="flex gap-2">
              {["Very Low", "Low", "Medium", "High", "Very High"].map((level, i) => (
                <motion.button
                  key={level}
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 py-2 rounded-xl text-[10px] font-semibold border-2 transition-all"
                  style={{
                    background: i === 2 ? "#FFF0F3" : "#F9FAFB",
                    borderColor: i === 2 ? "#FF657D" : "transparent",
                    color: i === 2 ? "#FF657D" : "#9CA3AF",
                  }}
                >
                  {level.split(" ").map(w => w[0]).join("")}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-800 mb-2">Add Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full h-20 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none"
            />
          </div>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
