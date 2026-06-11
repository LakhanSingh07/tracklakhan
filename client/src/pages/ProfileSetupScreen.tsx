import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import { ChevronLeft } from "lucide-react";

const TOTAL_STEPS = 8;

const ProgressDots = ({ current }: { current: number }) => (
  <div className="flex items-center gap-[6px]">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <motion.div
        key={i}
        animate={{ width: i === current ? 28 : 8, backgroundColor: i === current ? "#FF657D" : i < current ? "#FFB8C1" : "#FFE0E6" }}
        transition={{ duration: 0.3 }}
        className="h-2 rounded-full"
      />
    ))}
  </div>
);

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <motion.button
    onClick={onBack}
    whileTap={{ scale: 0.92 }}
    data-testid="button-back"
    className="w-11 h-11 rounded-[14px] bg-white/80 border border-gray-100 shadow-sm flex items-center justify-center"
  >
    <ChevronLeft size={22} className="text-gray-700" strokeWidth={2.2} />
  </motion.button>
);

const ContinueButton = ({ onClick, disabled = false, label = "Continue" }: { onClick: () => void; disabled?: boolean; label?: string }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    disabled={disabled}
    data-testid="button-continue"
    className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-md transition-opacity"
    style={{
      background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)",
      opacity: disabled ? 0.45 : 1,
    }}
  >
    {label}
  </motion.button>
);

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
};

