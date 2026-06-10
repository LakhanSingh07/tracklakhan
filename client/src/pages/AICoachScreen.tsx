import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { Mic, MicOff, Send, RotateCcw, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
  streaming?: boolean;
}

interface HealthContext {
  phase: string;
  cycleDay: number;
  daysUntilPeriod: number;
  cycleLength: number;
  periodLength: number;
  recentMoods: string[];
  recentWeight?: number;
  recentWater?: number;
}

const SUGGESTIONS = [
  "Why is my period late?",
  "Why am I bloated?",
  "Why am I getting cramps?",
  "What foods help today?",
  "Explain my cycle prediction",
  "What should I expect this week?",
  "Am I in my fertile window?",
  "How is my cycle health?",
];

const nowStr = () =>
  new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const makeWelcome = (phase: string, day: number): Message => ({
  id: "welcome",
  role: "ai",
  text: `Hi! 👋 I'm **FlowAI Coach**, your personal hormonal health assistant.\n\nYou're on **Day ${day}** of your cycle — currently in your **${phase} Phase**. I can see your health data and give you personalised insights.\n\nWhat would you like to know today? 🌸`,
  time: nowStr(),
});

const TypingIndicator = () => (
  <div className="flex items-end gap-2 px-4">
    <div
      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm"
      style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
    >
      ✨
    </div>
    <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white shadow-sm border border-gray-100">
      <div className="flex gap-1 items-center h-5">
        {[0, 1, 2].map((i) => (
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
      const withBold = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p
          key={i}
          className={i > 0 ? "mt-1" : ""}
          dangerouslySetInnerHTML={{ __html: withBold }}
        />
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-2 px-4 ${isAI ? "" : "flex-row-reverse"}`}
    >
      {isAI && (
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
        >
          ✨
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isAI
            ? "rounded-bl-md bg-white border border-gray-100 text-gray-800"
            : "rounded-br-md text-white"
        }`}
        style={
          !isAI
            ? { background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" }
            : {}
        }
      >
        {renderText(msg.text)}
        {msg.streaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-text-bottom"
          />
        )}
        <p className={`text-[10px] mt-1.5 ${isAI ? "text-gray-400" : "text-white/60"}`}>
          {msg.time}
        </p>
      </div>
      {!isAI && (
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
          style={{ background: "linear-gradient(135deg, #EC4899, #8B5CF6)" }}
        >
          U
        </div>
      )}
    </motion.div>
  );
};

export const AICoachScreen = () => {
  const { navigate, cycleData, logs, todayWater } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const recognitionRef = useRef<any>(null);

  // Build health context from app state
  const getContext = useCallback((): HealthContext => {
    const recentMoods = logs
      .slice(-5)
      .filter((l) => l.mood)
      .map((l) => l.mood as string);
    const weightLogs = logs.filter((l) => l.weight);
    const recentWeight =
      weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : undefined;

    return {
      phase: cycleData.phase,
      cycleDay: cycleData.currentDay,
      daysUntilPeriod: cycleData.daysUntilNextPeriod,
      cycleLength: cycleData.cycleLength,
      periodLength: cycleData.periodLength,
      recentMoods,
      recentWeight,
      recentWater: todayWater,
    };
  }, [cycleData, logs, todayWater]);

  // Init welcome message
  useEffect(() => {
    setMessages([makeWelcome(cycleData.phase, cycleData.currentDay)]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      time: nowStr(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowSuggestions(false);
    setShowTyping(true);
    setIsStreaming(true);
    setUsageCount((c) => c + 1);

    // Build history for context (last 10 messages)
    const history = historyRef.current.slice(-10);

    const aiId = (Date.now() + 1).toString();
    let accumulated = "";

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/ai-coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
          context: getContext(),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Network error");

      setShowTyping(false);

      // Add empty AI message to fill in via streaming
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: "ai", text: "", time: nowStr(), streaming: true },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              accumulated += json.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId ? { ...m, text: accumulated, streaming: true } : m
                )
              );
            }
            if (json.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId
                    ? { ...m, text: json.error, streaming: false }
                    : m
                )
              );
            } else if (json.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiId ? { ...m, streaming: false } : m
                )
              );
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      // Save to history
      historyRef.current.push(
        { role: "user", content: text.trim() },
        { role: "assistant", content: accumulated }
      );
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setShowTyping(false);
      const errMsg: Message = {
        id: aiId,
        role: "ai",
        text: "I'm having trouble connecting right now. Please try again in a moment. 🌸",
        time: nowStr(),
        streaming: false,
      };
      setMessages((prev) =>
        prev.filter((m) => m.id !== aiId).concat(errMsg)
      );
    } finally {
      setIsStreaming(false);
      setShowTyping(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    historyRef.current = [];
    setMessages([makeWelcome(cycleData.phase, cycleData.currentDay)]);
    setShowSuggestions(true);
    setIsStreaming(false);
    setShowTyping(false);
  };

  const toggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input isn't supported in your browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const phaseColor: Record<string, string> = {
    Menstrual: "#FF657D",
    Follicular: "#FB923C",
    Ovulation: "#8B5CF6",
    Luteal: "#60A5FA",
  };
  const accent = phaseColor[cycleData.phase] || "#8B5CF6";

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FAF5FF 0%, #FDF2F8 50%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div
          className="flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #C026D3 50%, #EC4899 100%)",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("home")}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
              data-testid="button-back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </motion.button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={16} className="text-white" />
                </motion.div>
                <h1
                  className="text-white font-bold text-[17px]"
                  style={{ fontFamily: "Instrument Sans, sans-serif" }}
                >
                  FlowAI Coach
                </h1>
              </div>
              <p className="text-white/70 text-[11px]">
                {cycleData.phase} Phase · Day {cycleData.currentDay}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
              data-testid="button-reset-chat"
            >
              <RotateCcw size={16} className="text-white" />
            </motion.button>
          </div>

          {/* Disclaimer + phase context */}
          <div className="mx-4 mb-3 px-3 py-2 rounded-xl bg-white/15 flex items-start gap-2">
            <span className="text-sm flex-shrink-0">ℹ️</span>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Context-aware insights for your{" "}
              <strong className="text-white">
                {cycleData.phase} Phase (Day {cycleData.currentDay})
              </strong>
              . Not medical advice — always consult a doctor.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-none">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>

          {showTyping && <TypingIndicator />}

          {/* Suggested questions */}
          {showSuggestions && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4 pt-1"
            >
              <p className="text-xs text-gray-400 font-medium mb-2 ml-10">
                Suggested questions
              </p>
              <div className="ml-10 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-2 rounded-full border font-medium"
                    style={{
                      borderColor: "#C026D3",
                      color: "#8B5CF6",
                      background: "#FAF5FF",
                    }}
                    data-testid={`button-suggestion-${s.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex items-end gap-2">
            {/* Voice button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleVoice}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
              style={{
                background: isListening ? "#FDF2F8" : "#F9FAFB",
                borderColor: isListening ? "#EC4899" : "#E5E7EB",
              }}
              data-testid="button-voice-input"
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <MicOff size={16} color="#EC4899" />
                </motion.div>
              ) : (
                <Mic size={16} color="#9CA3AF" />
              )}
            </motion.button>

            {/* Text input */}
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2.5 flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask FlowAI anything about your cycle…"
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
                rows={1}
                style={{ maxHeight: 80 }}
                data-testid="input-ai-message"
              />
              <span className="text-gray-300 text-lg flex-shrink-0">🌸</span>
            </div>

            {/* Send button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-md flex-shrink-0 transition-all"
              style={{
                background:
                  input.trim() && !isStreaming
                    ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
                    : "#E5E7EB",
              }}
              data-testid="button-send-message"
            >
              <Send size={16} color="white" />
            </motion.button>
          </div>
        </div>

        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
