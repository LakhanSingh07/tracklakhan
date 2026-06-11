import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import { Bell, ChevronLeft, Check, X, Settings2, BellOff } from "lucide-react";

interface Notification {
  id: string;
  type: "reminder" | "tip" | "alert" | "achievement";
  icon: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  color: string;
}

function generateNotifications(
  phase: string,
  daysUntilNext: number,
  currentDay: number,
  logs: { date: string }[],
  streak: number
): Notification[] {
  const today = new Date();
  const lastLog = logs.slice(-1)[0];
  const daysSinceLog = lastLog
    ? Math.floor((today.getTime() - new Date(lastLog.date).getTime()) / 86400000)
    : 999;

  const notifs: Notification[] = [];

  // --- Phase-specific tip ---
  const phaseTips: Record<string, { icon: string; title: string; message: string }> = {
    Menstrual: {
      icon: "🩸",
      title: "Menstrual Phase Check-in",
      message: "Your period is active. Log your flow and cramps today to improve future predictions.",
    },
    Follicular: {
      icon: "🌱",
      title: "Energy Rising!",
      message: "Estrogen is climbing this week. Great time to exercise harder, socialize, and tackle big goals.",
    },
    Ovulation: {
      icon: "🌟",
      title: "Fertile Window Open",
      message: "You're entering your predicted fertile window. Track symptoms to sharpen accuracy.",
    },
    Luteal: {
      icon: "🌙",
      title: "Luteal Phase Support",
      message: "Mood changes and bloating are common now. Want to log your symptoms and feel better understood?",
    },
  };
  if (phaseTips[phase]) {
    notifs.push({
      id: "phase-tip",
      type: "tip",
      ...phaseTips[phase],
      time: "Today",
      unread: true,
      color: phase === "Menstrual" ? "#FF657D" : phase === "Follicular" ? "#FB923C" : phase === "Ovulation" ? "#8B5CF6" : "#60A5FA",
    });
  }

  // --- Upcoming period warning ---
  if (daysUntilNext <= 3 && daysUntilNext > 0) {
    notifs.push({
      id: "period-incoming",
      type: "alert",
      icon: "📅",
      title: `Period in ${daysUntilNext} day${daysUntilNext > 1 ? "s" : ""}`,
      message: "Your period is approaching. Consider carrying supplies and planning lighter activities.",
      time: "Today",
      unread: true,
      color: "#EF4444",
    });
  }

  // --- Missed log reminder ---
  if (daysSinceLog >= 2) {
    notifs.push({
      id: "missed-log",
      type: "reminder",
      icon: "📝",
      title: "We missed you!",
      message: `No log in ${daysSinceLog} days. A quick check-in keeps your predictions sharp.`,
      time: daysSinceLog === 2 ? "Yesterday" : `${daysSinceLog} days ago`,
      unread: daysSinceLog < 5,
      color: "#F59E0B",
    });
  }

  // --- Streak achievement ---
  if (streak >= 3) {
    notifs.push({
      id: "streak",
      type: "achievement",
      icon: "🔥",
      title: `${streak}-Day Streak! Keep it up`,
      message: `You've logged for ${streak} consecutive days. Consistent tracking = better insights.`,
      time: "Today",
      unread: streak === 3 || streak === 7 || streak === 30,
      color: "#F59E0B",
    });
  }

  // --- Health tips by phase ---
  const healthTips: Notification[] = [
    {
      id: "tip-nutrition",
      type: "tip",
      icon: "🥗",
      title: "Nutrition Tip",
      message:
        phase === "Menstrual"
          ? "Eat iron-rich foods like spinach and lentils to replenish iron lost during your period."
          : phase === "Ovulation"
          ? "Antioxidant-rich foods like berries and leafy greens support hormonal balance during ovulation."
          : "Complex carbs and magnesium-rich foods can ease PMS cravings during your luteal phase.",
      time: "2 hours ago",
      unread: false,
      color: "#34D399",
    },
    {
      id: "tip-exercise",
      type: "tip",
      icon: "🏃‍♀️",
      title: "Movement Tip",
      message:
        phase === "Menstrual"
          ? "Light yoga or walking are ideal during menstruation — avoid high-intensity training."
          : phase === "Follicular" || phase === "Ovulation"
          ? "Your energy is high! HIIT, strength training, and cardio are your best friends right now."
          : "Gentle pilates and walking match your energy levels in the luteal phase.",
      time: "3 hours ago",
      unread: false,
      color: "#8B5CF6",
    },
    {
      id: "tip-sleep",
      type: "tip",
      icon: "😴",
      title: "Sleep Quality",
      message: "Progesterone naturally rises in the luteal phase and can cause fatigue. Try to sleep 7–9 hours and limit screens before bed.",
      time: "Yesterday",
      unread: false,
      color: "#60A5FA",
    },
  ];

  notifs.push(...healthTips);

  return notifs;
}

