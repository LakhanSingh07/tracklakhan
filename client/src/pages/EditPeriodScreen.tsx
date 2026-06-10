import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export const EditPeriodScreen = () => {
  const { navigate } = useApp();
  const [startDate, setStartDate] = useState(new Date(2024, 2, 1));
  const [endDate, setEndDate] = useState(new Date(2024, 2, 5));
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [viewDate, setViewDate] = useState(new Date(2024, 2));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const isInRange = (day: number) => {
    const d = new Date(year, month, day);
    return d >= startDate && d <= endDate;
  };

  const isStart = (day: number) => new Date(year, month, day).toDateString() === startDate.toDateString();
  const isEnd = (day: number) => new Date(year, month, day).toDateString() === endDate.toDateString();

  const handleDayPress = (day: number) => {
    const d = new Date(year, month, day);
    if (selecting === "start") {
      setStartDate(d);
      if (d > endDate) setEndDate(d);
      setSelecting("end");
    } else {
      if (d >= startDate) {
        setEndDate(d);
        setSelecting("start");
      } else {
        setStartDate(d);
        setSelecting("end");
      }
    }
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)]">
        <div className="px-5 pt-3 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("calendar")}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Edit Period</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("calendar")}
            className="text-[#FF657D] font-semibold text-sm"
          >
            Save
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {/* Date range indicator */}
          <div className="flex items-center gap-3 mb-5">
            {(["start", "end"] as const).map(type => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelecting(type)}
                className="flex-1 p-3 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: selecting === type ? "#FF657D" : "#E5E7EB",
                  background: selecting === type ? "#FFF0F3" : "white",
                }}
              >
                <p className="text-[10px] text-gray-400 mb-1">{type === "start" ? "Period Start" : "Period End"}</p>
                <p className="text-[14px] font-bold" style={{ color: selecting === type ? "#FF657D" : "#374151" }}>
                  {(type === "start" ? startDate : endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </motion.button>
            ))}
            <div className="bg-white rounded-2xl px-3 py-3 border border-gray-100">
              <p className="text-[10px] text-gray-400">Duration</p>
              <p className="text-[14px] font-bold text-[#FF657D]">
                {Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1}d
              </p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewDate(new Date(year, month - 1))}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
              <span className="text-[16px] font-bold text-gray-900">{MONTHS[month]} {year}</span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewDate(new Date(year, month + 1))}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6L15 12L9 18" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS_SHORT.map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-gray-400">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const inRange = isInRange(day);
                const start = isStart(day);
                const end = isEnd(day);

                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleDayPress(day)}
                    className="flex items-center justify-center relative"
                    style={{ height: 40 }}
                  >
                    {/* Range highlight */}
                    {inRange && !start && !end && (
                      <div className="absolute inset-0" style={{ background: "#FFE7EA" }} />
                    )}
                    {inRange && start && !end && (
                      <div className="absolute inset-0 right-0" style={{ background: "#FFE7EA", borderRadius: "50% 0 0 50%" }} />
                    )}
                    {inRange && !start && end && (
                      <div className="absolute inset-0 left-0" style={{ background: "#FFE7EA", borderRadius: "0 50% 50% 0" }} />
                    )}
                    <div
                      className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold"
                      style={{
                        background: start || end ? "#FF657D" : "transparent",
                        color: start || end ? "white" : inRange ? "#FF657D" : "#374151",
                      }}
                    >
                      {day}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#FFF0F3] rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">💡</span>
              <p className="text-xs text-[#FF657D] leading-relaxed">
                Tap to select your period start date, then tap again to set the end date. Flowly will automatically calculate your cycle.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("calendar")}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
          >
            Save Period Dates
          </motion.button>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
