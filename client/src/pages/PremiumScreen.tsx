import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$4.99",
    period: "/month",
    features: ["Advanced cycle predictions", "Detailed health charts", "Symptom tracking", "Export data"],
    badge: null,
  },
  {
    id: "yearly",
    name: "Annual",
    price: "$2.99",
    period: "/month",
    billed: "Billed $35.88/year",
    features: ["Everything in Monthly", "Pregnancy planning mode", "AI health insights", "Priority support", "Unlimited history"],
    badge: "BEST VALUE",
    discount: "40% OFF",
  },
];

export const PremiumScreen = () => {
  const { navigate } = useApp();
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  return (
    <MobileLayout gradient="linear-gradient(180deg, #1a0a2e 0%, #2d0b55 50%, #FF657D22 100%)">
      <StatusBar dark />
      <div className="flex flex-col h-[calc(100svh-45px-34px)]">
        <div className="px-5 pt-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("account")}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-3"
            >👑</motion.div>
            <h1 className="text-[28px] font-bold text-white mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Unlock Premium
            </h1>
            <p className="text-white/60 text-sm">Get the full Flowly experience</p>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: "🔮", label: "AI Insights" },
              { icon: "📊", label: "Advanced Charts" },
              { icon: "🔔", label: "Smart Reminders" },
              { icon: "🌍", label: "Period Predictions" },
              { icon: "📤", label: "Export Reports" },
              { icon: "🤝", label: "Priority Support" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm"
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/90 text-[12px] font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mb-6">
            {plans.map((plan, i) => (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPlan(plan.id)}
                className="w-full rounded-2xl p-4 text-left relative overflow-hidden border-2 transition-all"
                style={{
                  background: selectedPlan === plan.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                  borderColor: selectedPlan === plan.id ? "#FF657D" : "rgba(255,255,255,0.15)",
                }}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}>
                    {plan.badge}
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedPlan === plan.id ? "border-[#FF657D] bg-[#FF657D]" : "border-white/40"}`}>
                    {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-white font-bold text-[22px]">{plan.price}</span>
                      <span className="text-white/60 text-[13px]">{plan.period}</span>
                      {plan.discount && (
                        <span className="text-[#FF657D] text-[11px] font-bold ml-1">{plan.discount}</span>
                      )}
                    </div>
                    <p className="text-white/50 text-[11px] mb-2">{plan.name}{plan.billed ? ` • ${plan.billed}` : ""}</p>
                    <div className="space-y-1">
                      {plan.features.slice(0, 3).map((f, j) => (
                        <div key={j} className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#FF657D] flex items-center justify-center flex-shrink-0">
                            <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                              <path d="M1 2.5L2.5 4L6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <span className="text-white/70 text-[11px]">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("payment-summary")}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg mb-3"
            style={{ background: "linear-gradient(135deg, #FF8FA3 0%, #FF657D 100%)" }}
          >
            Start Free Trial
          </motion.button>

          <p className="text-center text-white/40 text-[11px]">
            7-day free trial • Cancel anytime • No commitment
          </p>
        </div>
      </div>
      <HomeIndicator dark />
    </MobileLayout>
  );
};

export const BillingScreen = () => {
  const { navigate } = useApp();

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
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Billing & Plans</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Current plan */}
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Current Plan</h3>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">FREE</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">Upgrade to unlock advanced features and insights.</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("premium")}
              className="w-full py-3 rounded-2xl text-white font-semibold text-sm shadow-sm"
              style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
            >
              Upgrade to Premium
            </motion.button>
          </div>

          {/* Payment methods */}
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Payment Methods</h3>
              <button onClick={() => navigate("payment-methods")} className="text-[#FF657D] text-sm font-medium">+ Add</button>
            </div>
            <div className="space-y-3">
              {[
                { icon: "💳", name: "Visa", last4: "4242", type: "Credit Card" },
                { icon: "🅰️", name: "Apple Pay", last4: "", type: "Digital Wallet" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-gray-800">{m.name} {m.last4 && `••••${m.last4}`}</p>
                    <p className="text-xs text-gray-400">{m.type}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing history */}
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">Billing History</h3>
            <p className="text-sm text-gray-400 text-center py-4">No billing history yet</p>
          </div>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PaymentMethodsScreen = () => {
  const { navigate } = useApp();

  const methods = [
    { icon: "🅶", name: "Google Pay", email: "maria@gmail.com", color: "#4285F4" },
    { icon: "🅰️", name: "Apple Pay", email: "maria@icloud.com", color: "#000" },
    { icon: "f", name: "PayPal", email: "maria@email.com", color: "#003087" },
  ];

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 pt-3 pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("billing")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Payment Methods</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {methods.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: m.color }}>
                {m.icon}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6L15 12L9 18" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.div>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 font-medium"
          >
            <span className="text-xl">+</span>
            <span className="text-sm">Add Payment Method</span>
          </motion.button>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PaymentSummaryScreen = () => {
  const { navigate } = useApp();

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] px-5">
        <div className="flex items-center gap-3 pt-3 pb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("premium")}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Summary Review</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Flowly Premium Annual", value: "$35.88" },
                { label: "Discount (40%)", value: "-$23.92", color: "#34D399" },
                { label: "Tax", value: "$2.40" },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between ${i < 2 ? "pb-3 border-b border-gray-50" : ""}`}>
                  <span className="text-[13px] text-gray-600">{item.label}</span>
                  <span className="text-[13px] font-bold" style={{ color: item.color || "#1F2937" }}>{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-[15px] font-bold text-gray-900">Total</span>
                <span className="text-[15px] font-bold text-[#FF657D]">$14.36/year</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">Payment Method</h3>
              <button className="text-[#FF657D] text-sm font-medium">Change</button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-[13px] font-bold text-gray-800">Visa ••••4242</p>
                <p className="text-xs text-gray-400">Credit Card</p>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("payment-progress")}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
          >
            Confirm Payment
          </motion.button>

          <p className="text-center text-gray-400 text-[11px]">
            Secure payment encrypted with SSL. Cancel anytime.
          </p>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PaymentProgressScreen = () => {
  const { navigate } = useApp();
  setTimeout(() => navigate("congratulations"), 2500);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-20 h-20 rounded-full border-4 border-[#FFE7EA] border-t-[#FF657D] mb-6"
        />
        <h2 className="text-[22px] font-bold text-gray-900 mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
          Processing Payment...
        </h2>
        <p className="text-gray-400 text-sm text-center">Please wait while we process your payment securely.</p>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const CongratulationsScreen = () => {
  const { navigate } = useApp();

  return (
    <MobileLayout gradient="linear-gradient(180deg, #1a0a2e 0%, #2d0b55 100%)">
      <StatusBar dark />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-yellow-400 text-2xl">👑</span>
            <h1 className="text-[28px] font-bold text-white" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
              Congratulations!
            </h1>
            <span className="text-yellow-400 text-2xl">👑</span>
          </div>
          <p className="text-white/70 text-[15px] mb-2">You're now a Premium member!</p>
          <p className="text-white/50 text-sm mb-8">Enjoy unlimited access to all Flowly features.</p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: "🔮", label: "AI Insights" },
              { icon: "📊", label: "Advanced Charts" },
              { icon: "📤", label: "Data Export" },
              { icon: "🌍", label: "Global Predictions" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="rounded-2xl p-3 flex items-center gap-2 bg-white/10"
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/80 text-xs font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("home")}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-xl"
            style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
          >
            Start Exploring Premium
          </motion.button>
        </motion.div>
      </div>
      <HomeIndicator dark />
    </MobileLayout>
  );
};
