import { useState } from "react";
import { motion } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weightData = [
  { day: "Mon", weight: 58.2, water: 1800, temp: 36.5 },
  { day: "Tue", weight: 57.9, water: 2000, temp: 36.6 },
  { day: "Wed", weight: 58.1, water: 1600, temp: 36.4 },
  { day: "Thu", weight: 57.8, water: 2200, temp: 36.7 },
  { day: "Fri", weight: 57.6, water: 1900, temp: 36.5 },
  { day: "Sat", weight: 57.7, water: 1500, temp: 36.3 },
  { day: "Sun", weight: 58.0, water: 1540, temp: 36.5 },
];

type MetricKey = "weight" | "water" | "temp";

const metrics: Record<MetricKey, { label: string; unit: string; color: string; bg: string; icon: string; dataKey: string; domain: [number, number] }> = {
  weight: { label: "Weight", unit: "kg", color: "#60A5FA", bg: "#EFF6FF", icon: "⚖️", dataKey: "weight", domain: [55, 61] },
  water: { label: "Water Intake", unit: "ml", color: "#34D399", bg: "#ECFDF5", icon: "💧", dataKey: "water", domain: [0, 2500] },
  temp: { label: "Temperature", unit: "°C", color: "#F59E0B", bg: "#FFFBEB", icon: "🌡️", dataKey: "temp", domain: [35, 38] },
};

export const HealthBarScreen = () => {
  const { navigate } = useApp();
  const [activeMetric, setActiveMetric] = useState<MetricKey>("weight");
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const metric = metrics[activeMetric];

  const bmi = (58 / (1.65 * 1.65)).toFixed(1);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto pb-2">
          <div className="px-5 pt-2 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Your Health</h1>
              <p className="text-sm text-gray-400">March 10 – 16, 2024</p>
            </div>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
              {(["bar", "area"] as const).map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className="px-3 py-1.5 text-xs font-medium transition-all"
                  style={{ background: chartType === t ? "#FF657D" : "white", color: chartType === t ? "white" : "#6B7280" }}>
                  {t === "bar" ? "Bar" : "Area"}
                </button>
              ))}
            </div>
          </div>

          {/* Metric selector */}
          <div className="px-5 mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {(Object.keys(metrics) as MetricKey[]).map(k => (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveMetric(k)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border-2 transition-all flex-shrink-0"
                  style={{
                    borderColor: activeMetric === k ? metrics[k].color : "transparent",
                    background: activeMetric === k ? metrics[k].bg : "#F9FAFB",
                  }}
                >
                  <span>{metrics[k].icon}</span>
                  <span className="text-xs font-semibold" style={{ color: activeMetric === k ? metrics[k].color : "#6B7280" }}>
                    {metrics[k].label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="mx-5 bg-white rounded-3xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400">{metric.label}</p>
                <p className="text-[22px] font-bold" style={{ color: metric.color }}>
                  {weightData[6][activeMetric as keyof typeof weightData[0]]} <span className="text-sm font-normal text-gray-400">{metric.unit}</span>
                </p>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: metric.bg, color: metric.color }}>
                This week
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              {chartType === "bar" ? (
                <BarChart data={weightData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <YAxis domain={metric.domain} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} width={32} />
                  <Tooltip
                    contentStyle={{ background: "white", border: "none", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                    formatter={(v: any) => [`${v} ${metric.unit}`, metric.label]}
                  />
                  <Bar dataKey={metric.dataKey} radius={[6, 6, 0, 0]} fill={metric.color} />
                </BarChart>
              ) : (
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <YAxis domain={metric.domain} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} width={32} />
                  <Tooltip
                    contentStyle={{ background: "white", border: "none", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                    formatter={(v: any) => [`${v} ${metric.unit}`, metric.label]}
                  />
                  <Area type="monotone" dataKey={metric.dataKey} stroke={metric.color} strokeWidth={2.5} fill="url(#colorGrad)" dot={{ fill: metric.color, r: 4 }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* BMI Card */}
          <div className="mx-5 bg-white rounded-3xl p-5 shadow-sm mb-4">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">BMI Overview</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[32px] font-bold text-[#34D399]">{bmi}</p>
                <p className="text-sm text-gray-500">Normal weight</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-300 via-green-400 via-yellow-300 to-red-400 relative mb-2">
              <motion.div
                initial={{ left: "0%" }}
                animate={{ left: "45%" }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#34D399] shadow"
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="px-5 grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Avg Weight", value: "57.9 kg", color: "#60A5FA", bg: "#EFF6FF" },
              { label: "Avg Water", value: "1.8 L", color: "#34D399", bg: "#ECFDF5" },
              { label: "Avg Temp", value: "36.5°C", color: "#F59E0B", bg: "#FFFBEB" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 shadow-sm" style={{ background: s.bg }}>
                <p className="text-[10px] text-gray-400 mb-1">{s.label}</p>
                <p className="text-[13px] font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