type FilterTab = "all" | "reminders" | "tips" | "alerts" | "achievements";

export const NotificationCenterScreen = () => {
  const { navigate, cycleData, logs } = useApp();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    phaseTips: true,
    periodAlerts: true,
    missedLogReminders: true,
    achievements: true,
    healthTips: true,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "08:00",
  });

  const streak = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDates = new Set(logs.map((l) => l.date));
    let s = 0;
    const check = new Date(today);
    while (true) {
      const ds = check.toISOString().split("T")[0];
      if (logDates.has(ds)) {
        s++;
        check.setDate(check.getDate() - 1);
      } else break;
    }
    return s;
  }, [logs]);

  const allNotifs = useMemo(
    () => generateNotifications(cycleData.phase, cycleData.daysUntilNextPeriod, cycleData.currentDay, logs, streak),
    [cycleData, logs, streak]
  );

  const filtered = allNotifs
    .filter((n) => !dismissedIds.has(n.id))
    .filter((n) => {
      if (activeTab === "all") return true;
      if (activeTab === "reminders") return n.type === "reminder";
      if (activeTab === "tips") return n.type === "tip";
      if (activeTab === "alerts") return n.type === "alert";
      if (activeTab === "achievements") return n.type === "achievement";
      return true;
    });

  const unreadCount = filtered.filter((n) => n.unread && !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(allNotifs.map((n) => n.id)));
  const dismiss = (id: string) => setDismissedIds((prev) => {
    const s = new Set(prev);
    s.add(id);
    return s;
  });
  const markRead = (id: string) => setReadIds((prev) => {
    const s = new Set(prev);
    s.add(id);
    return s;
  });

  const tabs: { key: FilterTab; label: string; emoji: string }[] = [
    { key: "all", label: "All", emoji: "" },
    { key: "alerts", label: "Alerts", emoji: "🔔" },
    { key: "reminders", label: "Reminders", emoji: "⏰" },
    { key: "tips", label: "Tips", emoji: "💡" },
    { key: "achievements", label: "Goals", emoji: "🏆" },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F5FF 0%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("home")}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
              data-testid="button-back"
            >
              <ChevronLeft size={20} className="text-gray-700" strokeWidth={2.2} />
            </motion.button>
            <div>
              <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-[11px] text-[#FF657D] font-medium">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={markAllRead}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white shadow-sm text-xs font-semibold text-gray-600"
              >
                <Check size={12} />
                Mark all read
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)}
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
              data-testid="button-notification-settings"
            >
              <Settings2 size={18} className="text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.93 }}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                activeTab === tab.key
                  ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)", color: "white" }
                  : { background: "white", color: "#6B7280", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }
              }
            >
              {tab.emoji && <span>{tab.emoji}</span>}
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-[13px] font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings2 size={14} />
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "phaseTips", label: "Phase tips", desc: "Daily cycle phase guidance", icon: "🌸" },
                      { key: "periodAlerts", label: "Period alerts", desc: "Upcoming period warnings", icon: "📅" },
                      { key: "missedLogReminders", label: "Log reminders", desc: "Remind when you haven't logged", icon: "📝" },
                      { key: "achievements", label: "Achievements", desc: "Streak and milestone alerts", icon: "🔥" },
                      { key: "healthTips", label: "Health tips", desc: "Nutrition & lifestyle advice", icon: "💡" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-800">{item.label}</p>
                            <p className="text-[10px] text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSettings((s) => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                          className="w-10 h-6 rounded-full relative transition-colors"
                          style={{ background: settings[item.key as keyof typeof settings] ? "#FF657D" : "#E5E7EB" }}
                        >
                          <motion.div
                            animate={{ x: settings[item.key as keyof typeof settings] ? 16 : 2 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </motion.button>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base"><BellOff size={16} className="text-gray-500 inline" /></span>
                          <div>
                            <p className="text-[12px] font-semibold text-gray-800">Quiet hours</p>
                            <p className="text-[10px] text-gray-400">{settings.quietStart} – {settings.quietEnd}</p>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSettings((s) => ({ ...s, quietHours: !s.quietHours }))}
                          className="w-10 h-6 rounded-full relative transition-colors"
                          style={{ background: settings.quietHours ? "#FF657D" : "#E5E7EB" }}
                        >
                          <motion.div
                            animate={{ x: settings.quietHours ? 16 : 2 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </motion.button>
                      </div>
                      {settings.quietHours && (
                        <div className="flex gap-3 mt-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-gray-400 block mb-1">Quiet from</label>
                            <input
                              type="time"
                              value={settings.quietStart}
                              onChange={(e) => setSettings((s) => ({ ...s, quietStart: e.target.value }))}
                              className="w-full text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2 outline-none border border-gray-100"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-gray-400 block mb-1">Until</label>
                            <input
                              type="time"
                              value={settings.quietEnd}
                              onChange={(e) => setSettings((s) => ({ ...s, quietEnd: e.target.value }))}
                              className="w-full text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-2 outline-none border border-gray-100"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notification list */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-2xl">🔔</div>
              <p className="text-[16px] font-semibold text-gray-600">All caught up!</p>
              <p className="text-[13px] text-gray-400 mt-1">No notifications in this category</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filtered.map((notif, i) => {
                  const isUnread = notif.unread && !readIds.has(notif.id);
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => markRead(notif.id)}
                      className="bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                      data-testid={`notification-${notif.id}`}
                    >
                      {/* Unread accent bar */}
                      {isUnread && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                          style={{ background: notif.color }}
                        />
                      )}
                      <div className="flex items-start gap-3 pl-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: notif.color + "18" }}
                        >
                          {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[13px] font-bold ${isUnread ? "text-gray-900" : "text-gray-600"} leading-tight`}>
                              {notif.title}
                              {isUnread && (
                                <span
                                  className="inline-block w-1.5 h-1.5 rounded-full ml-1.5 mb-0.5"
                                  style={{ background: notif.color }}
                                />
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                                className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center"
                              >
                                <X size={10} className="text-gray-400" />
                              </motion.button>
                            </div>
                          </div>
                          <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{notif.message}</p>

                          {/* CTA buttons for actionable notifications */}
                          {notif.type === "reminder" && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); navigate("log-entry"); }}
                              className="mt-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
                              style={{ background: notif.color }}
                            >
                              Log Now →
                            </motion.button>
                          )}
                          {notif.type === "alert" && notif.id === "period-incoming" && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); navigate("calendar"); }}
                              className="mt-2 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
                              style={{ background: notif.color }}
                            >
                              View Calendar →
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};

export const NotificationBell = ({ onPress }: { onPress: () => void }) => {
  const { cycleData, logs } = useApp();

  const unreadCount = useMemo(() => {
    const today = new Date();
    const lastLog = logs.slice(-1)[0];
    const daysSinceLog = lastLog
      ? Math.floor((today.getTime() - new Date(lastLog.date).getTime()) / 86400000)
      : 999;
    let count = 1; // phase tip always unread on open
    if (cycleData.daysUntilNextPeriod <= 3) count++;
    if (daysSinceLog >= 2) count++;
    return Math.min(count, 9);
  }, [cycleData, logs]);

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onPress}
      className="relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center"
      data-testid="button-notification-bell"
    >
      <Bell size={18} className="text-gray-700" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#FF657D" }}
        >
          {unreadCount}
        </motion.div>
      )}
    </motion.button>
  );
};