export const ProfileSetupScreen = () => {
  const { navigate, updateUserProfile } = useApp();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState({ month: "", day: "", year: "" });
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [hasPCOS, setHasPCOS] = useState<boolean | null>(null);

  const goNext = () => {
    setDir(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) {
      navigate("auth-success");
      return;
    }
    setDir(-1);
    setStep(s => s - 1);
  };

  const handleFinish = () => {
    updateUserProfile({
      name,
      birthday: `${birthday.year}-${birthday.month.padStart(2, "0")}-${birthday.day.padStart(2, "0")}`,
      weight: parseFloat(weight) || 60,
      weightUnit,
      height: parseFloat(height) || 165,
      heightUnit,
      periodLength,
      cycleLength,
      lastPeriodDate: lastPeriodDate || new Date().toISOString().split("T")[0],
      hasPCOS: hasPCOS ?? false,
    });
    navigate("profile-preparing");
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const canContinue = [
    name.trim().length > 0,
    birthday.month && birthday.day && birthday.year,
    weight.trim().length > 0,
    height.trim().length > 0,
    true,
    true,
    true,
    true, // PCOS step — skip allowed
  ][step];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFFFFF 0%, #FFF0F2 100%)">
      <StatusBar />

      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center justify-between pt-3 pb-4">
          <BackButton onBack={goBack} />
          <ProgressDots current={step} />
          <div className="w-11 flex items-center justify-end">
            <span className="text-sm font-semibold text-gray-400">{step + 1}/{TOTAL_STEPS}</span>
          </div>
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Step 0: Name */}
            {step === 0 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">👋</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Tell Us Your Name
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    We'll use this to personalize your experience
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Your first name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maria"
                    autoFocus
                    data-testid="input-name"
                    className="w-full text-[18px] font-medium text-gray-900 placeholder-gray-300 bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Birthday */}
            {step === 1 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">🎂</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Tell Us Your Birthday
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    Your age helps us give you more accurate predictions
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Month</label>
                    <select
                      value={birthday.month}
                      onChange={e => setBirthday(b => ({ ...b, month: e.target.value }))}
                      data-testid="select-birth-month"
                      className="w-full text-[16px] font-medium text-gray-900 bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-100 focus:border-[#FF657D] transition-colors"
                    >
                      <option value="">Select month</option>
                      {months.map((m, i) => (
                        <option key={m} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Day</label>
                      <input
                        type="number"
                        min={1} max={31}
                        value={birthday.day}
                        onChange={e => setBirthday(b => ({ ...b, day: e.target.value }))}
                        placeholder="DD"
                        data-testid="input-birth-day"
                        className="w-full text-[16px] font-medium text-gray-900 bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-100 focus:border-[#FF657D] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Year</label>
                      <input
                        type="number"
                        min={1940} max={2010}
                        value={birthday.year}
                        onChange={e => setBirthday(b => ({ ...b, year: e.target.value }))}
                        placeholder="YYYY"
                        data-testid="input-birth-year"
                        className="w-full text-[16px] font-medium text-gray-900 bg-gray-50 rounded-xl px-4 py-3 outline-none border border-gray-100 focus:border-[#FF657D] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Weight */}
            {step === 2 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">⚖️</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Tell Us Your Weight
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    Weight can affect your cycle — this helps with personalization
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your weight</label>
                    <div className="flex bg-gray-100 rounded-xl p-0.5">
                      {(["kg", "lbs"] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => setWeightUnit(u)}
                          data-testid={`button-unit-${u}`}
                          className="px-3 py-1.5 rounded-[10px] text-sm font-semibold transition-all"
                          style={weightUnit === u ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)", color: "white" } : { color: "#9CA3AF" }}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder={weightUnit === "kg" ? "60" : "132"}
                      data-testid="input-weight"
                      className="flex-1 text-[40px] font-bold text-gray-900 placeholder-gray-200 bg-transparent outline-none"
                    />
                    <span className="text-[20px] font-medium text-gray-300">{weightUnit}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Height */}
            {step === 3 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">📏</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Tell Us Your Height
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    Used to calculate your healthy ranges more accurately
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your height</label>
                    <div className="flex bg-gray-100 rounded-xl p-0.5">
                      {(["cm", "ft"] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => setHeightUnit(u)}
                          data-testid={`button-unit-${u}`}
                          className="px-3 py-1.5 rounded-[10px] text-sm font-semibold transition-all"
                          style={heightUnit === u ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)", color: "white" } : { color: "#9CA3AF" }}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      placeholder={heightUnit === "cm" ? "165" : "5.4"}
                      data-testid="input-height"
                      className="flex-1 text-[40px] font-bold text-gray-900 placeholder-gray-200 bg-transparent outline-none"
                    />
                    <span className="text-[20px] font-medium text-gray-300">{heightUnit}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Period Length */}
            {step === 4 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">🩸</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Length of Your Period
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    On average, how many days does your period last?
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-gray-500">Duration</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[36px] font-bold" style={{ color: "#FF657D" }}>{periodLength}</span>
                      <span className="text-[16px] text-gray-400 font-medium">days</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6, 7, 8].map(d => (
                      <motion.button
                        key={d}
                        onClick={() => setPeriodLength(d)}
                        whileTap={{ scale: 0.92 }}
                        data-testid={`button-period-${d}`}
                        className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                        style={d === periodLength
                          ? { background: "linear-gradient(135deg, #FF8FA3, #FF657D)", color: "white", boxShadow: "0 4px 12px rgba(255,101,125,0.35)" }
                          : { background: "#FFF0F2", color: "#FFB0BF" }
                        }
                      >
                        {d}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs text-gray-300">Shorter</span>
                    <span className="text-xs text-gray-300">Longer</span>
                  </div>
                </div>

                <div className="bg-[#FFF5F7] rounded-2xl p-4 border border-[#FFE0E6]">
                  <p className="text-xs text-[#FF657D] font-medium">💡 Most periods last 3–7 days. The average is 5 days.</p>
                </div>
              </div>
            )}

            {/* Step 5: Cycle Length */}
            {step === 5 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">🔄</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Enter Your Cycle Length
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    Count from the first day of one period to the first day of the next
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-gray-500">Cycle length</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[36px] font-bold" style={{ color: "#FF657D" }}>{cycleLength}</span>
                      <span className="text-[16px] text-gray-400 font-medium">days</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={20}
                    max={45}
                    value={cycleLength}
                    onChange={e => setCycleLength(Number(e.target.value))}
                    data-testid="slider-cycle-length"
                    className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FF657D ${((cycleLength - 20) / 25) * 100}%, #FFE0E6 ${((cycleLength - 20) / 25) * 100}%)`
                    }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">20 days</span>
                    <span className="text-xs text-gray-400">45 days</span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { label: "Short", range: "20–24", val: 22 },
                      { label: "Average", range: "25–30", val: 28 },
                      { label: "Long", range: "31–45", val: 35 },
                    ].map(opt => (
                      <motion.button
                        key={opt.label}
                        onClick={() => setCycleLength(opt.val)}
                        whileTap={{ scale: 0.95 }}
                        className="py-2.5 px-2 rounded-xl border text-center transition-all"
                        style={cycleLength === opt.val
                          ? { borderColor: "#FF657D", background: "#FFF0F2" }
                          : { borderColor: "#F0F0F0", background: "#FAFAFA" }
                        }
                      >
                        <div className="text-xs font-bold" style={{ color: cycleLength === opt.val ? "#FF657D" : "#374151" }}>{opt.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{opt.range} days</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FFF5F7] rounded-2xl p-4 border border-[#FFE0E6]">
                  <p className="text-xs text-[#FF657D] font-medium">💡 The average cycle is 28 days, but 21–35 days is considered normal.</p>
                </div>
              </div>
            )}

            {/* Step 6: Last Period Start Date */}
            {step === 6 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-4xl mb-4">📅</div>
                  <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Start Date of Your Last Period
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    This helps us calculate your next period and fertile window
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">Select date</label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={e => setLastPeriodDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    data-testid="input-last-period-date"
                    className="w-full text-[18px] font-semibold text-gray-900 bg-gray-50 rounded-xl px-4 py-4 outline-none border border-gray-100 focus:border-[#FF657D] transition-colors"
                  />

                  {lastPeriodDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-xl bg-[#FFF0F2] border border-[#FFE0E6]"
                    >
                      <p className="text-xs text-[#FF657D] font-medium">
                        🎯 Your next period is estimated around{" "}
                        <strong>
                          {new Date(new Date(lastPeriodDate).getTime() + cycleLength * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                        </strong>
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="bg-[#FFF5F7] rounded-2xl p-4 border border-[#FFE0E6]">
                  <p className="text-xs text-[#FF657D] font-medium">💡 Don't remember exactly? Your best estimate is fine — we'll refine predictions over time.</p>
                </div>
              </div>
            )}

            {/* Step 7: PCOS */}
            {step === 7 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="text-4xl mb-4">🩺</div>
                  <h1 className="text-[26px] font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    PCOS Diagnosis
                  </h1>
                  <p className="text-[14px] text-gray-400 leading-relaxed">
                    Have you ever been diagnosed with Polycystic Ovary Syndrome (PCOS)?
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { value: true, label: "Yes, I have PCOS", icon: "🔴", desc: "FlowAI will enable PCOS-specific cycle tracking, predictions, and coaching." },
                    { value: false, label: "No, I don't have PCOS", icon: "🟢", desc: "Standard cycle tracking with regular predictions and insights." },
                  ].map((opt) => (
                    <motion.button
                      key={String(opt.value)}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setHasPCOS(opt.value)}
                      data-testid={`pcos-option-${opt.value}`}
                      className="w-full p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all"
                      style={{
                        borderColor: hasPCOS === opt.value ? "#FF657D" : "#F0F0F0",
                        background: hasPCOS === opt.value ? "#FFF0F3" : "white",
                      }}
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900">{opt.label}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{opt.desc}</p>
                      </div>
                      {hasPCOS === opt.value && (
                        <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-[#FF657D] flex items-center justify-center">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="rounded-2xl p-4 border border-[#DDD6FE]" style={{ background: "#F5F0FF" }}>
                  <p className="text-xs text-[#7C3AED] font-medium leading-relaxed">
                    🔒 <strong>Your health data is private.</strong> This helps us tailor predictions and advice — it's never shared with third parties.
                  </p>
                </div>

                {hasPCOS === null && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinish}
                    className="mt-4 text-[13px] text-gray-400 font-medium underline text-center w-full"
                  >
                    I'd rather not say — skip
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pb-6 pt-2">
          <ContinueButton
            onClick={step < TOTAL_STEPS - 1 ? goNext : handleFinish}
            disabled={!canContinue}
            label={step < TOTAL_STEPS - 1 ? "Continue" : "Build My Calendar"}
          />
        </div>
      </div>

      <HomeIndicator />
    </MobileLayout>
  );
};

export const ProfilePreparingScreen = () => {
  const { navigate } = useApp();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    "Analyzing your cycle data...",
    "Calculating predictions...",
    "Personalizing your calendar...",
    "Setting up your profile...",
    "Almost ready!",
  ];

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 4 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => navigate("home"), 600);
      }
      const clampedP = Math.min(p, 100);
      setProgress(clampedP);
      setPhase(Math.min(Math.floor((clampedP / 100) * (phases.length - 1)), phases.length - 1));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFF0F2 0%, #F8E8FF 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-28 h-28 mb-8"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#FFE0E6" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none" stroke="url(#prog-grad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              transition={{ duration: 0.3 }}
            />
            <defs>
              <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF8FA3" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[22px] font-bold" style={{ color: "#FF657D" }}>{Math.round(progress)}%</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-[26px] font-bold text-gray-900 text-center mb-3"
          style={{ fontFamily: "Instrument Sans, sans-serif" }}
        >
          Preparing Your Personal Calendar
        </motion.h1>

        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-[14px] text-gray-400 text-center mb-10"
          >
            {phases[phase]}
          </motion.p>
        </AnimatePresence>

        <div className="w-full space-y-3">
          {[
            { label: "Cycle predictions", icon: "📅" },
            { label: "Fertile window", icon: "🌸" },
            { label: "AI personalization", icon: "✨" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: progress > i * 30 ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/80"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
              {progress > (i + 1) * 30 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
