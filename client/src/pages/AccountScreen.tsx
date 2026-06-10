import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { useState } from "react";

const SettingRow = ({
  icon,
  label,
  value,
  color = "#FF657D",
  bg = "#FFF0F3",
  onClick,
  isLast = false,
}: {
  icon: string;
  label: string;
  value?: string;
  color?: string;
  bg?: string;
  onClick?: () => void;
  isLast?: boolean;
}) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-4 ${!isLast ? "border-b border-gray-50" : ""}`}
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: bg }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <span className="flex-1 text-[14px] font-medium text-gray-800 text-left">{label}</span>
    {value && <span className="text-[13px] text-gray-400">{value}</span>}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </motion.button>
);

export const AccountScreen = () => {
  const { navigate, user } = useApp();

  const sections = [
    {
      title: "General",
      items: [
        { icon: "⚙️", label: "Preferences", color: "#FF657D", bg: "#FFF0F3", screen: "personal-data" as const },
        { icon: "🔔", label: "Reminder", color: "#A78BFA", bg: "#F5F0FF", screen: "reminder" as const },
        { icon: "🔒", label: "Account & Security", color: "#60A5FA", bg: "#EFF6FF", screen: "account-security" as const },
        { icon: "🔗", label: "Linked Account", color: "#34D399", bg: "#ECFDF5", screen: "account" as const },
        { icon: "💳", label: "Payment Method", color: "#F59E0B", bg: "#FFFBEB", screen: "billing" as const },
        { icon: "📊", label: "Data & Analytics", color: "#EC4899", bg: "#FDF2F8", screen: "account" as const },
        { icon: "🎨", label: "App Appearance", color: "#8B5CF6", bg: "#F5F3FF", screen: "account" as const },
        { icon: "❓", label: "Help & Support", color: "#06B6D4", bg: "#ECFEFF", screen: "account" as const },
      ],
    },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto pb-2">
          <div className="px-5 pt-2 pb-4">
            <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Account Settings</h1>
          </div>

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("personal-data")}
            className="mx-5 bg-white rounded-3xl p-5 flex items-center gap-4 mb-4 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-bold">{user.name[0]}</span>
            </div>
            <div className="flex-1">
              <p className="text-[17px] font-bold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.div>

          {/* Premium card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("premium")}
            className="mx-5 rounded-3xl p-5 mb-4 relative overflow-hidden shadow-md"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-4 translate-x-4" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👑</span>
                  <span className="text-white font-bold text-[15px]">Upgrade to Premium</span>
                </div>
                <p className="text-white/80 text-xs">Unlock advanced insights & features</p>
              </div>
              <div className="bg-white rounded-xl px-3 py-1.5">
                <span className="text-[#FF657D] text-xs font-bold">Try Free</span>
              </div>
            </div>
          </motion.div>

          {/* Settings sections */}
          {sections.map(section => (
            <div key={section.title} className="mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 mb-2">{section.title}</p>
              <div className="mx-5 bg-white rounded-3xl overflow-hidden shadow-sm">
                {section.items.map((item, i) => (
                  <SettingRow
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    color={item.color}
                    bg={item.bg}
                    onClick={() => navigate(item.screen)}
                    isLast={i === section.items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Logout button */}
          <div className="mx-5 mt-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("logout-confirm")}
              className="w-full py-4 rounded-2xl border-2 border-red-200 text-red-400 font-semibold text-[15px]"
            >
              Log Out
            </motion.button>
          </div>
        </div>
        <BottomNav />
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};

export const LogoutConfirmDialog = () => {
  const { navigate } = useApp();

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 flex items-end">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="w-full bg-white rounded-t-3xl p-6 shadow-2xl"
          >
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
                🚪
              </div>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 text-center mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Log Out?
            </h2>
            <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
              Are you sure you want to log out? Your data will be saved.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("account")}
                className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-[15px]"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("auth-signup")}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-semibold text-[15px] shadow-sm"
              >
                Log Out
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export const PersonalDataScreen = () => {
  const { navigate, user } = useApp();
  const fields = [
    { label: "Full Name", value: user.name },
    { label: "Username", value: "@maria.w" },
    { label: "Email", value: user.email },
    { label: "Contact Number", value: "+1 (555) 012-3456" },
    { label: "Gender", value: "Female" },
    { label: "Birth Date", value: "January 15, 1995" },
    { label: "Location", value: "New York, USA" },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)]">
        <div className="px-5 pt-3 pb-4 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("account")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Personal Data</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-lg mb-2 cursor-pointer"
            >
              <span className="text-white text-3xl font-bold">{user.name[0]}</span>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#FF657D] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </motion.div>
            <p className="text-[16px] font-bold text-gray-900">{user.name}</p>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm mb-4">
            {fields.map((field, i) => (
              <div key={field.label} className={`px-5 py-4 flex items-center justify-between ${i < fields.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 mb-0.5">{field.label}</p>
                  <p className="text-[14px] font-medium text-gray-900">{field.value}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">Preferences</h3>
            {[
              { label: "Water Target", value: "2,000 ml/day" },
              { label: "Weight Format", value: "Kilograms (kg)" },
              { label: "Height Format", value: "Centimeters (cm)" },
              { label: "Start of Week", value: "Monday" },
              { label: "Time Format", value: "12h (AM/PM)" },
            ].map((pref, i) => (
              <div key={pref.label} className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-gray-50" : ""}`}>
                <span className="text-[13px] text-gray-600">{pref.label}</span>
                <span className="text-[13px] font-semibold text-[#FF657D]">{pref.value}</span>
              </div>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg mb-4"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            Save Changes
          </motion.button>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const ReminderScreen = () => {
  const { navigate } = useApp();
  const [volume, setVolume] = useState(70);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #F5F0FF 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 pt-3 pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("account")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Reminder Alert</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {[
            { label: "Period Reminder", time: "2 days before", enabled: true },
            { label: "Fertile Window", time: "1 day before", enabled: true },
            { label: "Log Reminder", time: "Every day 8:00 PM", enabled: false },
            { label: "Ovulation Alert", time: "On the day", enabled: true },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[14px] font-semibold text-gray-800">{r.label}</p>
                <p className="text-xs text-gray-400">{r.time}</p>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${r.enabled ? "bg-[#FF657D]" : "bg-gray-200"}`}>
                <motion.div
                  animate={{ x: r.enabled ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow"
                />
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4">Ringtone & Volume</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Default Ringtone</span>
              <span className="text-sm text-[#FF657D] font-medium">Classic</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">🔈</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full relative">
                <motion.div className="absolute left-0 top-0 h-full rounded-full bg-[#A78BFA]" style={{ width: `${volume}%` }} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 w-full cursor-pointer"
                />
              </div>
              <span className="text-gray-400 text-sm">🔊</span>
            </div>
          </div>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AccountSecurityScreen = () => {
  const { navigate } = useApp();

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #EFF6FF 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 pt-3 pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("account")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Account & Security</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            {[
              { label: "Change Password", icon: "🔑", color: "#60A5FA" },
              { label: "Two-Factor Authentication", icon: "🛡️", color: "#34D399" },
              { label: "Device Management", icon: "📱", color: "#A78BFA", sub: "1 active device" },
              { label: "Login Activity", icon: "📋", color: "#F59E0B" },
            ].map((item, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-5 py-4 ${i > 0 ? "border-t border-gray-50" : ""}`}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base">{item.icon}</div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-medium text-gray-800">{item.label}</p>
                  {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.button>
            ))}
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4">
              <p className="text-[14px] font-semibold text-red-500">Delete Account</p>
              <p className="text-xs text-gray-400 mt-1">This action cannot be undone. All your data will be permanently removed.</p>
            </div>
          </div>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
