import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp, Screen } from "@/lib/appContext";

interface PhaseConfig {
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  icon: string;
  days: string;
  sections: { icon: string; title: string; description: string }[];
}

const phases: Record<string, PhaseConfig> = {
  period: {
    title: "Menstrual Phase",
    subtitle: "Your period has arrived. Focus on rest and gentle self-care.",
    color: "#FF657D",
    bg: "linear-gradient(180deg, #FFF0F3 0%, #FFE7EA 100%)",
    icon: "🩸",
    days: "Day 1–5",
    sections: [
      { icon: "🛋️", title: "Rest & Recovery", description: "Your body is working hard. Prioritize sleep and relaxation. Avoid high-intensity exercise and opt for gentle yoga or walking instead." },
      { icon: "🍫", title: "Nutrition Tips", description: "Cravings for iron-rich foods are natural. Eat leafy greens, legumes, and dark chocolate (in moderation!). Stay hydrated to reduce cramps." },
      { icon: "💊", title: "Symptom Relief", description: "Apply a heat pad to your lower abdomen to ease cramps. Consider magnesium supplements which can reduce menstrual pain naturally." },
      { icon: "🧘‍♀️", title: "Mind & Body", description: "Emotional sensitivity is heightened. Journal your thoughts, practice breathing exercises, and be gentle with yourself mentally." },
    ],
  },
  growth: {
    title: "Follicular Phase",
    subtitle: "Your energy is building. A great time to start new projects.",
    color: "#60A5FA",
    bg: "linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)",
    icon: "🌱",
    days: "Day 6–13",
    sections: [
      { icon: "⚡", title: "Rising Energy", description: "Estrogen levels are climbing, bringing renewed energy and optimism. Take advantage of this by tackling challenging tasks and projects." },
      { icon: "🏋️‍♀️", title: "Exercise", description: "This is the best time for high-intensity workouts. Your body can handle strength training, cardio, and challenging physical activity." },
      { icon: "🧠", title: "Mental Clarity", description: "Cognitive function is at its peak. Use this phase for creative thinking, learning new skills, and important decision-making." },
      { icon: "🥗", title: "Diet Focus", description: "Focus on lean proteins and healthy fats to support follicle development. Include fermented foods for gut health." },
    ],
  },
  release: {
    title: "Ovulation Phase",
    subtitle: "Peak fertility window. You're at your most vibrant.",
    color: "#A78BFA",
    bg: "linear-gradient(180deg, #F5F0FF 0%, #EDE9FE 100%)",
    icon: "⭐",
    days: "Day 14",
    sections: [
      { icon: "🌟", title: "Peak Vitality", description: "Testosterone surges alongside estrogen, making you feel confident and energetic. Social interactions feel natural and rewarding." },
      { icon: "❤️", title: "Fertility Window", description: "This is your most fertile time. If trying to conceive, this is optimal. If not, ensure you're using appropriate contraception." },
      { icon: "🎯", title: "Performance Peak", description: "Athletic performance is at its highest. Push your limits in sports or physical challenges during this brief window." },
      { icon: "💬", title: "Communication", description: "Your verbal and emotional intelligence is heightened. Great time for important conversations, presentations, or negotiations." },
    ],
  },
  progesterone: {
    title: "Luteal Phase",
    subtitle: "Winding down. Honor your need for rest and reflection.",
    color: "#F59E0B",
    bg: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)",
    icon: "🌙",
    days: "Day 15–28",
    sections: [
      { icon: "🌙", title: "Slowing Down", description: "Progesterone rises, signaling your body to prepare for rest. Reduce high-intensity exercise and switch to pilates, yoga, or swimming." },
      { icon: "😤", title: "Managing PMS", description: "Mood changes are normal in the late luteal phase. Practice mindfulness, reduce sugar and caffeine intake, and prioritize social support." },
      { icon: "🍵", title: "Comfort Foods", description: "Cravings are real hormonal signals. Choose complex carbs, magnesium-rich foods like nuts and dark chocolate, and calming herbal teas." },
      { icon: "📓", title: "Self-Reflection", description: "Use this inward-facing phase for journaling, planning, and evaluating what's working in your life. Great for deep personal growth." },
    ],
  },
};

interface PhaseScreenProps {
  phase: keyof typeof phases;
  backScreen: Screen;
}

const PhaseScreen = ({ phase, backScreen }: PhaseScreenProps) => {
  const { navigate } = useApp();
  const config = phases[phase];

  return (
    <MobileLayout gradient={config.bg}>
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)]">
        <div className="px-5 pt-3 pb-2 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(backScreen)}
            className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${config.color}22`, color: config.color }}>
              {config.days}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-7xl mb-4"
            >
              {config.icon}
            </motion.div>
            <h1 className="text-[26px] font-bold text-gray-900 mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              {config.title}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed px-4">{config.subtitle}</p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {config.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${config.color}15` }}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1.5" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                      {section.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("log-entry")}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] mt-6 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${config.color}CC, ${config.color})` }}
          >
            Log Today's Data
          </motion.button>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PhasePeriodScreen = () => <PhaseScreen phase="period" backScreen="home" />;
export const PhaseGrowthScreen = () => <PhaseScreen phase="growth" backScreen="tracker" />;
export const PhaseReleaseScreen = () => <PhaseScreen phase="release" backScreen="tracker" />;
export const PhaseProgesteroneScreen = () => <PhaseScreen phase="progesterone" backScreen="tracker" />;
