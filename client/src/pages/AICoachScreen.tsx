import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

const AI_RESPONSES: Record<string, string> = {
  "Why is my period late?": "Based on your cycle history, your period is currently **2 days late**, which is within normal range (±3 days). Common causes include stress, changes in sleep, travel, or slight hormonal fluctuations. Your average cycle is 28 days. If it's delayed beyond 7 days, I'd recommend a pregnancy test or consulting your doctor. 🌸",
  "What should I eat today?": "You're in your **Menstrual Phase** right now. I recommend:\n\n🥬 **Iron-rich foods** — spinach, lentils, red meat to replenish iron lost during bleeding\n🍫 **Dark chocolate** — magnesium helps reduce cramps\n🫚 **Omega-3s** — salmon, walnuts reduce inflammation\n💧 **Stay hydrated** — at least 8 glasses of water\n\nAvoid caffeine and salty foods as they can worsen bloating! 🌷",
  "Why are my cramps worse?": "Cramps during menstruation are caused by **prostaglandins** — hormone-like substances that trigger uterine contractions. Factors that may worsen them:\n\n• High stress levels 😟\n• Low magnesium/calcium\n• Sedentary lifestyle\n• Endometriosis (if severe)\n\n**Try:** Heat pad on abdomen, gentle yoga, ibuprofen if needed, or magnesium supplements. If pain is severe and disrupting daily life, please see a gynecologist. 💗",
  "What does spotting mean?": "Spotting (light bleeding outside your period) can have several causes:\n\n🟡 **Ovulation spotting** — normal mid-cycle spotting\n🟠 **Implantation bleeding** — if trying to conceive, ~6-12 days after ovulation\n🔴 **Hormonal fluctuations** — common with birth control\n⚠️ **Worth checking** — if spotting is heavy, painful, or frequent\n\nYour cycle data shows you're on Day 14, which aligns with ovulation timing. Likely normal! 🌸",
  "Am I in my fertile window?": "Based on your cycle data:\n\n📅 **Fertile Window: Mar 12–16**\n🥚 **Ovulation Day: Mar 14** (predicted)\n\nYou are currently in your **fertile window** with HIGH conception chances. Your estrogen is peaking which also means you'll feel more energetic and sociable!\n\n💡 Tip: Track your basal body temperature (BBT) and cervical mucus to confirm ovulation more precisely. 🌺",
  "How is my cycle health?": "Your cycle health looks **great** overall! 🎉\n\n✅ **Cycle length:** 28 days (textbook regular!)\n✅ **Period duration:** 5 days (normal range)\n✅ **Mood tracking:** Consistent\n⚠️ **Water intake:** Could be higher\n⚠️ **Sleep quality:** Not logged recently\n\n**Wellness Score: 78/100** — Keep logging daily for better insights! Your next predicted period is in **14 days**. 💗",
};

const SUGGESTIONS = [
  "Why is my period late?",
  "What should I eat today?",
  "Am I in my fertile window?",
  "Why are my cramps worse?",
  "What does spotting mean?",
  "How is my cycle health?",
];

const now = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const initMessages: Message[] = [
  {
    id: "welcome",
    role: "ai",
    text: "Hi! 👋 I'm **FlowAI Coach**, your personal hormonal health assistant.\n\nI can help you understand your cycle, symptoms, fertility, and more — all based on your personal health data.\n\nWhat would you like to know today? 🌸",
    time: now(),
  },
];

const TypingIndicator = () => (
  <div className="flex items-end gap-2 px-4">
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
      style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}>
      ✨
    </div>
    <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white shadow-sm border border-gray-100">
      <div className="flex gap-1 items-center h-5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  </div>
);

const MessageBubble = ({ msg }: { msg: Message }) => {
  const isAI = msg.role === "ai";
  const renderText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p key={i} className={i > 0 ? "mt-1" : ""} dangerouslySetInnerHTML={{ __html: bold }} />
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-end gap-2 px-4 ${isAI ? "" : "flex-row-reverse"}`}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}>
          ✨
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isAI
            ? "rounded-bl-md bg-white border border-gray-100 text-gray-800"
            : "rounded-br-md text-white"
        }`}
        style={!isAI ? { background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" } : {}}
      >
        {renderText(msg.text)}
        <p className={`text-[10px] mt-1.5 ${isAI ? "text-gray-400" : "text-white/60"}`}>{msg.time}</p>
      </div>
      {!isAI && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
          style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}>
          S
        </div>
      )}
    </motion.div>
  );
};

export const AICoachScreen = () => {
  const { navigate } = useApp();
  const [messages, setMessages] = useState<Message[]>(initMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setShowSuggestions(false);

    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      setTyping(false);
      const responseText = AI_RESPONSES[text.trim()] ||
        "That's a great question! Based on your cycle data and logged symptoms, I can see patterns that might help answer this. For personalized medical advice about this specific concern, I'd recommend consulting with your gynecologist — but I'm here to help you understand your body better! 🌸\n\nWould you like to explore any specific aspect of your cycle health?";
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: responseText, time: now() };
      setMessages(prev => [...prev, aiMsg]);
    }, delay);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FAF5FF 0%, #FDF2F8 50%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div className="flex-shrink-0" style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #C026D3 50%, #EC4899 100%)" }}>
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("home")}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-lg"
                >
                  ✨
                </motion.div>
                <h1 className="text-white font-bold text-[17px]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                  FlowAI Coach
                </h1>
              </div>
              <p className="text-white/70 text-[11px]">Powered by AI • Always learning</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setMessages(initMessages); setShowSuggestions(true); }}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12C3 7 7 3 12 3C15.5 3 18.5 4.8 20.2 7.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 12C21 17 17 21 12 21C8.5 21 5.5 19.2 3.8 16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 3L20.2 7.5L16 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21L3.8 16.5L8 17.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Disclaimer banner */}
          <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-white/15 flex items-start gap-2">
            <span className="text-sm flex-shrink-0">ℹ️</span>
            <p className="text-white/80 text-[11px] leading-relaxed">
              FlowAI provides educational insights, not medical advice. Always consult a doctor for health concerns.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-none">
          <AnimatePresence>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          </AnimatePresence>
          {typing && <TypingIndicator />}

          {/* Suggestions */}
          {showSuggestions && !typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-4 pt-2"
            >
              <p className="text-xs text-gray-400 font-medium mb-2 ml-10">Suggested questions</p>
              <div className="ml-10 flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-2 rounded-full border font-medium text-left"
                    style={{ borderColor: "#C026D3", color: "#8B5CF6", background: "#FAF5FF" }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2.5 flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
                placeholder="Ask FlowAI anything about your cycle..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
                rows={1}
                style={{ maxHeight: 80 }}
                data-testid="input-ai-message"
              />
              <span className="text-gray-300 text-lg flex-shrink-0">🌸</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
                  : "#E5E7EB",
              }}
              data-testid="button-send-message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        </div>

        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
