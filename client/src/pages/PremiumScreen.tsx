import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import { Check, X, AlertCircle, Plus, CreditCard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const plans = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "$4.99",
    period: "/month",
    features: ["Advanced cycle predictions", "Detailed health charts", "Symptom tracking", "Export data"],
    badge: null,
  },
  {
    id: "quarterly",
    name: "Quarterly Plan",
    price: "$3.99",
    period: "/month",
    billed: "Billed $11.97/3 months",
    features: ["Everything in Monthly", "Seasonal symptom analysis", "Custom wellness notifications", "PDF Health Reports"],
    badge: "SAVE 20%",
  },
  {
    id: "yearly",
    name: "Annual Plan",
    price: "$2.50",
    period: "/month",
    billed: "Billed $29.99/year",
    features: ["Everything in Quarterly", "Pregnancy planning mode", "AI health insights", "Priority support", "Unlimited history"],
    badge: "BEST VALUE",
    discount: "50% OFF",
  },
];

const currencyPlans: Record<string, Record<string, { price: string; period: string; billed?: string; discount?: string }>> = {
  USD: {
    monthly: { price: "$4.99", period: "/month" },
    quarterly: { price: "$3.99", period: "/month", billed: "Billed $11.97/3 months" },
    yearly: { price: "$2.50", period: "/month", billed: "Billed $29.99/year", discount: "50% OFF" }
  },
  EUR: {
    monthly: { price: "€4.99", period: "/month" },
    quarterly: { price: "€3.99", period: "/month", billed: "Billed €11.97/3 months" },
    yearly: { price: "€2.50", period: "/month", billed: "Billed €29.99/year", discount: "50% OFF" }
  },
  GBP: {
    monthly: { price: "£3.99", period: "/month" },
    quarterly: { price: "£3.33", period: "/month", billed: "Billed £9.99/3 months" },
    yearly: { price: "£2.08", period: "/month", billed: "Billed £24.99/year", discount: "48% OFF" }
  },
  INR: {
    monthly: { price: "₹199", period: "/month" },
    quarterly: { price: "₹166", period: "/month", billed: "Billed ₹499/3 months" },
    yearly: { price: "₹108", period: "/month", billed: "Billed ₹1,299/year", discount: "45% OFF" }
  }
};

