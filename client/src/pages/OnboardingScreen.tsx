import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageCircle, Sparkles } from "lucide-react";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";

const slides = [
  {
    id: 1,
    title: "Track Your Cycle,\nUnderstand Your Body",
    subtitle: "Flowly helps you monitor your menstrual health and predict your cycle with precision.",
    emoji: "🌸",
    bg: "linear-gradient(180deg, #FFF0F3 0%, #FFE1E7 100%)",
    illustration: (
      <div className="relative w-full h-[240px] flex items-center justify-center">
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[#FFD6DE] opacity-40" />
        <div className="absolute w-[160px] h-[160px] rounded-full bg-[#FFAFC0] opacity-30" />
        <div className="relative z-10 text-8xl">🌸</div>
        <motion.div
          className="absolute top-8 right-12 text-3xl"
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >💧</motion.div>
        <motion.div
          className="absolute bottom-10 left-10 text-2xl"
          animate={{ y: [5, -5, 5] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
        >⭐</motion.div>
        <motion.div
          className="absolute top-12 left-16 text-xl"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >🌺</motion.div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Stay Ahead of\nYour Period",
    subtitle: "Get accurate predictions and reminders so you're never caught off guard again.",
    emoji: "📅",
    bg: "linear-gradient(180deg, #F0F4FF 0%, #E1E9FF 100%)",
    illustration: (
      <div className="relative w-full h-[240px] flex items-center justify-center">
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[#C8D8FF] opacity-40" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="text-7xl">📅</div>
          <div className="flex gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${i === 2 ? "bg-[#FF657D] text-white" : "bg-white text-gray-600"}`}
              >
                {d}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Log Your Mood &\nSymptoms Daily",
    subtitle: "Track how you feel throughout your cycle and discover patterns in your wellbeing.",
    emoji: "😊",
    bg: "linear-gradient(180deg, #FFF5E0 0%, #FFE9C0 100%)",
    illustration: (
      <div className="relative w-full h-[240px] flex items-center justify-center">
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[#FFD98E] opacity-30" />
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {["😊", "😴", "😰", "😄", "😢", "😌"].map((emoji, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Meet Your AI\nCycle Coach",
    subtitle: "Ask FlowAI questions, get cycle-aware guidance, and understand your body with AI-powered insights.",
    emoji: "AI",
    bg: "linear-gradient(180deg, #F8F0FF 0%, #FFEAF3 100%)",
    illustration: (
      <div className="relative w-full h-[240px] flex items-center justify-center">
        <div className="absolute w-[210px] h-[210px] rounded-full bg-[#E9D5FF] opacity-50" />
        <div className="absolute w-[150px] h-[150px] rounded-full bg-[#FBCFE8] opacity-40" />
        <motion.div
          className="relative z-10 w-[178px] rounded-[28px] bg-white shadow-xl border border-white/70 px-4 py-4"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#F5F0FF]">
              <Brain size={26} color="#8B5CF6" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">AI Coach</p>
              <p className="text-[11px] text-[#FF657D] font-semibold">Cycle aware</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-[118px] h-7 rounded-2xl bg-[#F5F0FF] ml-auto" />
            <div className="w-[138px] h-8 rounded-2xl bg-[#FFE1E7]" />
            <div className="w-[96px] h-7 rounded-2xl bg-[#F5F0FF] ml-auto" />
          </div>
        </motion.div>
        <motion.div
          className="absolute top-12 right-12 w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center"
          animate={{ y: [-4, 5, -4] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Sparkles size={22} color="#EC4899" />
        </motion.div>
        <motion.div
          className="absolute bottom-12 left-12 w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center"
          animate={{ y: [5, -4, 5] }}
          transition={{ repeat: Infinity, duration: 2.8 }}
        >
          <MessageCircle size={22} color="#8B5CF6" />
        </motion.div>
      </div>
    ),
  },
];

export const OnboardingScreen = () => {
  const { navigate } = useApp();
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("auth-signup");
    }
  };

  const skip = () => navigate("auth-signup");

  return (
    <MobileLayout gradient={slides[current].bg}>
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex justify-end pt-2">
          {current < slides.length - 1 && (
            <motion.button
              onClick={skip}
              className="text-sm text-gray-400 font-medium px-2 py-1"
              whileTap={{ scale: 0.95 }}
            >
              Skip
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div className="w-full">{slides[current].illustration}</div>
          </motion.div>
        </AnimatePresence>

        <div className="pb-8">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === current ? 24 : 8 }}
                className={`h-2 rounded-full ${i === current ? "bg-[#FF657D]" : "bg-[#FFB8C1]"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-3 whitespace-pre-line" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                {slides[current].title}
              </h1>
              <p className="text-[14px] text-gray-500 leading-relaxed px-4">
                {slides[current].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.button
            onClick={next}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            {current < slides.length - 1 ? "Continue" : "Get Started"}
          </motion.button>

          {current < slides.length - 1 && (
            <button onClick={skip} className="w-full py-3 text-center text-gray-400 text-sm font-medium mt-2">
              Already have an account? Sign In
            </button>
          )}
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
