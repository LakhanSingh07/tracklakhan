import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa";
import type { Provider } from "@supabase/supabase-js";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import flowAiLogo from "@assets/flowailogo_1781087470446.png";
import { supabase } from "@/lib/supabase";

const socialProviders = [
  { icon: <FaGoogle size={24} color="#EA4335" />, label: "Google", action: "Sign Up with Google", provider: "google" },
  { icon: <FaApple size={25} color="#000000" />, label: "Apple", action: "Sign Up with Apple", provider: "apple" },
  { icon: <FaFacebookF size={22} color="#1877F2" />, label: "Facebook", action: "Sign Up with Facebook", provider: "facebook" },
] as const;

const SocialLogo = ({ icon }: { icon: ReactNode }) => (
  <span
    className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px] border border-gray-200 bg-white shadow-sm"
    aria-hidden="true"
  >
    {icon}
  </span>
);

const SocialIconButton = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) => (
  <motion.button
    key={label}
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border border-gray-200 bg-white shadow-sm"
    aria-label={label}
  >
    {icon}
  </motion.button>
);

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;

  if (message.toLowerCase().includes("provider is not enabled")) {
    return "This sign-in option is not enabled yet. Enable it in Supabase Auth Providers or use email sign in.";
  }

  return message;
};

export const AuthSignUp = () => {
  const { navigate, signUpWithEmail, signInWithProvider } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const handleEmailSignUp = async () => {
    if (!fullName || !email || !password || !agreed || loading) return;

    setLoading(true);
    setAuthMessage("");
    try {
      await signUpWithEmail(fullName.trim(), email.trim(), password);
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Unable to create your account."));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: Provider) => {
    setLoading(true);
    setAuthMessage("");
    try {
      await signInWithProvider(provider);
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Unable to continue with this provider."));
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <MobileLayout gradient="#F9F9F9">
        <div className="relative min-h-[100svh] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[360px] rounded-b-[40px] bg-gradient-to-b from-[#FFE6E9] to-[#F7E5D1]" />
          <StatusBar />

          <motion.button
            onClick={() => setShowForm(false)}
            className="relative z-10 ml-5 mt-[24px] flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#F9F9F9]"
            whileTap={{ scale: 0.95 }}
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mx-5 mt-[28px] rounded-[24px] bg-white px-5 pt-6 pb-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
          >
            <h1 className="mb-1 text-[28px] font-extrabold leading-none text-black" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Start Today
            </h1>
            <p className="mb-6 text-[14px] text-gray-400">Join now to track your cycle.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-black">Full Name</label>
                <div className="flex h-[54px] items-center gap-3 rounded-[16px] border border-gray-200 bg-white px-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M20 21a8 8 0 0 0-16 0" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="4" stroke="#8A8A8A" strokeWidth="1.6" />
                  </svg>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-black">Email</label>
                <div className="flex h-[54px] items-center gap-3 rounded-[16px] border border-gray-200 bg-white px-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M4 6h16v12H4V6Z" stroke="#8A8A8A" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="m4 7 8 6 8-6" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-black">Password</label>
                <div className="flex h-[54px] items-center gap-3 rounded-[16px] border border-gray-200 bg-white px-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="#8A8A8A" strokeWidth="1.6" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M12 14v2" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M3 3l18 18" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M8.4 5.6A9.6 9.6 0 0 1 12 5c5.2 0 8.5 4.8 9.5 7-0.4.9-1.2 2.1-2.4 3.2M6.1 6.9C4.4 8.1 3.2 10.1 2.5 12c1 2.2 4.3 7 9.5 7 1.4 0 2.7-.3 3.8-.9" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[5px] border-2 transition-colors ${agreed ? "bg-[#FF657D] border-[#FF657D]" : "border-black bg-white"}`}
                  aria-label="Agree to privacy policy and terms"
                >
                  {agreed && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
                <p className="text-[14px] text-gray-400">
                  I agree to{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="font-bold text-black underline hover:text-[#FF657D] transition-colors"
                  >
                    Peria Terms & Conditions
                  </button>
                  .
                </p>
              </div>
            </div>

            <motion.button
              onClick={handleEmailSignUp}
              whileTap={{ scale: 0.97 }}
              className={`mt-6 h-[56px] w-full rounded-[16px] text-[16px] font-bold text-white shadow-md transition-opacity ${fullName && email && password && agreed ? "opacity-100" : "opacity-55"}`}
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            >
              {loading ? "Creating..." : "Sign up"}
            </motion.button>

            {authMessage && (
              <p className="mt-3 text-center text-[13px] font-medium text-[#FF4F6D]">{authMessage}</p>
            )}

            <div className="my-5 text-center text-[15px] font-semibold text-[#1E40AF]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Or continue with
            </div>

            <div className="flex items-center justify-center gap-[16px]">
              {socialProviders.map((s) => (
                <SocialIconButton key={s.label} icon={s.icon} label={s.label} onClick={() => handleProviderSignIn(s.provider)} />
              ))}
            </div>

            <p className="mt-6 text-center text-[14px] text-gray-400">
              Already have an account?{" "}
              <button onClick={() => navigate("auth-signin")} className="font-bold text-black">Sign in</button>
            </p>
          </motion.div>

          <HomeIndicator />
        </div>

        <AnimatePresence>
          {showTerms && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative flex h-full max-h-[78%] w-[90%] max-w-[380px] flex-col rounded-[24px] bg-white p-5 shadow-2xl border-none"
              >
                {/* Header */}
                <div className="text-center relative">
                  <h2 className="text-[20px] font-extrabold text-black" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                    Terms & Conditions
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-1">
                    Please review Peria Terms & Conditions before continuing.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowTerms(false)}
                    className="absolute -right-1 -top-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Scroll Content */}
                <div className="flex-1 overflow-y-auto my-4 pr-1 text-[13px] text-gray-600 space-y-3.5 leading-relaxed scrollbar-thin">
                  <h3 className="font-bold text-black text-[14px]">1. Acceptance of Terms</h3>
                  <p>
                    By signing up for and using Peria (also known as FlowAI), you agree to be bound by these Terms & Conditions. If you do not agree, you must not use the services.
                  </p>

                  <h3 className="font-bold text-black text-[14px]">2. No Medical Advice</h3>
                  <p className="text-[#FF657D] font-semibold">
                    Important: Peria is an informational period tracker and health coaching platform. It does NOT provide medical advice, diagnosis, or treatment. Always consult a healthcare provider for medical concerns.
                  </p>

                  <h3 className="font-bold text-black text-[14px]">3. Privacy & Health Data</h3>
                  <p>
                    Your privacy is our utmost priority. All period, symptom, and mood inputs are securely encrypted and processed according to our Privacy Policy. We do not sell or share your personal health metrics with unauthorized third parties.
                  </p>

                  <h3 className="font-bold text-black text-[14px]">4. AI Coaching and Insights</h3>
                  <p>
                    AI-generated health coach answers and cycle insights are for educational use. The algorithms evaluate cycles based on standard patterns and do not replace laboratory diagnostics or clinical assessments.
                  </p>

                  <h3 className="font-bold text-black text-[14px]">5. Intellectual Property</h3>
                  <p>
                    All application assets, source code, user interface designs, logos, database systems, and AI models are the proprietary intellectual property of Peria/FlowAI.
                  </p>

                  <h3 className="font-bold text-black text-[14px]">6. Modifications</h3>
                  <p>
                    We reserve the right to revise these Terms at any time. Continued use of Peria following any changes constitutes acceptance of the new Terms.
                  </p>
                </div>

                {/* Footer Button */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAgreed(true);
                      setShowTerms(false);
                    }}
                    className="w-full h-[48px] rounded-[24px] text-[15px] font-bold text-white shadow-md transition-opacity"
                    style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
                  >
                    Agree & Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFF0F3 0%, #FFE1E7 100%)">
      <div className="flex min-h-[100svh] flex-col px-2.5">
        <StatusBar />
        <main className="flex flex-1 flex-col items-center pt-[176px]">
          <motion.img
            src={flowAiLogo}
            alt="FlowAI"
            initial={{ scale: 0.86, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="h-[170px] w-[170px] object-contain"
          />

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-center text-[30px] font-extrabold leading-tight text-gray-950"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            Welcome to FlowAI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-[16px] leading-relaxed text-gray-500"
          >
            Know Your Cycle. Own Your Health. Powered by AI
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="mt-2 text-[18px]"
          >
            &#10024;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-[52px] w-full space-y-4"
          >
            <motion.button
              onClick={() => setShowForm(true)}
              whileTap={{ scale: 0.97 }}
              className="h-[70px] w-full rounded-[18px] text-[20px] font-bold text-white shadow-[0_10px_20px_rgba(255,101,125,0.24)]"
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            >
              Sign Up with Email
            </motion.button>

            {socialProviders.map((s) => (
              <motion.button
                key={s.label}
                onClick={() => handleProviderSignIn(s.provider)}
                whileTap={{ scale: 0.97 }}
                className="grid h-[66px] w-full grid-cols-[140px_minmax(0,1fr)] items-center rounded-[18px] border border-gray-200 bg-white pr-5 text-[17px] font-semibold text-gray-800 shadow-sm"
              >
                <span className="flex justify-center">
                  <SocialLogo icon={s.icon} />
                </span>
                <span className="block min-w-0 whitespace-nowrap text-left leading-none">{s.action}</span>
              </motion.button>
            ))}

            {authMessage && (
              <p className="text-center text-[13px] font-medium text-[#FF4F6D]">{authMessage}</p>
            )}
          </motion.div>
        </main>

        <footer className="pb-[52px] text-center">
          <p className="text-[16px] text-gray-500">
            Already have an account?{" "}
            <button onClick={() => navigate("auth-signin")} className="font-semibold text-[#FF657D]">Sign In</button>
          </p>
        </footer>
        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};

export const AuthSignIn = () => {
  const { navigate, resetPassword, signInWithEmail, signInWithProvider } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // MFA states
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");

  const handleEmailSignIn = async () => {
    if (!email || !password || loading) return;

    setLoading(true);
    setAuthMessage("");
    try {
      const res = await signInWithEmail(email.trim(), password);
      if (res?.mfaRequired) {
        setMfaFactorId(res.factorId);
        setShowMfaInput(true);
      }
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (!mfaCode || loading) return;
    setLoading(true);
    setAuthMessage("");
    try {
      const { data: challengeData, error: challengeError } = await supabase!.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase!.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode.trim()
      });
      if (verifyError) throw verifyError;

      navigate("home");
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Invalid 2FA code."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || loading) {
      setAuthMessage("Enter your email first, then tap Forgot Password.");
      return;
    }

    setLoading(true);
    setAuthMessage("");
    try {
      await resetPassword(email.trim());
      setAuthMessage("Password reset email sent.");
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Unable to send reset email."));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: Provider) => {
    setLoading(true);
    setAuthMessage("");
    try {
      await signInWithProvider(provider);
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Unable to continue with this provider."));
      setLoading(false);
    }
  };

  return (
    <MobileLayout gradient="#F9F9F9">
      <div className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[360px] rounded-b-[40px] bg-gradient-to-b from-[#FFE6E9] to-[#F7E5D1]" />
        <StatusBar />

        <motion.button
          onClick={() => navigate("auth-signup")}
          className="relative z-10 ml-5 mt-5 h-11 w-11 rounded-[15px] bg-[#F9F9F9] flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        {showMfaInput ? (
          <motion.div
            key="mfa-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mx-5 mt-[28px] rounded-[24px] bg-white px-5 pt-6 pb-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
          >
            <h1 className="mb-1 text-[24px] font-extrabold leading-none text-black" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Two-Factor Auth
            </h1>
            <p className="mb-6 text-[14px] text-gray-400">Enter the 6-digit code from your authenticator app</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-black">Verification Code</label>
                <div className="flex h-[54px] items-center gap-3 rounded-[16px] border border-gray-200 bg-white px-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="#8A8A8A" strokeWidth="1.6" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M12 14v2" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="min-w-0 flex-1 bg-transparent text-[16px] tracking-[4px] font-bold text-gray-900 outline-none placeholder:text-gray-300 placeholder:tracking-normal"
                  />
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleMfaVerify}
              disabled={mfaCode.length !== 6 || loading}
              whileTap={{ scale: 0.97 }}
              className="mt-6 h-[56px] w-full rounded-[16px] text-[16px] font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </motion.button>

            {authMessage && (
              <p className="mt-3 text-center text-[13px] font-medium text-[#FF4F6D]">{authMessage}</p>
            )}

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowMfaInput(false);
                  setMfaCode("");
                  setAuthMessage("");
                }}
                className="text-[13px] text-gray-400 hover:text-gray-600 font-bold"
              >
                Back to Sign In
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mx-5 mt-[28px] rounded-[24px] bg-white px-5 pt-6 pb-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
          >
            <h1 className="mb-1 text-[28px] font-extrabold leading-none text-black" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Welcome Back!
            </h1>
            <p className="mb-6 text-[14px] text-gray-400">Sign in to access your account</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[14px] font-semibold text-black">Email Address</label>
                <div className="flex h-[54px] items-center gap-3 rounded-[16px] border border-gray-200 bg-white px-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M4 6h16v12H4V6Z" stroke="#8A8A8A" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="m4 7 8 6 8-6" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-[14px] font-semibold text-black leading-none">Password</label>
                  <button onClick={handleForgotPassword} className="text-[13px] text-[#FF657D] font-bold">Forgot Password?</button>
                </div>
                <div className="flex h-[54px] items-center gap-3 rounded-[16px] border border-gray-200 bg-white px-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="#8A8A8A" strokeWidth="1.6" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M12 14v2" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <path d="M3 3l18 18" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M8.4 5.6A9.6 9.6 0 0 1 12 5c5.2 0 8.5 4.8 9.5 7-0.4.9-1.2 2.1-2.4 3.2M6.1 6.9C4.4 8.1 3.2 10.1 2.5 12c1 2.2 4.3 7 9.5 7 1.4 0 2.7-.3 3.8-.9" stroke="#8A8A8A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleEmailSignIn}
              whileTap={{ scale: 0.97 }}
              className="mt-6 h-[56px] w-full rounded-[16px] text-[16px] font-bold text-white shadow-md transition-opacity"
              style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>

            {authMessage && (
              <p className="mt-3 text-center text-[13px] font-medium text-[#FF4F6D]">{authMessage}</p>
            )}

            <div className="my-5 text-center text-[15px] font-semibold text-[#1E40AF]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Or continue with
            </div>

            <div className="flex items-center justify-center gap-[16px]">
              {socialProviders.map((s) => (
                <SocialIconButton key={s.label} icon={s.icon} label={s.label} onClick={() => handleProviderSignIn(s.provider)} />
              ))}
            </div>
          </motion.div>
        )}

        <p className="relative z-10 text-center text-[14px] text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <button onClick={() => navigate("auth-signup")} className="font-bold text-black">Sign up</button>
        </p>

        <HomeIndicator />
      </div>
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
  const { navigate, updatePassword } = useApp();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const requirements = [
    { label: "At least 8 characters", met: pass.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pass) },
    { label: "One number", met: /\d/.test(pass) },
  ];
  const canSubmit = requirements.every(req => req.met) && pass === confirm && !loading;

  const handleSetPassword = async () => {
    if (loading) return;
    if (!requirements.every(req => req.met)) {
      setAuthMessage("Use at least 8 characters with one uppercase letter and one number.");
      return;
    }
    if (pass !== confirm) {
      setAuthMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setAuthMessage("");
    try {
      await updatePassword(pass);
    } catch (error) {
      setAuthMessage(getAuthErrorMessage(error, "Unable to update your password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFF0F3 0%, #FFE1E7 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5 pt-4">
        <motion.button onClick={() => navigate("auth-signin")} className="mb-6 h-11 w-11 rounded-[15px] bg-white flex items-center justify-center shadow-sm" whileTap={{ scale: 0.95 }} aria-label="Back to sign in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] bg-white px-5 pt-6 pb-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
          <div className="mb-6 flex flex-col items-center text-center">
            <img src={flowAiLogo} alt="FlowAI" className="mb-3 h-[88px] w-[88px] object-contain" />
            <h1 className="text-[28px] font-extrabold leading-tight text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Reset Your FlowAI Password</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">Create a secure password to get back to your cycle insights.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">New Password</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#FF657D]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#FF657D]" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {requirements.map((req) => (
              <div key={req.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-green-500" : "bg-gray-200"}`}>
                  {req.met && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
                <span className="text-xs text-gray-500">{req.label}</span>
              </div>
            ))}
          </div>

          {authMessage && (
            <p className="mt-4 text-center text-[13px] font-medium text-[#FF4F6D]">{authMessage}</p>
          )}

          <motion.button
            onClick={handleSetPassword}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-[16px] mt-8 shadow-lg transition-opacity ${canSubmit ? "opacity-100" : "opacity-55"}`}
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            {loading ? "Updating..." : "Update Password"}
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
          Check Your Email
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-center mb-10"
        >
          We sent you a confirmation link. Verify your email, then sign in to continue.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("auth-signin")}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
          style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
        >
          Back to Sign In
        </motion.button>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const AuthResetSuccess = () => {
  const { navigate } = useApp();

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FFF0F3 0%, #FFE1E7 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-5">
        <motion.img
          src={flowAiLogo}
          alt="FlowAI"
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-5 h-[110px] w-[110px] object-contain"
        />

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
          Password Updated
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-center mb-10"
        >
          Your FlowAI account is secure. Continue to your dashboard.
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
          Continue to FlowAI
        </motion.button>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};
