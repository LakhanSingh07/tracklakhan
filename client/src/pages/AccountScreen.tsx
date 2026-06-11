import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/lib/appContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Key, X, Smartphone, Clock, Trash2, ShieldCheck, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";


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
  const { navigate, user, authUser, isPremium } = useApp();
  const { t } = useTranslation();

  const isAdmin = authUser?.user_metadata?.is_admin === true || authUser?.email?.startsWith("admin@") || authUser?.email === "developer@flowai.app" || authUser?.email === "flowai@okaxis";

  const sections = [
    {
      title: "General",
      items: [
        { icon: "⚙️", label: t("preferences"), color: "#FF657D", bg: "#FFF0F3", screen: "preferences" as const },
        { icon: "🔔", label: t("reminder"), color: "#A78BFA", bg: "#F5F0FF", screen: "reminder" as const },
        { icon: "🔒", label: t("account_security"), color: "#60A5FA", bg: "#EFF6FF", screen: "account-security" as const },
        { icon: "🔗", label: t("linked_account"), color: "#34D399", bg: "#ECFDF5", screen: "account" as const },
        { icon: "💳", label: t("payment_method"), color: "#F59E0B", bg: "#FFFBEB", screen: "billing" as const },
        { icon: "📊", label: t("data_analytics"), color: "#EC4899", bg: "#FDF2F8", screen: "account" as const },
        { icon: "🎨", label: t("app_appearance"), color: "#8B5CF6", bg: "#F5F3FF", screen: "account" as const },
        { icon: "❓", label: t("help_support"), color: "#06B6D4", bg: "#ECFEFF", screen: "account" as const },
      ],
    },
    ...(isAdmin ? [
      {
        title: "Developer & Admin",
        items: [
          { icon: "🛠️", label: "Merchant Account", color: "#6366F1", bg: "#EEF2FF", screen: "merchant-config" as const },
        ],
      }
    ] : []),
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />
        <div className="flex-1 overflow-y-auto pb-2">
          <div className="px-5 pt-2 pb-4">
            <h1 className="text-[22px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>{t("account_settings")}</h1>
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
              <div className="flex items-center gap-1.5">
                <p className="text-[17px] font-bold text-gray-900">{user.name}</p>
                {isPremium && (
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    👑 Pro
                  </span>
                )}
              </div>
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
            onClick={() => navigate(isPremium ? "billing" : "premium")}
            className="mx-5 rounded-3xl p-5 mb-4 relative overflow-hidden shadow-md"
            style={{ 
              background: isPremium 
                ? "linear-gradient(135deg, #2A2438 0%, #352F44 100%)" 
                : "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)",
              border: isPremium ? "1px solid rgba(245, 158, 11, 0.3)" : "none"
            }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-4 translate-x-4" />
            {isPremium && (
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-yellow-500/10 blur-xl" />
            )}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👑</span>
                  <span className="text-white font-bold text-[15px]">
                    {isPremium ? t("active_premium") : t("upgrade_premium")}
                  </span>
                </div>
                <p className="text-white/80 text-xs">
                  {isPremium ? "Full access unlocked. Thank you for supporting us!" : "Unlock advanced insights & features"}
                </p>
              </div>
              <div className={isPremium ? "bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl px-3 py-1.5 shadow-sm" : "bg-white rounded-xl px-3 py-1.5"}>
                <span className={isPremium ? "text-white text-xs font-bold" : "text-[#FF657D] text-xs font-bold"}>
                  {isPremium ? t("active") : t("try_free")}
                </span>
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
  const { navigate, signOut } = useApp();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log out.");
    }
  };

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
            {error && <p className="mb-4 text-center text-[13px] font-medium text-red-500">{error}</p>}
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
                onClick={handleLogout}
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
  const {
    navigate,
    user,
    birthday,
    weight,
    weightUnit,
    height,
    heightUnit,
    hasPCOS,
    updateUserProfile,
    cycleData,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [bday, setBday] = useState(birthday);
  const [wt, setWt] = useState(String(weight));
  const [ht, setHt] = useState(String(height));
  const [pcos, setPcos] = useState(hasPCOS);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (birthday && !bday) setBday(birthday);
    if (weight && (wt === "60" || wt === "0" || wt === "")) setWt(String(weight));
    if (height && (ht === "165" || ht === "0" || ht === "")) setHt(String(height));
    setPcos(hasPCOS);
  }, [birthday, weight, height, hasPCOS]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        name,
        birthday: bday,
        weight: parseFloat(wt) || 60,
        weightUnit: weightUnit,
        height: parseFloat(ht) || 165,
        heightUnit: heightUnit,
        periodLength: cycleData.periodLength,
        cycleLength: cycleData.cycleLength,
        lastPeriodDate: cycleData.lastPeriodStart.toISOString().split("T")[0],
        hasPCOS: pcos,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("account");
      }, 1500);
    } catch (err) {
      console.error("Error saving personal data:", err);
    } finally {
      setSaving(false);
    }
  };

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

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-lg mb-2 cursor-pointer"
            >
              <span className="text-white text-3xl font-bold">{name[0] || user.name[0]}</span>
            </motion.div>
            <p className="text-[16px] font-bold text-gray-900">{name || user.name}</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4 mb-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name"
                className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] transition-colors font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Birth Date</label>
              <input
                type="date"
                value={bday}
                onChange={e => setBday(e.target.value)}
                className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] transition-colors font-medium text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Weight ({weightUnit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={wt}
                  onChange={e => setWt(e.target.value)}
                  placeholder="60"
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] transition-colors font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Height ({heightUnit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={ht}
                  onChange={e => setHt(e.target.value)}
                  placeholder="165"
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] transition-colors font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-800">PCOS Diagnosis</p>
                <p className="text-[10px] text-gray-400">Polycystic Ovary Syndrome settings</p>
              </div>
              <button
                type="button"
                onClick={() => setPcos(!pcos)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${pcos ? "bg-[#FF657D]" : "bg-gray-200"}`}
              >
                <motion.div
                  animate={{ x: pcos ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow"
                />
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg mb-4 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl mx-10"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                  <path d="M2 12L12 22L30 2" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[18px] font-bold text-gray-900">Changes Saved!</p>
              <p className="text-[12px] text-gray-400 mt-1 text-center">Your profile has been updated</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeIndicator />
    </MobileLayout>
  );
};

export const PreferencesScreen = () => {
  const { t } = useTranslation();
  const {
    navigate,
    weightUnit,
    heightUnit,
    waterGoal,
    stepsGoal,
    sleepGoal,
    updateUserProfile,
    setWaterGoal,
    setStepsGoal,
    setSleepGoal,
    user,
    birthday,
    weight,
    height,
    hasPCOS,
    cycleData,
    language,
    currency,
    setAppLanguage,
    setAppCurrency,
  } = useApp();

  const [wtUnit, setWtUnit] = useState<"kg" | "lbs">(weightUnit);
  const [htUnit, setHtUnit] = useState<"cm" | "ft">(heightUnit);
  const [waterTarget, setWaterTarget] = useState(String(waterGoal));
  const [stepsTarget, setStepsTarget] = useState(String(stepsGoal));
  const [sleepTarget, setSleepTarget] = useState(String(sleepGoal));
  const [langInput, setLangInput] = useState(language);
  const [currInput, setCurrInput] = useState(currency);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (weightUnit) setWtUnit(weightUnit);
    if (heightUnit) setHtUnit(heightUnit);
    if (waterGoal) setWaterTarget(String(waterGoal));
    if (stepsGoal) setStepsTarget(String(stepsGoal));
    if (sleepGoal) setSleepTarget(String(sleepGoal));
    if (language) setLangInput(language);
    if (currency) setCurrInput(currency);
  }, [weightUnit, heightUnit, waterGoal, stepsGoal, sleepGoal, language, currency]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        name: user.name,
        birthday: birthday,
        weight: weight,
        weightUnit: wtUnit,
        height: height,
        heightUnit: htUnit,
        periodLength: cycleData.periodLength,
        cycleLength: cycleData.cycleLength,
        lastPeriodDate: cycleData.lastPeriodStart.toISOString().split("T")[0],
        hasPCOS: hasPCOS,
      });

      const wat = parseInt(waterTarget);
      if (!isNaN(wat) && wat > 0) await setWaterGoal(wat);

      const stp = parseInt(stepsTarget);
      if (!isNaN(stp) && stp > 0) await setStepsGoal(stp);

      const slp = parseFloat(sleepTarget);
      if (!isNaN(slp) && slp > 0) await setSleepGoal(slp);

      await setAppLanguage(langInput);
      await setAppCurrency(currInput);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("account");
      }, 1500);
    } catch (err) {
      console.error("Error saving preferences:", err);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Preferences</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Section 1: Measurement Units */}
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4 mb-4">
            <h3 className="text-[14px] font-bold text-gray-800 mb-2">Display Units</h3>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-800">Weight Unit</p>
                <p className="text-[10px] text-gray-400">Preferred unit for weight logs</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["kg", "lbs"] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setWtUnit(u)}
                    className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                    style={wtUnit === u ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)", color: "white" } : { color: "#9CA3AF" }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">Height Unit</p>
                <p className="text-[10px] text-gray-400">Preferred unit for height measurements</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["cm", "ft"] as const).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setHtUnit(u)}
                    className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                    style={htUnit === u ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)", color: "white" } : { color: "#9CA3AF" }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Language & Region */}
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4 mb-4">
            <h3 className="text-[14px] font-bold text-gray-800 mb-2">{t("language")} & {t("currency")}</h3>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-800">{t("language")}</p>
                <p className="text-[10px] text-gray-400">App interface language</p>
              </div>
              <select
                value={langInput}
                onChange={e => setLangInput(e.target.value)}
                className="bg-gray-100 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none border border-transparent focus:border-[#FF657D]"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">Preferred {t("currency")}</p>
                <p className="text-[10px] text-gray-400">Currency for pricing details</p>
              </div>
              <select
                value={currInput}
                onChange={e => setCurrInput(e.target.value)}
                className="bg-gray-100 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none border border-transparent focus:border-[#FF657D]"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Health Goals */}
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4 mb-4">
            <h3 className="text-[14px] font-bold text-gray-800 mb-2">Daily Health Goals</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Water Intake (ml)</label>
                <input
                  type="number"
                  value={waterTarget}
                  onChange={e => setWaterTarget(e.target.value)}
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Daily Steps</label>
                <input
                  type="number"
                  value={stepsTarget}
                  onChange={e => setStepsTarget(e.target.value)}
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Sleep Duration (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepTarget}
                  onChange={e => setSleepTarget(e.target.value)}
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] font-semibold text-gray-800"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg mb-4 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : t("save_preferences")}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl mx-10"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
                  <path d="M2 12L12 22L30 2" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-[18px] font-bold text-gray-900">{t("success_pref")}</p>
              <p className="text-[12px] text-gray-400 mt-1 text-center">Your goals and units have been updated</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeIndicator />
    </MobileLayout>
  );
};
const playSynthesizedTone = (toneName: string, vol: number) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime((vol / 100) * 0.15, ctx.currentTime);
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;
    
    if (toneName === "Classic") {
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.connect(gainNode);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      osc2.connect(gainNode);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);
    } else if (toneName === "Soft Chime") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime((vol / 100) * 0.12, now + idx * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4);
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.45);
      });
    } else if (toneName === "Digital Alert") {
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1100, now);
      osc1.connect(gainNode);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1100, now + 0.12);
      osc2.connect(gainNode);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.2);
    } else if (toneName === "Sweet Bell") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime((vol / 100) * 0.18, now);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(bellGain);
      bellGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    }
  } catch (err) {
    console.error("Synthesizer error:", err);
  }
};

export const ReminderScreen = () => {
  const {
    navigate,
    periodReminder,
    setPeriodReminder,
    fertileReminder,
    setFertileReminder,
    logReminder,
    setLogReminder,
    ovulationReminder,
    setOvulationReminder,
    alertVolume,
    setAlertVolume,
    alertRingtone,
    setAlertRingtone,
  } = useApp();

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

        <div className="flex-1 overflow-y-auto space-y-4 pb-6">
          {[
            { label: "Period Reminder", time: "2 days before", enabled: periodReminder, toggle: () => setPeriodReminder(!periodReminder) },
            { label: "Fertile Window", time: "1 day before", enabled: fertileReminder, toggle: () => setFertileReminder(!fertileReminder) },
            { label: "Log Reminder", time: "Every day 8:00 PM", enabled: logReminder, toggle: () => setLogReminder(!logReminder) },
            { label: "Ovulation Alert", time: "On the day", enabled: ovulationReminder, toggle: () => setOvulationReminder(!ovulationReminder) },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[14px] font-semibold text-gray-800">{r.label}</p>
                <p className="text-xs text-gray-400">{r.time}</p>
              </div>
              <div 
                onClick={r.toggle}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${r.enabled ? "bg-[#FF657D]" : "bg-gray-200"}`}
              >
                <motion.div
                  animate={{ x: r.enabled ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow"
                />
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-[14px] font-bold text-gray-800">Alert Sound Settings</h3>
            
            {/* Volume slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-medium">Volume</span>
                <span className="text-xs text-[#FF657D] font-bold">{alertVolume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">🔈</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full relative">
                  <motion.div className="absolute left-0 top-0 h-full rounded-full bg-[#A78BFA]" style={{ width: `${alertVolume}%` }} />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={alertVolume}
                    onChange={e => setAlertVolume(Number(e.target.value))}
                    onMouseUp={() => playSynthesizedTone(alertRingtone, alertVolume)}
                    onTouchEnd={() => playSynthesizedTone(alertRingtone, alertVolume)}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer"
                  />
                </div>
                <span className="text-gray-400 text-sm">🔊</span>
              </div>
            </div>

            {/* Ringtones list */}
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-500 font-medium block mb-2">Select Ringtone</span>
              <div className="space-y-2">
                {[
                  { name: "Classic", icon: "🔔", desc: "Traditional two-tone chime" },
                  { name: "Soft Chime", icon: "✨", desc: "Dreamy music-box arpeggio" },
                  { name: "Digital Alert", icon: "⚡", desc: "Double high-frequency beep" },
                  { name: "Sweet Bell", icon: "🎐", desc: "Soft resonant bell note" },
                ].map(item => (
                  <motion.button
                    key={item.name}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAlertRingtone(item.name);
                      playSynthesizedTone(item.name, alertVolume);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${alertRingtone === item.name ? "border-[#FF657D] bg-[#FFF0F3]" : "border-gray-100 bg-white"}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                      <span className="text-xs text-[#FF657D]">{alertRingtone === item.name ? "▶️" : "🔈"}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AccountSecurityScreen = () => {
  const { navigate, authSession, signOut } = useApp();
  
  // Modals state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showTfaModal, setShowTfaModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [showPwdSuccessToast, setShowPwdSuccessToast] = useState(false);

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showOAuthInfoModal, setShowOAuthInfoModal] = useState(false);

  // MFA Enrollment Form States
  const [showMfaEnrollModal, setShowMfaEnrollModal] = useState(false);
  const [enrollQrCode, setEnrollQrCode] = useState("");
  const [enrollSecret, setEnrollSecret] = useState("");
  const [enrollFactorId, setEnrollFactorId] = useState("");
  const [enrollOtp, setEnrollOtp] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Global sign-out state
  const [globalSignOutLoading, setGlobalSignOutLoading] = useState(false);

  // Capture session load time for log view
  const [sessionLoadTime] = useState(() => new Date().toLocaleString());

  const oauthProvider = authSession?.user?.app_metadata?.provider;
  const isOAuthUser = oauthProvider && oauthProvider !== "email";
  const providerName = oauthProvider ? oauthProvider.charAt(0).toUpperCase() + oauthProvider.slice(1) : "";

  // Load MFA status on load
  useEffect(() => {
    const fetchMfaStatus = async () => {
      if (!authSession?.user) return;
      try {
        const { data, error } = await supabase!.auth.mfa.listFactors();
        if (!error && data?.all) {
          const hasVerified = data.all.some((f: any) => f.status === "verified");
          setTfaEnabled(hasVerified);
        }
      } catch (err) {
        console.error("MFA load error:", err);
      }
    };
    fetchMfaStatus();
  }, [authSession]);

  // User agent parsing helper for Device Management
  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let os = "Windows PC";
    let browser = "Chrome Browser";
    let icon = "💻";
    
    if (/windows/i.test(ua)) os = "Windows PC";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS Device";
    else if (/iphone|ipad|ipod/i.test(ua)) { os = "iOS Device"; icon = "📱"; }
    else if (/android/i.test(ua)) { os = "Android Device"; icon = "📱"; }
    else if (/linux/i.test(ua)) os = "Linux PC";
    
    if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) browser = "Chrome Browser";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari Browser";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/edge|edg/i.test(ua)) browser = "Edge Browser";
    
    return { os, browser, icon };
  };

  const { os: clientOS, browser: clientBrowser, icon: clientIcon } = getDeviceDetails();

  // Dynamic validation checks for New Password
  const isLengthValid = newPassword.length >= 8;
  const isCaseValid = /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword);
  const isNumOrSpecialValid = /[\d!@#$%\^&*(),.?":{}|<>]/.test(newPassword);

  let strengthScore = 0;
  if (newPassword.length > 0) {
    if (newPassword.length >= 6) strengthScore += 1;
    if (isLengthValid) strengthScore += 1;
    if (isCaseValid) strengthScore += 1;
    if (isNumOrSpecialValid) strengthScore += 1;
  }

  // Handlers
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthScore < 4) {
      setPwdError("Please satisfy all password complexity requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    
    setPwdLoading(true);
    setPwdError("");
    try {
      // 1. Verify current password by attempting a sign-in check
      const { error: verifyError } = await supabase!.auth.signInWithPassword({
        email: authSession?.user?.email || "",
        password: currentPassword
      });
      
      if (verifyError) {
        setPwdError("Incorrect current password.");
        setPwdLoading(false);
        return;
      }

      // 2. Update to the new password
      const { error: updateError } = await supabase!.auth.updateUser({ password: newPassword });
      if (updateError) {
        setPwdError(updateError.message);
        setPwdLoading(false);
        return;
      }

      // Clear states & show success toast
      setShowPwdModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPwdSuccessToast(true);
      setTimeout(() => {
        setShowPwdSuccessToast(false);
      }, 3000);
    } catch (err: any) {
      setPwdError(err.message || "Failed to update password.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleTfaToggleClick = async () => {
    if (tfaEnabled) {
      if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
      setPwdLoading(true);
      try {
        const { data, error } = await supabase!.auth.mfa.listFactors();
        if (error) throw error;
        const verifiedFactors = data?.all?.filter((f: any) => f.status === "verified") || [];
        for (const factor of verifiedFactors) {
          const { error: unenrollErr } = await supabase!.auth.mfa.unenroll({ factorId: factor.id });
          if (unenrollErr) throw unenrollErr;
        }
        setTfaEnabled(false);
        localStorage.removeItem("flowai_tfa_enabled");
        
        setShowTfaModal(true);
        setTimeout(() => setShowTfaModal(false), 2000);
      } catch (err: any) {
        alert(err.message || "Failed to disable 2FA");
      } finally {
        setPwdLoading(false);
      }
    } else {
      setEnrollLoading(true);
      setEnrollError("");
      setEnrollOtp("");
      setCopiedSecret(false);
      try {
        const { data, error } = await supabase!.auth.mfa.enroll({
          factorType: "totp",
          issuer: "FlowAI",
          friendlyName: authSession?.user?.email || "FlowAI User"
        });
        if (error) throw error;
        
        setEnrollFactorId(data.id);
        if (data.totp?.qr_code) {
          setEnrollQrCode(data.totp.qr_code);
        }
        if (data.totp?.secret) {
          setEnrollSecret(data.totp.secret);
        }
        setShowMfaEnrollModal(true);
      } catch (err: any) {
        alert(err.message || "Failed to initiate MFA enrollment");
      } finally {
        setEnrollLoading(false);
      }
    }
  };

  const handleMfaEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enrollOtp.length !== 6 || enrollLoading) return;
    setEnrollLoading(true);
    setEnrollError("");
    try {
      const { data: chalData, error: chalErr } = await supabase!.auth.mfa.challenge({ factorId: enrollFactorId });
      if (chalErr) throw chalErr;
      
      const { error: verifyErr } = await supabase!.auth.mfa.verify({
        factorId: enrollFactorId,
        challengeId: chalData.id,
        code: enrollOtp.trim()
      });
      if (verifyErr) throw verifyErr;
      
      setTfaEnabled(true);
      localStorage.setItem("flowai_tfa_enabled", "true");
      setShowMfaEnrollModal(false);
      
      setShowTfaModal(true);
      setTimeout(() => setShowTfaModal(false), 2000);
    } catch (err: any) {
      setEnrollError(err.message || "Failed to verify code. Please verify you scanned correctly.");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleGlobalSignOut = async () => {
    if (!confirm("Are you sure you want to sign out everywhere? This will end all browser and app sessions.")) return;
    setGlobalSignOutLoading(true);
    try {
      const { error } = await supabase!.auth.signOut({ scope: "global" });
      if (error) throw error;
      await signOut();
    } catch (err: any) {
      alert(err.message || "Failed to sign out globally");
    } finally {
      setGlobalSignOutLoading(false);
      setShowDeviceModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!authSession?.user) return;
    setDeleteLoading(true);
    try {
      // 1. Delete profiles row (cascades to health_logs, water_logs, steps_logs, sleep_logs)
      await supabase!
        .from("profiles")
        .delete()
        .eq("id", authSession.user.id);

      // 2. Sign out
      await signOut();
    } catch (err) {
      console.error("Error deleting account:", err);
      await signOut();
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

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
            {/* Change Password row */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => isOAuthUser ? setShowOAuthInfoModal(true) : setShowPwdModal(true)}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Key size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-gray-800">Change Password</p>
                <p className="text-[11px] text-gray-400">
                  {isOAuthUser ? `Managed via ${providerName}` : "Update account security keys"}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            {/* Two-Factor Authentication row */}
            <div className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                <Shield size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-gray-800">Two-Factor Auth (2FA)</p>
                <p className="text-[11px] text-gray-400">Secure logins via Authenticator App</p>
              </div>
              <button
                type="button"
                onClick={handleTfaToggleClick}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${tfaEnabled ? "bg-[#34D399]" : "bg-gray-200"}`}
              >
                <motion.div
                  animate={{ x: tfaEnabled ? 20 : 0 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>

            {/* Device Management row */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeviceModal(true)}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Smartphone size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-gray-800">Device Management</p>
                <p className="text-[11px] text-gray-400">1 active device session</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>

            {/* Login Activity row */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowActivityModal(true)}
              className="w-full flex items-center gap-3 px-5 py-4"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Clock size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-gray-800">Login Activity</p>
                <p className="text-[11px] text-gray-400">Review recent sign-in history</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Delete Account row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
            className="bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer border border-red-50 hover:border-red-100 transition-colors"
          >
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-red-500">Delete Account</p>
                <p className="text-xs text-gray-400 mt-0.5">Permanently remove profile data & logs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <AnimatePresence>
        {showPwdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowPwdModal(false);
                  setPwdError("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                🔑 Change Password
              </h3>
              <p className="text-xs text-gray-500 mb-4">Update your password to keep your FlowAI account secure.</p>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full text-sm border rounded-xl pl-4 pr-10 py-3 outline-none transition-all font-medium text-gray-800 ${
                        pwdError && currentPassword ? "border-red-200 focus:border-red-400 bg-red-50/10" :
                        currentPassword ? "border-gray-200 focus:border-[#FF657D]" : "border-gray-100 focus:border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      className={`w-full text-sm border rounded-xl pl-4 pr-10 py-3 outline-none transition-all font-medium text-gray-800 ${
                        !newPassword ? "border-gray-100 focus:border-gray-300" :
                        strengthScore === 4 ? "border-emerald-200 focus:border-emerald-400 bg-emerald-50/10" :
                        "border-red-200 focus:border-red-400 bg-red-50/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength Bar */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              index <= strengthScore
                                ? strengthScore === 1
                                  ? "bg-red-400"
                                  : strengthScore === 2
                                  ? "bg-orange-400"
                                  : strengthScore === 3
                                  ? "bg-blue-400"
                                  : "bg-emerald-500"
                                : "bg-gray-100"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
                        <span className="text-gray-400">Password Strength</span>
                        <span className={
                          strengthScore === 1 ? "text-red-500" :
                          strengthScore === 2 ? "text-orange-500" :
                          strengthScore === 3 ? "text-blue-500" :
                          "text-emerald-600"
                        }>
                          {strengthScore === 1 && "Weak"}
                          {strengthScore === 2 && "Fair"}
                          {strengthScore === 3 && "Good"}
                          {strengthScore === 4 && "Strong"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Requirements list */}
                  <div className="mt-2.5 space-y-1.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        isLengthValid ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 bg-white"
                      }`}>
                        {isLengthValid ? <Check size={10} strokeWidth={3} /> : <div className="w-1 h-1 rounded-full bg-gray-300" />}
                      </div>
                      <span className={isLengthValid ? "text-gray-600 font-medium" : "text-gray-400"}>
                        At least 8 characters
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        isCaseValid ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 bg-white"
                      }`}>
                        {isCaseValid ? <Check size={10} strokeWidth={3} /> : <div className="w-1 h-1 rounded-full bg-gray-300" />}
                      </div>
                      <span className={isCaseValid ? "text-gray-600 font-medium" : "text-gray-400"}>
                        Uppercase & lowercase letters
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        isNumOrSpecialValid ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 bg-white"
                      }`}>
                        {isNumOrSpecialValid ? <Check size={10} strokeWidth={3} /> : <div className="w-1 h-1 rounded-full bg-gray-300" />}
                      </div>
                      <span className={isNumOrSpecialValid ? "text-gray-600 font-medium" : "text-gray-400"}>
                        At least 1 number or symbol
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className={`w-full text-sm border rounded-xl pl-4 pr-10 py-3 outline-none transition-all font-medium text-gray-800 ${
                        !confirmPassword ? "border-gray-100 focus:border-gray-300" :
                        confirmPassword === newPassword && strengthScore === 4 ? "border-emerald-200 focus:border-emerald-400 bg-emerald-50/10" :
                        "border-red-200 focus:border-red-400 bg-red-50/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                      {confirmPassword === newPassword ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">✓ Passwords match</span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-0.5">✗ Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                {pwdError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{pwdError}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPwdModal(false);
                      setPwdError("");
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-sm text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pwdLoading || strengthScore < 4 || newPassword !== confirmPassword || !currentPassword}
                    className="flex-1 py-3 bg-[#FF657D] text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff4e6a] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {pwdLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- OAUTH PASSWORD INFO MODAL --- */}
      <AnimatePresence>
        {showOAuthInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm relative text-center"
            >
              <button
                type="button"
                onClick={() => setShowOAuthInfoModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4 text-xl">
                👤
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                Managed via {providerName}
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                You log in using your <strong>{providerName}</strong> account. Password updates, multi-factor settings, and login credentials are managed securely by <strong>{providerName}</strong>. 
                <br /><br />
                You do not need to create or manage a separate password within FlowAI.
              </p>

              <button
                type="button"
                onClick={() => setShowOAuthInfoModal(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-sm text-gray-600 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MFA ENROLLMENT MODAL --- */}
      <AnimatePresence>
        {showMfaEnrollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm relative"
            >
              <button
                type="button"
                onClick={() => setShowMfaEnrollModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                🔒 Secure with 2FA
              </h3>
              <p className="text-xs text-gray-500 mb-4">Scan the code or copy the key below into your Authenticator app.</p>

              <form onSubmit={handleMfaEnrollSubmit} className="space-y-4">
                {enrollQrCode && (
                  <div className="flex flex-col items-center justify-center border border-gray-100 p-3 rounded-2xl bg-gray-50/50">
                    <img src={enrollQrCode} alt="TOTP QR Code" className="w-32 h-32" />
                    <span className="text-[10px] text-gray-400 mt-1">Scan using Google Authenticator / Authy</span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Manual Entry Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={enrollSecret}
                      className="flex-1 text-xs border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 outline-none font-mono text-gray-600 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(enrollSecret);
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="px-3.5 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      {copiedSecret ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={enrollOtp}
                    onChange={e => setEnrollOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#FF657D] font-medium text-gray-800 tracking-[2px]"
                  />
                </div>

                {enrollError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{enrollError}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMfaEnrollModal(false)}
                    className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-sm text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={enrollLoading || enrollOtp.length !== 6}
                    className="flex-1 py-3 bg-[#FF657D] text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ff4e6a] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {enrollLoading ? "Verifying..." : "Verify & Enable"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TFA SUCCESS TOAST --- */}
      <AnimatePresence>
        {showTfaModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-6 right-6 z-50 flex justify-center"
          >
            <div className="bg-gray-900 text-white rounded-2xl px-5 py-3.5 flex items-center gap-2.5 shadow-xl">
              <ShieldCheck size={18} className="text-[#34D399]" />
              <span className="text-xs font-medium">
                {tfaEnabled ? "Two-Factor Auth (2FA) Activated!" : "Two-Factor Auth Deactivated"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PWD SUCCESS TOAST --- */}
      <AnimatePresence>
        {showPwdSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-6 right-6 z-50 flex justify-center"
          >
            <div className="bg-gray-900 text-white rounded-2xl px-5 py-3.5 flex items-center gap-2.5 shadow-xl">
              <ShieldCheck size={18} className="text-green-400" />
              <span className="text-xs font-medium">
                Password updated successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DEVICE MANAGEMENT MODAL --- */}
      <AnimatePresence>
        {showDeviceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm relative"
            >
              <button
                type="button"
                onClick={() => setShowDeviceModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                📱 Active Devices
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-2xl">{clientIcon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-800">Current Session</p>
                      <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Active Now</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{clientOS} · {clientBrowser}</p>
                    {authSession?.expires_at && (
                      <p className="text-[9px] text-[#A78BFA] font-medium mt-1">
                        Token expires: {new Date(authSession.expires_at * 1000).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 text-center leading-relaxed">
                  To secure your account from other locations, you can log out of all active devices.
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleGlobalSignOut}
                  disabled={globalSignOutLoading}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {globalSignOutLoading ? "Signing out everywhere..." : "Sign Out of All Devices"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeviceModal(false)}
                  className="w-full py-3 bg-gray-100 rounded-xl font-semibold text-xs text-gray-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LOGIN ACTIVITY MODAL --- */}
      <AnimatePresence>
        {showActivityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm relative"
            >
              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                📋 Login Activity
              </h3>
              <p className="text-xs text-gray-400 mb-4">Review recent sign-in history on your account.</p>

              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 mb-6">
                <div className="flex justify-between items-start py-2 border-b border-gray-50 text-xs gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{sessionLoadTime}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">FlowAI Session · {clientBrowser}</p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">Current</span>
                </div>

                {authSession?.user?.last_sign_in_at && (
                  <div className="flex justify-between items-start py-2 border-b border-gray-50 text-xs gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(authSession.user.last_sign_in_at).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Authorization Verification · Supabase</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">Success</span>
                  </div>
                )}

                {authSession?.user?.created_at && (
                  <div className="flex justify-between items-start py-2 border-b border-gray-50 text-xs gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(authSession.user.created_at).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">FlowAI Account Created</p>
                    </div>
                    <span className="bg-purple-50 text-purple-600 font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">Registered</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowActivityModal(false)}
                className="w-full py-3 bg-gray-100 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DELETE ACCOUNT CONFIRM MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm relative"
            >
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-2xl mb-4">
                  ⚠️
                </div>
                <h3 className="text-[18px] font-bold text-gray-900 mb-2 leading-tight">
                  Delete Your Account?
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Are you absolutely sure? This will permanently erase your profile and all your steps, water, sleep, and period history logs. This action is irreversible.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-sm text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-75"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HomeIndicator />
    </MobileLayout>
  );
};

export const MerchantConfigScreen = () => {
  const { navigate, merchantUpiId, merchantName, cardGatewayProvider, cardGatewayKey, updateMerchantConfig } = useApp();
  
  const [upiInput, setUpiInput] = useState(merchantUpiId);
  const [nameInput, setNameInput] = useState(merchantName);
  const [providerInput, setProviderInput] = useState<"stripe" | "razorpay" | "mock">(cardGatewayProvider);
  const [keyInput, setKeyInput] = useState(cardGatewayKey);
  const [errorMsg, setErrorMsg] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSaveSuccess(false);

    // Validate VPA
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiInput.trim())) {
      setErrorMsg("Please enter a valid receiver UPI ID (VPA) like name@bank");
      return;
    }

    if (!nameInput.trim()) {
      setErrorMsg("Merchant descriptor/name is required");
      return;
    }

    updateMerchantConfig({
      upiId: upiInput.trim(),
      name: nameInput.trim(),
      provider: providerInput,
      key: keyInput.trim()
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      navigate("account");
    }, 1500);
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 pt-3 pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("account")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Merchant Account</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xs font-bold text-[#FF657D] uppercase tracking-wider">UPI Settlement Settings</h3>
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Your Receiver UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  value={upiInput}
                  onChange={e => setUpiInput(e.target.value)}
                  placeholder="e.g. yourname@ybl"
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                />
                <p className="text-[10px] text-gray-400 mt-1">Payments made by customers via QR code or app will land directly here.</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Merchant Business Descriptor</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Flowly Inc"
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                />
                <p className="text-[10px] text-gray-400 mt-1">This business name is displayed during transaction verification.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xs font-bold text-[#FF657D] uppercase tracking-wider">Credit Card Gateway (Stripe/Razorpay)</h3>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Gateway Provider</label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                  {(["stripe", "razorpay", "mock"] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProviderInput(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${providerInput === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Publishable API Key / Key ID</label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder="pk_test_... or rzp_test_..."
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                />
                <p className="text-[10px] text-gray-400 mt-1">Publishable key token used to execute client checkout integrations.</p>
              </div>
            </div>

            {errorMsg && <p className="text-xs font-semibold text-red-500 text-center">{errorMsg}</p>}
            
            {saveSuccess && (
              <p className="text-xs font-bold text-emerald-500 text-center">
                ✓ Settings saved successfully! Redirecting...
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("account")}
                className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#FF657D] text-white rounded-xl font-bold text-xs shadow-md"
              >
                Save Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