export const PremiumScreen = () => {
  const { navigate, selectedPlanId, setSelectedPlanId, currency: appCurrency } = useApp();
  const currentCurrency = (appCurrency || "USD").toUpperCase();
  const activePlanDetails = currencyPlans[currentCurrency] || currencyPlans["USD"];


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
            {plans.map((plan, i) => {
              const details = activePlanDetails[plan.id] || { price: plan.price, period: plan.period, billed: plan.billed, discount: plan.discount };
              return (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className="w-full rounded-2xl p-4 text-left relative overflow-hidden border-2 transition-all"
                  style={{
                    background: selectedPlanId === plan.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                    borderColor: selectedPlanId === plan.id ? "#FF657D" : "rgba(255,255,255,0.15)",
                  }}
                >
                  {plan.badge && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}>
                      {plan.badge}
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${selectedPlanId === plan.id ? "border-[#FF657D] bg-[#FF657D]" : "border-white/40"}`}>
                      {selectedPlanId === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-white font-bold text-[22px]">{details.price}</span>
                        <span className="text-white/60 text-[13px]">{details.period || plan.period}</span>
                        {details.discount && (
                          <span className="text-[#FF657D] text-[11px] font-bold ml-1">{details.discount}</span>
                        )}
                      </div>
                      <p className="text-white/50 text-[11px] mb-2">{plan.name}{details.billed ? ` • ${details.billed}` : ""}</p>
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
              );
            })}
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
  const { 
    navigate, 
    isPremium, 
    updatePremiumStatus, 
    paymentMethods, 
    billingHistory,
    authUser,
    refreshSubscription,
    selectedPlanId,
    currency: appCurrency
  } = useApp();

  const [showUtrVerify, setShowUtrVerify] = useState(false);
  const [utrVerifyInput, setUtrVerifyInput] = useState("");
  const [utrVerifyError, setUtrVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const activeCurrency = (appCurrency || "USD").toUpperCase();
  const formatBillingPrice = () => {
    if (selectedPlanId === "yearly") {
      if (activeCurrency === "INR") return "₹1,299 / year";
      if (activeCurrency === "EUR") return "€29.99 / year";
      if (activeCurrency === "GBP") return "£24.99 / year";
      return "$29.99 / year";
    } else if (selectedPlanId === "quarterly") {
      if (activeCurrency === "INR") return "₹499 / 3 months";
      if (activeCurrency === "EUR") return "€11.97 / 3 months";
      if (activeCurrency === "GBP") return "£9.99 / 3 months";
      return "$11.97 / 3 months";
    } else {
      if (activeCurrency === "INR") return "₹199 / month";
      if (activeCurrency === "EUR") return "€4.99 / month";
      if (activeCurrency === "GBP") return "£3.99 / month";
      return "$4.99 / month";
    }
  };

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel your Premium subscription? You will lose access to all premium insights.")) {
      updatePremiumStatus(false);
      alert("Subscription cancelled successfully. You are now back to the Free plan.");
    }
  };

  const handleDirectUtrVerify = async () => {
    setUtrVerifyError("");
    if (!/^\d{12}$/.test(utrVerifyInput.trim())) {
      setUtrVerifyError("Please enter a valid 12-digit transaction UTR.");
      return;
    }

    if (!authUser?.id) {
      setUtrVerifyError("You must be logged in to verify a payment.");
      return;
    }

    try {
      setVerifying(true);
      const res = await fetch("/api/payments/verify-utr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          utr: utrVerifyInput.trim(),
          userId: authUser.id,
          planId: selectedPlanId || "yearly",
          methodName: "UPI Direct Manual Verification",
          currency: appCurrency
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      await refreshSubscription();
      alert("Success! Your Premium subscription has been activated.");
      setShowUtrVerify(false);
      setUtrVerifyInput("");
    } catch (err: any) {
      setUtrVerifyError(err.message || "An unexpected error occurred.");
    } finally {
      setVerifying(false);
    }
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
          <h1 className="text-[20px] font-bold text-gray-900" style={{ fontFamily: "Instrument Sans, sans-serif" }}>Billing & Plans</h1>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-6">
          {/* Current plan */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">Current Plan</h3>
              {isPremium ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0F3] text-[#FF657D] border border-[#FF657D]/20 flex items-center gap-1">
                  👑 PREMIUM
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">FREE</span>
              )}
            </div>
            
            {isPremium ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your Premium membership is active! You have full access to AI health coach, advanced cycles predictions, data exports, and premium widgets.
                </p>
                <div className="flex justify-between items-center py-2.5 px-3 bg-[#FFF5F6] rounded-2xl text-xs font-medium text-gray-800">
                  <span>Billing Period: {selectedPlanId === "yearly" ? "Annual" : selectedPlanId === "quarterly" ? "Quarterly" : "Monthly"}</span>
                  <span className="text-[#FF657D] font-bold">
                    {formatBillingPrice()}
                  </span>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-3 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">Upgrade to unlock advanced features, cyclical health alerts, priority support, and infinite cycle log history.</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("premium")}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-sm"
                  style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
                >
                  Upgrade to Premium
                </motion.button>

                {/* Direct UTR validation for payment issues */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowUtrVerify(!showUtrVerify)}
                    className="text-gray-500 hover:text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 w-full py-2"
                  >
                    ⚠️ Having payment issues? Verify UTR
                  </button>
                  {showUtrVerify && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 mt-3">
                      <input
                        type="text"
                        value={utrVerifyInput}
                        onChange={e => setUtrVerifyInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        placeholder="Enter 12-digit UPI UTR / Ref No."
                        className="w-full text-xs border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800 bg-gray-50"
                      />
                      {utrVerifyError && <p className="text-[10px] text-red-500 font-bold">{utrVerifyError}</p>}
                      <button
                        onClick={handleDirectUtrVerify}
                        disabled={verifying}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {verifying ? "Verifying Reference..." : "Verify & Activate Premium"}
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Payment Methods</h3>
              <button onClick={() => navigate("payment-methods")} className="text-[#FF657D] text-xs font-bold">+ Add / Manage</button>
            </div>
            <div className="space-y-3">
              {paymentMethods.map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-gray-800">
                      {m.name} {m.last4 ? `•••• ${m.last4}` : m.details ? `(${m.details})` : ""}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">{m.type}</p>
                  </div>
                  {m.active && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Billing history */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">Billing History</h3>
            {billingHistory.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No billing transactions yet</p>
            ) : (
              <div className="space-y-3">
                {billingHistory.map((h, i) => (
                  <div key={h.id || i} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-b-0 text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{h.planName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{h.date} · via {h.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{h.amount}</p>
                      <span className="text-[9px] font-bold text-emerald-600">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PaymentMethodsScreen = () => {
  const { navigate, paymentMethods, addPaymentMethod } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [methodType, setMethodType] = useState<"upi" | "card">("upi");

  // Form states
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (methodType === "upi") {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId.trim())) {
        setErrorMsg("Please enter a valid UPI ID (e.g. name@bank)");
        return;
      }
      addPaymentMethod({
        id: "upi_" + Date.now(),
        icon: "⚡",
        name: "UPI",
        details: upiId.trim(),
        type: "UPI Mobile Payment",
        active: paymentMethods.length === 0
      });
      setUpiId("");
    } else {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setErrorMsg("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardExpiry.includes("/")) {
        setErrorMsg("Expiry must be in MM/YY format");
        return;
      }
      addPaymentMethod({
        id: "card_" + Date.now(),
        icon: "💳",
        name: "Card",
        last4: cardNumber.replace(/\s/g, "").slice(-4),
        type: "Credit/Debit Card",
        active: paymentMethods.length === 0
      });
      setCardNumber("");
      setCardExpiry("");
      setCardHolder("");
    }

    setShowAddForm(false);
  };

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

        <div className="flex-1 overflow-y-auto space-y-4 pb-6">
          {showAddForm ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Add Payment Method</h3>
              
              {/* Type Select */}
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setMethodType("upi"); setErrorMsg(""); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${methodType === "upi" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                >
                  ⚡ UPI Payment
                </button>
                <button
                  type="button"
                  onClick={() => { setMethodType("card"); setErrorMsg(""); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${methodType === "card" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                >
                  💳 Credit/Debit Card
                </button>
              </div>

              <form onSubmit={handleAddMethod} className="space-y-4">
                {methodType === "upi" ? (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Enter UPI ID</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                    />
                    
                    {/* Handle suggestions */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["@okaxis", "@okhdfcbank", "@paytm", "@ybl", "@upi"].map(handle => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => {
                            const val = upiId.trim();
                            if (!val) {
                              setUpiId("username" + handle);
                              return;
                            }
                            if (val.includes("@")) {
                              const [userPart] = val.split("@");
                              setUpiId(userPart + handle);
                            } else {
                              setUpiId(val + handle);
                            }
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-50 border border-gray-100 text-gray-500 hover:bg-[#FFF5F6] hover:text-[#FF657D] hover:border-[#FF657D]/30 transition-all"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Supports Google Pay, PhonePe, BHIM, Paytm IDs</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800 tracking-wider"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Expiry</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          placeholder="MM/YY"
                          onChange={e => setCardExpiry(e.target.value.slice(0, 5))}
                          className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          placeholder="Maria Carter"
                          onChange={e => setCardHolder(e.target.value)}
                          className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {errorMsg && <p className="text-[11px] font-semibold text-red-500">{errorMsg}</p>}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#FF657D] text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Save Method
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((m, i) => (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100/50"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-50 font-bold">
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-gray-900">
                      {m.name} {m.last4 ? `•••• ${m.last4}` : m.details ? `(${m.details})` : ""}
                    </p>
                    <p className="text-xs text-gray-400">{m.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.active ? (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Primary</span>
                    ) : (
                      <button
                        onClick={() => {
                          const userId = localStorage.getItem("supabase.auth.token") ? JSON.parse(localStorage.getItem("supabase.auth.token") || "{}")?.currentSession?.user?.id : "anonymous";
                          const updated = paymentMethods.map(pm => ({ ...pm, active: pm.id === m.id }));
                          localStorage.setItem(`flowai_pm_${userId || 'anonymous'}`, JSON.stringify(updated));
                          window.location.reload();
                        }}
                        className="text-xs text-blue-500 font-semibold"
                      >
                        Set Primary
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors font-semibold"
              >
                <span className="text-xl">+</span>
                <span className="text-sm">Add Payment Method</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PaymentSummaryScreen = () => {
  const { navigate, selectedPlanId, paymentMethods, merchantUpiId: appMerchantUpiId, merchantName: appMerchantName, cardGatewayProvider: appCardGatewayProvider, cardGatewayKey: appCardGatewayKey, currency: appCurrency } = useApp();
  const [orderData, setOrderData] = useState<{
    txnId: string;
    currency: string;
    rawPrice: number;
    discount: number;
    tax: number;
    totalAmount: string;
    totalUSD: string;
    totalINR: number;
    upiPayUrl: string;
    merchantUpiId: string;
    merchantName: string;
    gatewayProvider: string;
    gatewayKey: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isYearly = selectedPlanId === "yearly";
  const isQuarterly = selectedPlanId === "quarterly";
  const planName = isYearly ? "FlowAI Premium Annual" : isQuarterly ? "FlowAI Premium Quarterly" : "FlowAI Premium Monthly";

  const primaryMethod = paymentMethods.find(m => m.active) || paymentMethods[0] || { id: "visa", icon: "💳", name: "Visa", last4: "4242", type: "Credit Card" };
  const initialIsUpi = primaryMethod.icon === "⚡" || primaryMethod.type?.includes("UPI");
  const [paymentType, setPaymentType] = useState<"upi" | "card">(initialIsUpi ? "upi" : "card");
  const isUpi = paymentType === "upi";

  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [showUpiGuide, setShowUpiGuide] = useState(false);
  const [activeUpiGuide, setActiveUpiGuide] = useState<"gpay" | "phonepe" | "paytm">("gpay");
  const [utrInput, setUtrInput] = useState("");
  const [utrError, setUtrError] = useState("");

  const upiApps = [
    { id: "gpay", name: "Google Pay", icon: "⚡" },
    { id: "phonepe", name: "PhonePe", icon: "🟣" },
    { id: "paytm", name: "Paytm", icon: "🔵" },
    { id: "bhim", name: "BHIM", icon: "🇮🇳" },
  ];

  useEffect(() => {
    let active = true;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: selectedPlanId,
            currency: appCurrency,
            customMerchantUpiId: appMerchantUpiId,
            customMerchantName: appMerchantName,
            customGatewayProvider: appCardGatewayProvider,
            customGatewayKey: appCardGatewayKey
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to create order, server returned status " + res.status);
        }
        const data = await res.json();
        if (active) {
          if (data.success) {
            setOrderData(data);
          } else {
            throw new Error(data.error || "Failed to create order");
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "An unexpected error occurred");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchOrder();
    return () => {
      active = false;
    };
  }, [selectedPlanId, appMerchantUpiId, appMerchantName, appCardGatewayProvider, appCardGatewayKey]);

  const handleVerifyConfirm = () => {
    if (isUpi) {
      if (!/^\d{12}$/.test(utrInput.trim())) {
        setUtrError("Please enter the valid 12-digit UPI UTR / Ref No.");
        return;
      }
      setUtrError("");
      localStorage.setItem("flowai_pending_utr", utrInput.trim());
      localStorage.setItem("flowai_pending_plan_id", selectedPlanId);
      localStorage.setItem("flowai_pending_method", primaryMethod.last4 ? `${primaryMethod.name} •••• ${primaryMethod.last4}` : `${primaryMethod.name} (${primaryMethod.details || ""})`);
      navigate("payment-progress");
    } else {
      // Mock card verification for demo purposes
      localStorage.setItem("flowai_pending_utr", "CARD" + Date.now().toString().slice(-8));
      localStorage.setItem("flowai_pending_plan_id", selectedPlanId);
      localStorage.setItem("flowai_pending_method", primaryMethod.last4 ? `${primaryMethod.name} •••• ${primaryMethod.last4}` : `${primaryMethod.name}`);
      navigate("payment-progress");
    }
  };

  if (loading) {
    return (
      <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
        <StatusBar />
        <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-[#FFE7EA] border-t-[#FF657D] mb-4"
          />
          <h2 className="text-base font-bold text-gray-800" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
            Preparing Secure Checkout...
          </h2>
        </div>
        <HomeIndicator />
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
        <StatusBar />
        <div className="flex flex-col h-[calc(100svh-45px-34px)] items-center justify-center px-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-base font-bold text-gray-800 mb-2" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
            Secure Checkout Failed
          </h2>
          <p className="text-xs text-red-500 font-semibold mb-6 leading-relaxed px-4">{error}</p>
          <button
            onClick={() => navigate("premium")}
            className="px-6 py-2.5 bg-[#FF657D] text-white rounded-xl text-xs font-bold shadow-md"
          >
            Go Back
          </button>
        </div>
        <HomeIndicator />
      </MobileLayout>
    );
  }

  const activeCurrency = orderData?.currency || (appCurrency || "USD").toUpperCase();

  // Local fallbacks matching backend pricingMatrix
  const localPricingMatrix: Record<string, Record<string, { rawPrice: number; discount: number; tax: number }>> = {
    USD: {
      monthly: { rawPrice: 4.99, discount: 0, tax: 0.40 },
      quarterly: { rawPrice: 14.97, discount: 3.00, tax: 0.90 },
      yearly: { rawPrice: 59.88, discount: 29.89, tax: 2.40 },
    },
    EUR: {
      monthly: { rawPrice: 4.99, discount: 0, tax: 0.40 },
      quarterly: { rawPrice: 14.97, discount: 3.00, tax: 0.90 },
      yearly: { rawPrice: 59.88, discount: 29.89, tax: 2.40 },
    },
    GBP: {
      monthly: { rawPrice: 3.99, discount: 0, tax: 0.32 },
      quarterly: { rawPrice: 11.97, discount: 1.98, tax: 0.80 },
      yearly: { rawPrice: 47.88, discount: 22.89, tax: 2.00 },
    },
    INR: {
      monthly: { rawPrice: 199, discount: 0, tax: 16 },
      quarterly: { rawPrice: 597, discount: 98, tax: 40 },
      yearly: { rawPrice: 2388, discount: 1089, tax: 104 },
    }
  };

  const currentPlanId = selectedPlanId || "yearly";
  const defaultPricing = localPricingMatrix[activeCurrency]?.[currentPlanId] || localPricingMatrix["USD"]["yearly"];

  const rawPrice = orderData?.rawPrice !== undefined ? orderData.rawPrice : defaultPricing.rawPrice;
  const discount = orderData?.discount !== undefined ? orderData.discount : defaultPricing.discount;
  const tax = orderData?.tax !== undefined ? orderData.tax : defaultPricing.tax;
  const totalAmount = orderData?.totalAmount || (rawPrice - discount + tax).toFixed(2);
  const totalINR = orderData?.totalINR || Math.round(parseFloat(totalAmount) * (activeCurrency === "GBP" ? 106 : activeCurrency === "EUR" ? 90 : activeCurrency === "INR" ? 1 : 83.5));

  const upiPayUrl = orderData?.upiPayUrl || "";
  const cardGatewayProvider = orderData?.gatewayProvider || "stripe";
  const cardGatewayKey = orderData?.gatewayKey || "";

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: activeCurrency === "INR" ? 0 : 2,
      maximumFractionDigits: activeCurrency === "INR" ? 0 : 2
    }).format(value);
  };

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

        <div className="flex-1 overflow-y-auto space-y-4 pb-6">
          {/* Order info */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between pb-2.5 border-b border-gray-50 text-xs">
                <span className="text-gray-500">{planName}</span>
                <span className="text-gray-900 font-bold">{formatCurrency(rawPrice)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between pb-2.5 border-b border-gray-50 text-xs">
                  <span className="text-gray-500">Discount ({isYearly ? "50%" : isQuarterly ? "20%" : "0%"} OFF)</span>
                  <span className="text-[#34D399] font-bold">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pb-2.5 border-b border-gray-50 text-xs">
                <span className="text-gray-500">Estimated Tax</span>
                <span className="text-gray-900 font-bold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-bold text-gray-900">Total Amount</span>
                <div className="text-right">
                  <p className="text-base font-bold text-[#FF657D]">{formatCurrency(totalAmount)} {activeCurrency}</p>
                  {activeCurrency !== "INR" && (
                    <p className="text-[10px] text-gray-400 font-bold">~ ₹{totalINR.toLocaleString()} INR</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chosen Payment method details */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">Payment Method</h3>
              <button onClick={() => navigate("payment-methods")} className="text-[#FF657D] text-xs font-bold">Change</button>
            </div>

            {/* Interactive Payment Method Tab Toggle */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mb-3">
              <button
                type="button"
                onClick={() => setPaymentType("upi")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${paymentType === "upi" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                ⚡ UPI / QR Code
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("card")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${paymentType === "card" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              >
                💳 Credit Card
              </button>
            </div>

            {/* Selected payment type card details */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100/50 mb-3">
              <span className="text-2xl">{isUpi ? "⚡" : primaryMethod.icon}</span>
              <div>
                <p className="text-[13px] font-bold text-gray-800">
                  {isUpi ? "UPI Mobile / QR Pay" : `${primaryMethod.name} ${primaryMethod.last4 ? `•••• ${primaryMethod.last4}` : ""}`}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">{isUpi ? "UPI Mobile Payment" : primaryMethod.type}</p>
              </div>
            </div>

            {/* Configured Gateway Info */}
            {!isUpi && (
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100/30 text-[11px] text-purple-700 flex items-start gap-2">
                <span className="text-base mt-0.5">🔒</span>
                <div>
                  <p className="font-bold capitalize">Secure Card Checkout via {cardGatewayProvider}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">Gateway Key: {cardGatewayKey.slice(0, 8)}...{cardGatewayKey.slice(-4)}</p>
                </div>
              </div>
            )}
          </div>

          {/* UPI Live Payment Section */}
          {isUpi && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              
              {/* App selector */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">Select UPI App to pay</h4>
                <div className="grid grid-cols-4 gap-2">
                  {upiApps.map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedUpiApp(app.id)}
                      className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${selectedUpiApp === app.id ? "bg-[#FFF5F6] text-[#FF657D] border-[#FF657D]" : "bg-gray-50 text-gray-500 border-gray-100"}`}
                    >
                      <span className="text-lg">{app.icon}</span>
                      <span className="text-[9px] font-bold">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Deep link pay button */}
              <div className="w-full pt-1">
                <a
                  href={upiPayUrl}
                  className="w-full py-3 bg-[#FF657D] hover:bg-[#FF4A68] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  📱 Pay via {upiApps.find(a => a.id === selectedUpiApp)?.name || "UPI App"}
                </a>
              </div>

              <div className="border-t border-gray-50 my-2 pt-3 flex flex-col items-center">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Or Scan QR Code</h4>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group flex justify-center items-center">
                  <QRCodeSVG value={upiPayUrl} size={144} level="H" includeMargin={true} />
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-0.5 bg-[#FF657D] absolute animate-[bounce_2s_infinite]" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed text-center px-4 mt-2">
                  Scan this QR code with your chosen UPI application to transfer <strong>₹{totalINR}</strong>.
                </p>
              </div>

              {/* UTR Input Section */}
              <div className="border-t border-gray-50 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UPI Ref No. / UTR (12-Digits)</label>
                  <button
                    type="button"
                    onClick={() => setShowUpiGuide(!showUpiGuide)}
                    className="text-[#FF657D] text-[10px] font-bold underline"
                  >
                    {showUpiGuide ? "Hide Guide" : "Where is UTR?"}
                  </button>
                </div>

                {/* Collapsible UTR Guide */}
                <AnimatePresence>
                  {showUpiGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100 overflow-hidden text-[11px] space-y-2.5"
                    >
                      <div className="flex gap-2 border-b border-gray-200/50 pb-1.5">
                        {(["gpay", "phonepe", "paytm"] as const).map(guideTab => (
                          <button
                            key={guideTab}
                            type="button"
                            onClick={() => setActiveUpiGuide(guideTab)}
                            className={`flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${activeUpiGuide === guideTab ? "bg-white text-gray-800 shadow-xs" : "text-gray-400"}`}
                          >
                            {guideTab === "gpay" ? "Google Pay" : guideTab === "phonepe" ? "PhonePe" : "Paytm"}
                          </button>
                        ))}
                      </div>

                      {activeUpiGuide === "gpay" && (
                        <ol className="list-decimal list-inside space-y-1 text-gray-500 font-medium">
                          <li>Open Google Pay &gt; Show Transaction History.</li>
                          <li>Select payment of <strong className="text-gray-700">₹{totalINR}</strong>.</li>
                          <li>Find the 12-digit **UPI Transaction ID** (starts with 4 or 5).</li>
                        </ol>
                      )}

                      {activeUpiGuide === "phonepe" && (
                        <ol className="list-decimal list-inside space-y-1 text-gray-500 font-medium">
                          <li>Go to PhonePe History tab.</li>
                          <li>Open the FlowAI transaction.</li>
                          <li>Copy the 12-digit number listed beside **UTR**.</li>
                        </ol>
                      )}

                      {activeUpiGuide === "paytm" && (
                        <ol className="list-decimal list-inside space-y-1 text-gray-500 font-medium">
                          <li>Open Paytm &gt; Balance &amp; History.</li>
                          <li>Select payment of <strong className="text-gray-700">₹{totalINR}</strong>.</li>
                          <li>Copy the 12-digit **UPI Ref No.**</li>
                        </ol>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="text"
                  required
                  value={utrInput}
                  onChange={e => setUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="Enter 12-digit transaction UTR"
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-[#FF657D] font-medium text-gray-800"
                />

                {utrError && <p className="text-[10px] font-bold text-red-500">{utrError}</p>}
              </div>

            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleVerifyConfirm}
            className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg flex items-center justify-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
          >
            {isUpi ? "Verify & Confirm Payment" : "Confirm Card Payment"}
          </motion.button>

          <p className="text-center text-gray-400 text-[10px] px-4 leading-relaxed">
            FlowAI uses secure bank-level encryption. By clicking confirm, you agree to enable Premium features.
          </p>
        </div>
      </div>
      <HomeIndicator />
    </MobileLayout>
  );
};

export const PaymentProgressScreen = () => {
  const { navigate, authUser, refreshSubscription, currency: appCurrency } = useApp();
  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const steps = [
    "Connecting to secure banking interface...",
    "Validating 12-digit UPI UTR reference...",
    "Confirming transaction settlement...",
    "Activating Premium access..."
  ];

  useEffect(() => {
    let active = true;

    const runVerification = async () => {
      try {
        // Step 0: Connecting
        await new Promise(resolve => setTimeout(resolve, 1200));
        if (!active) return;
        setActiveStep(1);

        // Step 1: Validating UTR
        const pendingUtr = localStorage.getItem("flowai_pending_utr") || "";
        const pendingPlanId = localStorage.getItem("flowai_pending_plan_id") || "yearly";
        const pendingMethod = localStorage.getItem("flowai_pending_method") || "UPI Mobile Payment";
        const userId = authUser?.id;

        if (!userId) {
          throw new Error("You must be logged in to verify a payment.");
        }

        const res = await fetch("/api/payments/verify-utr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            utr: pendingUtr,
            userId,
            planId: pendingPlanId,
            methodName: pendingMethod,
            currency: appCurrency
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Payment verification failed.");
        }

        // Verification succeeded! Move to step 2 (Confirming settlement)
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!active) return;
        setActiveStep(2);

        // Move to step 3 (Activating premium)
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!active) return;
        setActiveStep(3);

        // Call refreshSubscription to load the new premium state securely from Supabase
        await refreshSubscription();

        // Wait a bit on final step before navigating
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!active) return;

        // Clean up pending storage
        localStorage.removeItem("flowai_pending_utr");
        localStorage.removeItem("flowai_pending_plan_id");
        localStorage.removeItem("flowai_pending_method");

        navigate("congratulations");
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || "An unexpected error occurred during verification.");
        }
      }
    };

    runVerification();

    return () => {
      active = false;
    };
  }, [authUser]);

  return (
    <MobileLayout gradient="linear-gradient(180deg, #F9F9F9 0%, #FFE7EA 100%)">
      <StatusBar />
      <div className="flex flex-col h-[calc(100svh-45px-34px)] justify-center px-6">
        <div className="flex flex-col items-center mb-8">
          {errorMsg ? (
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-[#FFE7EA] border-t-[#FF657D] mb-4"
            />
          )}
          <h2 className="text-[20px] font-bold text-gray-900 mb-1" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
            {errorMsg ? "Verification Failed" : "Verifying Transaction"}
          </h2>
          <p className="text-gray-400 text-xs text-center px-4 leading-relaxed">
            {errorMsg ? "Please review the details below and try again." : "Please wait. Do not close the app or tap back."}
          </p>
        </div>

        {errorMsg ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-red-50 rounded-3xl p-5 border border-red-100/60 text-xs text-red-700 font-semibold leading-relaxed">
              {errorMsg}
            </div>
            <button
              onClick={() => navigate("payment-summary")}
              className="w-full py-4 rounded-2xl text-white font-semibold text-[16px] shadow-lg"
              style={{ background: "linear-gradient(135deg, #FF8FA3, #FF657D)" }}
            >
              Go Back to Summary
            </button>
          </motion.div>
        ) : (
          /* Steps progression */
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
            {steps.map((step, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;

              return (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#FF657D] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200" />
                    )}
                  </div>
                  <span className={`text-[13px] font-medium leading-tight ${isActive ? "text-gray-800 font-bold" : isCompleted ? "text-gray-500" : "text-gray-300"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
