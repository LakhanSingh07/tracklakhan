import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

type DayType = "period" | "fertile" | "ovulation" | "normal" | "future-period";

const getDayType = (date: Date, lastPeriod: Date, cycleLength: number, periodLength: number): DayType => {
  const diff = Math.floor((date.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const dayInCycle = ((diff % cycleLength) + cycleLength) % cycleLength;
  const ovulationDay = Math.round(cycleLength / 2) - 1;
  if (dayInCycle < periodLength) return "period";
  if (dayInCycle === ovulationDay) return "ovulation";
  if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) return "fertile";
  return "normal";
};

const dayColors: Record<DayType, { bg: string; text: string; dot?: string }> = {
  period: { bg: "#8B0000", text: "white", dot: "#8B0000" },
  fertile: { bg: "#A78BFA22", text: "#A78BFA", dot: "#A78BFA" },
  ovulation: { bg: "#A78BFA", text: "white", dot: "#A78BFA" },
  normal: { bg: "transparent", text: "#1F2937" },
  "future-period": { bg: "#FFEAEA", text: "#8B0000", dot: "#8B0000" },
};

export const CalendarScreen = () => {
  const { cycleData, navigate, selectedDate, setSelectedDate, logs } = useApp();
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1));

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const phaseInfo = {
    period: { label: "Period", color: "#8B0000", icon: "🩸" },
    fertile: { label: "Fertile Window", color: "#A78BFA", icon: "🌱" },
    ovulation: { label: "Ovulation", color: "#A78BFA", icon: "⭐" },
    normal: { label: "Normal", color: "#9CA3AF", icon: "○" },
  };

  const dateStr = selectedDate.toISOString().split("T")[0];
  const logForDate = logs.find(l => l.date === dateStr);
  const cycleDay = (() => {
    const diff = Math.floor((selectedDate.getTime() - cycleData.lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
    return ((diff % cycleData.cycleLength) + cycleData.cycleLength) % cycleData.cycleLength + 1;
  })();

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto pb-2">
          {/* Header */}
          <div className="px-5 pt-2 pb-4">
            <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Calendar</h1>
            <p className="text-sm text-gray-400">Track your cycle journey</p>
          </div>

          {/* Calendar card */}
          <div className="mx-5 bg-white rounded-3xl p-5 shadow-sm mb-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
              <motion.div key={`${year}-${month}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[17px] font-bold text-gray-900">
                {MONTHS[month]} {year}
              </motion.div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6L15 12L9 18" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${year}-${month}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-7 gap-y-1"
              >
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const date = new Date(year, month, day);
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const dtype = getDayType(date, cycleData.lastPeriodStart, cycleData.cycleLength, cycleData.periodLength);
                  const colors = dayColors[dtype];
                  const isFuture = date > today;

                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setSelectedDate(date); navigate("calendar"); }}
                      className="flex flex-col items-center py-1"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold relative"
                        style={{
                          background: isSelected ? "#8B0000" : isToday ? "#FFF5F5" : dtype !== "normal" ? colors.bg : "transparent",
                          color: isSelected ? "white" : isToday ? "#8B0000" : isFuture ? "#9CA3AF" : colors.text,
                          border: isToday && !isSelected ? "2px solid #8B0000" : "none",
                        }}
                      >
                        {day}
                      </div>
                      {dtype !== "normal" && (
                        <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: isSelected ? "transparent" : colors.dot }} />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="mx-5 flex flex-wrap gap-3 mb-4">
            {Object.entries(phaseInfo).filter(([k]) => k !== "normal").map(([key, info]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: info.color }} />
                <span className="text-[11px] text-gray-500">{info.label}</span>
              </div>
            ))}
          </div>

          {/* Selected day info */}
          <div className="mx-5 bg-white rounded-3xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                <p className="text-sm font-medium" style={{ color: "#8B0000" }}>
                  Day {cycleDay} of cycle
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("log-entry")}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
              >
                + Log
              </motion.button>
            </div>

            {logForDate ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Flow", value: logForDate.flow ?? "—", icon: "🩸", color: "#8B0000" },
                  { label: "Mood", value: logForDate.mood ?? "—", icon: "", color: "#A78BFA" },
                  { label: "Notes", value: logForDate.notes ? logForDate.notes.substring(0, 20) + (logForDate.notes.length > 20 ? "…" : "") : "—", icon: "📝", color: "#60A5FA" },
                  { label: "Logged", value: "✓", icon: "✅", color: "#34D399" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl p-3 bg-gray-50">
                    <div className="text-[11px] text-gray-400 mb-1">{item.label}</div>
                    <div className="text-[15px] font-bold" style={{ color: item.color }}>
                      {item.icon} {item.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-4 bg-gray-50 text-center">
                <p className="text-[13px] text-gray-400 mb-2">No log for this day yet</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("log-entry")}
                  className="text-[13px] font-semibold"
                  style={{ color: "#8B0000" }}
                >
                  + Add log
                </motion.button>
              </div>
            )}
          </div>

          {/* Edit cycle button */}
          <div className="mx-5 mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("edit-period")}
              className="w-full py-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-semibold"
              style={{ borderColor: "#8B0000", color: "#8B0000" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.4 4 3 4.4 3 5V20C3 20.6 3.4 21 4 21H19C19.6 21 20 20.6 20 20V13" stroke="#8B0000" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z" stroke="#8B0000" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              Edit Period Dates
            </motion.button>
          </div>
        </div>
        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
