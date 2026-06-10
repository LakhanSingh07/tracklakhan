import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";

export const AuthSignUp = () => {
  const { navigate } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  if (showForm) {
    return (
      <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
        <div className="flex flex-col h-screen">
          <StatusBar />
          <div className="flex-1 px-5 pt-4 pb-6 overflow-y-auto">
            <motion.button
              onClick={() => setShowForm(false)}
              className="mb-6 flex items-center gap-2 text-gray-600"
              whileTap={{ scale: 0.95 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-[28px] font-bold text-gray-900 mb-1" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                Create Account
              </h1>
              <p className="text-gray-400 text-sm mb-8">Enter your email to get started</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-[#FF657D] transition-colors"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${agreed ? "bg-[#FF657D] border-[#FF657D]" : "border-gray-300"}`}
                  >
                    {agreed && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    I agree to the{" "}
                    <span className="text-[#FF657D] font-medium">Privacy Policy</span> and{" "}
                    <span className="text-[#FF657D] font-medium">Terms of Service</span>
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => email && agreed && navigate("auth-otp")}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-4 rounded-2xl text-white font-semibold text-[16px] mt-8 transition-opacity ${email && agreed ? "opacity-100" : "opacity-50"}`}
                style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
              >
                Continue
              </motion.button>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                {[
                  { icon: "G", label: "Continue with Google", color: "#4285F4" },
                  { icon: "A", label: "Continue with Apple", color: "#000" },
                  { icon: "f", label: "Continue with Facebook", color: "#1877F2" },
                ].map((s) => (
                  <motion.button
                    key={s.label}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-3 font-medium text-sm text-gray-700"
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: s.color }}>{s.icon}</span>
                    {s.label}
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <button onClick={() => navigate("auth-signin")} className="text-[#FF657D] font-semibold">Sign In</button>
              </p>
            </motion.div>
          </div>
          <HomeIndicator />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFF0F3 0%, #FFE1E7 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-6 flex flex-col items-center gap-3"
          >
            {/* New FlowAI logo */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" }}
            >
              <svg width="52" height="52" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="29" fill="rgba(255,255,255,0.15)" />
                <path d="M12 30 Q18 20 24 28 Q30 36 36 26 Q42 16 50 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6"/>
                <path d="M10 36 Q16 26 22 34 Q28 42 34 32 Q40 22 48 30" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35"/>
                <path d="M30 13 L31.8 19.5 L38.5 21 L31.8 22.5 L30 29 L28.2 22.5 L21.5 21 L28.2 19.5 Z" fill="white" opacity="0.95"/>
                <circle cx="20" cy="40" r="2.2" fill="white" opacity="0.55"/>
                <circle cx="30" cy="44" r="1.8" fill="white" opacity="0.4"/>
                <circle cx="40" cy="40" r="2.2" fill="white" opacity="0.55"/>
              </svg>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-[26px]" style={{ fontFamily: "Instrument Sans, sans-serif", background: "linear-gradient(135deg, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Flow</span>
              <span className="font-extrabold text-[26px]" style={{ fontFamily: "Instrument Sans, sans-serif", background: "linear-gradient(135deg, #EC4899, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
              <span className="ml-1 text-sm">✨</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[26px] font-bold text-gray-900 text-center mb-2"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            Welcome to FlowAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-center text-[13px] px-8 mb-10 leading-relaxed"
          >
            Know Your Cycle. Own Your Health. Powered by AI ✨
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full space-y-3"
          >
            <motion.button
              onClick={() => setShowForm(true)}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            >
              Sign Up with Email
            </motion.button>

            {[
              { icon: "G", label: "Sign Up with Google", color: "#4285F4" },
              { icon: "A", label: "Sign Up with Apple", color: "#000" },
            ].map((s) => (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-3 font-medium text-sm text-gray-700 shadow-sm"
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: s.color }}>{s.icon}</span>
                {s.label}
              </motion.button>
            ))}
          </motion.div>
        </div>

        <div className="text-center pb-4">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <button onClick={() => navigate("auth-signin")} className="text-[#FF657D] font-semibold">Sign In</button>
          </p>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AuthSignIn = () => {
  const { navigate } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5 pt-4">
        <motion.button
          onClick={() => navigate("auth-signup")}
          className="mb-6 flex items-center gap-2 text-gray-600"
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Welcome Back</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in to continue your journey</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-[#FF657D]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button onClick={() => navigate("auth-otp")} className="text-xs text-[#FF657D] font-medium">Forgot Password?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:border-[#FF657D]"
              />
            </div>
          </div>

          <motion.button
            onClick={() => navigate("home")}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] mt-8 shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            Sign In
          </motion.button>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-3">
            {[
              { icon: "G", label: "Sign In with Google", color: "#4285F4" },
              { icon: "A", label: "Sign In with Apple", color: "#000" },
            ].map((s) => (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl border border-gray-200 bg-white flex items-center justify-center gap-3 font-medium text-sm text-gray-700"
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: s.color }}>{s.icon}</span>
                {s.label}
              </motion.button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <button onClick={() => navigate("auth-signup")} className="text-[#FF657D] font-semibold">Sign Up</button>
          </p>
        </motion.div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AuthOTP = () => {
  const { navigate } = useApp();
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleInput = (val: string, i: number) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 3) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
  };

  const isComplete = otp.every(d => d !== "");

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5 pt-4">
        <motion.button onClick={() => navigate("auth-signup")} className="mb-6" whileTap={{ scale: 0.95 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <h1 className="text-[28px] font-bold text-gray-900 mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Enter OTP</h1>
          <p className="text-gray-400 text-sm mb-8">We sent a 4-digit code to your email</p>

          <div className="flex justify-center gap-4 mb-8">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(e.target.value, i)}
                className="w-16 h-16 text-center text-2xl font-bold rounded-2xl border-2 focus:outline-none transition-colors"
                style={{ borderColor: digit ? "#FF657D" : "#E5E7EB", backgroundColor: digit ? "#FFF0F3" : "white" }}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mb-8">
            Didn't receive code?{" "}
            <button className="text-[#FF657D] font-semibold">Resend</button>
          </p>

          <motion.button
            onClick={() => navigate("auth-password")}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-[16px] transition-opacity ${isComplete ? "opacity-100" : "opacity-50"}`}
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            Verify OTP
          </motion.button>
        </motion.div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AuthPassword = () => {
  const { navigate } = useApp();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5 pt-4">
        <motion.button onClick={() => navigate("auth-otp")} className="mb-6" whileTap={{ scale: 0.95 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Protect Your Account</h1>
          <p className="text-gray-400 text-sm mb-8">Create a strong password</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">New Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#FF657D]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#FF657D]" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {["At least 8 characters", "One uppercase letter", "One number"].map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${pass.length >= 8 ? "bg-green-500" : "bg-gray-200"}`}>
                  {pass.length >= 8 && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <span className="text-xs text-gray-500">{req}</span>
              </div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate("auth-success")}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] mt-8 shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            Set Password
          </motion.button>
        </motion.div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AuthSuccess = () => {
  const { navigate } = useApp();
  return (
    <MobileLayout gradient="linear-gradient(180deg, #F0FFF4 0%, #DCFFE4 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-xl"
        >
          <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
            <path d="M4 18L18 32L44 4" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[30px] font-bold text-gray-900 mb-3 text-center"
          style={{ fontFamily: "Instrument Sans, sans-serif" }}
        >
          Account Created!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-center mb-10"
        >
          Welcome to Flowly. Your journey to better health starts now.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("home")}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
        >
          Start Tracking
        </motion.button>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
