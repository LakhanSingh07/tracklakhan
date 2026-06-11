import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Provider, Session, User } from "@supabase/supabase-js";
import { requireSupabase, supabase } from "@/lib/supabase";

export type Screen =
  | "splash"
  | "onboarding"
  | "auth-signup"
  | "auth-signup-form"
  | "auth-signin"
  | "auth-otp"
  | "auth-password"
  | "auth-success"
  | "auth-reset-success"
  | "profile-setup"
  | "profile-preparing"
  | "notifications"
  | "symptom-tracker"
  | "prediction"
  | "home"
  | "calendar"
  | "log-entry"
  | "log-mood"
  | "log-weight"
  | "log-temperature"
  | "log-water"
  | "tracker"
  | "health-bar"
  | "health-area"
  | "cycles"
  | "phase-period"
  | "phase-growth"
  | "phase-release"
  | "phase-progesterone"
  | "edit-period"
  | "ai-coach"
  | "insights"
  | "pcos"
  | "community"
  | "account"
  | "personal-data"
  | "preferences"
  | "reminder"
  | "account-security"
  | "premium"
  | "billing"
  | "payment-methods"
  | "payment-summary"
  | "payment-progress"
  | "congratulations"
  | "logout-confirm"
  | "health-report"
  | "wellness-steps"
  | "wellness-water"
  | "wellness-sleep"
  | "merchant-config";

interface CycleDay {
  date: number;
  type: "period" | "fertile" | "ovulation" | "normal";
  logged?: boolean;
}

interface LogEntry {
  date: string;
  flow?: "light" | "medium" | "heavy";
  mood?: string;
  weight?: number;
  temperature?: number;
  water?: number;
  notes?: string;
  symptoms?: string[];
}

interface ProfileData {
  name: string;
  birthday: string;
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "ft";
  periodLength: number;
  cycleLength: number;
  lastPeriodDate: string;
  hasPCOS?: boolean;
}

export interface StepsLog {
  date: string;
  steps: number;
  source: "manual" | "health-connect";
}

export interface WaterLog {
  date: string;
  amount: number;
}

export interface SleepLog {
  date: string;
  duration: number;
  quality: "poor" | "fair" | "good" | "excellent";
}

interface AppState {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  previousScreen: Screen | null;
  goBack: () => void;
  authLoading: boolean;
  authUser: User | null;
  authSession: Session | null;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  cycleData: {
    lastPeriodStart: Date;
    cycleLength: number;
    periodLength: number;
    nextPeriod: Date;
    currentDay: number;
    phase: string;
    daysUntilNextPeriod: number;
  };
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
  todayWater: number;
  setTodayWater: (ml: number) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  updateUserProfile: (data: ProfileData) => void;
  birthday: string;
  weight: number;
  weightUnit: "kg" | "lbs";
  height: number;
  heightUnit: "cm" | "ft";
  hasPCOS: boolean;
  stepsLogs: StepsLog[];
  stepsGoal: number;
  setStepsGoal: (goal: number) => void;
  addStepsLog: (log: StepsLog) => void;
  waterLogs: WaterLog[];
  waterGoal: number;
  setWaterGoal: (goal: number) => void;
  addWaterLog: (log: WaterLog) => void;
  sleepLogs: SleepLog[];
  sleepGoal: number;
  setSleepGoal: (goal: number) => void;
  addSleepLog: (log: SleepLog) => void;
  getTodaySteps: () => number;
  getTodayWaterTotal: () => number;
  getLastSleep: () => SleepLog | null;
  getStepStreak: () => number;
  periodReminder: boolean;
  setPeriodReminder: (val: boolean) => void;
  fertileReminder: boolean;
  setFertileReminder: (val: boolean) => void;
  logReminder: boolean;
  setLogReminder: (val: boolean) => void;
  ovulationReminder: boolean;
  setOvulationReminder: (val: boolean) => void;
  alertVolume: number;
  setAlertVolume: (val: number) => void;
  alertRingtone: string;
  setAlertRingtone: (val: string) => void;
  isPremium: boolean;
  updatePremiumStatus: (status: boolean) => void;
  paymentMethods: any[];
  addPaymentMethod: (method: any) => void;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  billingHistory: any[];
  addBillingHistoryEntry: (entry: any) => void;
  merchantUpiId: string;
  merchantName: string;
  cardGatewayProvider: "stripe" | "razorpay" | "mock";
  cardGatewayKey: string;
  updateMerchantConfig: (config: { upiId: string; name: string; provider: "stripe" | "razorpay" | "mock"; key: string }) => void;
  refreshSubscription: () => Promise<void>;
  language: string;
  currency: string;
  setAppLanguage: (lang: string) => Promise<void>;
  setAppCurrency: (curr: string) => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const defaultLastPeriod = new Date(2024, 2, 1);
const defaultCycleLength = 28;

const getPhase = (day: number) => {
  if (day <= 5) return "Menstrual";
  if (day <= 13) return "Follicular";
  if (day === 14) return "Ovulation";
  return "Luteal";
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];
const getAuthRedirectUrl = () => window.location.origin;

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [todayWater, setTodayWater] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userName, setUserName] = useState("");
  const [cycleLengthState, setCycleLengthState] = useState(defaultCycleLength);
  const [periodLengthState, setPeriodLengthState] = useState(5);
  const [lastPeriodState, setLastPeriodState] = useState(defaultLastPeriod);
  const [birthday, setBirthday] = useState("");
  const [weight, setWeight] = useState(60);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [height, setHeight] = useState(165);
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [hasPCOS, setHasPCOS] = useState(false);

  const [stepsLogs, setStepsLogs] = useState<StepsLog[]>([]);
  const [stepsGoal, setStepsGoalLocal] = useState(10000);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [waterGoal, setWaterGoalLocal] = useState(3000);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [sleepGoal, setSleepGoalLocal] = useState(8);

  const [periodReminder, setPeriodReminderLocal] = useState(() => {
    return localStorage.getItem("flowai_period_reminder") !== "false";
  });
  const [fertileReminder, setFertileReminderLocal] = useState(() => {
    return localStorage.getItem("flowai_fertile_reminder") !== "false";
  });
  const [logReminder, setLogReminderLocal] = useState(() => {
    return localStorage.getItem("flowai_log_reminder") === "true";
  });
  const [ovulationReminder, setOvulationReminderLocal] = useState(() => {
    return localStorage.getItem("flowai_ovulation_reminder") !== "false";
  });
  const [alertVolume, setAlertVolumeLocal] = useState(() => {
    const v = localStorage.getItem("flowai_alert_volume");
    return v ? Number(v) : 70;
  });
  const [alertRingtone, setAlertRingtoneLocal] = useState(() => {
    return localStorage.getItem("flowai_alert_ringtone") || "Classic";
  });

  // Premium and Billing states
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlanId, setSelectedPlanIdState] = useState("yearly");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  // Merchant details configuration
  const [merchantUpiId, setMerchantUpiId] = useState(() => {
    const local = localStorage.getItem("flowai_merchant_upi");
    const env = import.meta.env.VITE_MERCHANT_UPI_ID;
    if (env && env !== "flowai@okaxis") {
      if (!local || local === "flowai@okaxis") {
        return env;
      }
    }
    return local || env || "flowai@okaxis";
  });
  const [merchantName, setMerchantName] = useState(() => {
    const local = localStorage.getItem("flowai_merchant_name");
    const env = import.meta.env.VITE_MERCHANT_NAME;
    if (env && env !== "FlowAI Inc") {
      if (!local || local === "FlowAI Inc") {
        return env;
      }
    }
    return local || env || "FlowAI Inc";
  });
  const [cardGatewayProvider, setCardGatewayProvider] = useState<"stripe" | "razorpay" | "mock">(() => {
    const local = localStorage.getItem("flowai_merchant_provider") as any;
    const env = import.meta.env.VITE_CARD_GATEWAY_PROVIDER;
    if (env && env !== "stripe") {
      if (!local || local === "stripe") {
        return env as any;
      }
    }
    return local || env || "stripe";
  });
  const [cardGatewayKey, setCardGatewayKey] = useState(() => {
    const local = localStorage.getItem("flowai_merchant_key");
    const env = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (env && env !== "pk_test_51PxFlowAITestKey") {
      if (!local || local === "pk_test_51PxFlowAITestKey") {
        return env;
      }
    }
    return local || env || "pk_test_51PxFlowAITestKey";
  });
  const [language, setLanguage] = useState(() => localStorage.getItem("flowai_language") || "en");
  const [currency, setCurrency] = useState(() => localStorage.getItem("flowai_currency") || "USD");

  const setAppLanguage = async (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("flowai_language", lang);
    const i18n = (await import("@/lib/i18n")).default;
    i18n.changeLanguage(lang);

    if (authSession?.user) {
      try {
        await supabase!
          .from("profiles")
          .update({ preferred_language: lang })
          .eq("id", authSession.user.id);
      } catch (err) {
        console.warn("Failed to sync language to Supabase profile:", err);
      }
    }
  };

  const setAppCurrency = async (curr: string) => {
    setCurrency(curr);
    localStorage.setItem("flowai_currency", curr);

    if (authSession?.user) {
      try {
        await supabase!
          .from("profiles")
          .update({ preferred_currency: curr })
          .eq("id", authSession.user.id);
      } catch (err) {
        console.warn("Failed to sync currency to Supabase profile:", err);
      }
    }
  };

  const updateMerchantConfig = async (config: { upiId: string; name: string; provider: "stripe" | "razorpay" | "mock"; key: string }) => {
    setMerchantUpiId(config.upiId);
    setMerchantName(config.name);
    setCardGatewayProvider(config.provider);
    setCardGatewayKey(config.key);

    localStorage.setItem("flowai_merchant_upi", config.upiId);
    localStorage.setItem("flowai_merchant_name", config.name);
    localStorage.setItem("flowai_merchant_provider", config.provider);
    localStorage.setItem("flowai_merchant_key", config.key);

    if (authSession?.user) {
      try {
        await supabase!.auth.updateUser({
          data: {
            dev_merchant_upi: config.upiId,
            dev_merchant_name: config.name,
            dev_merchant_provider: config.provider,
            dev_merchant_key: config.key
          }
        });
      } catch (err) {
        console.warn("Failed to sync merchant config to user metadata:", err);
      }
    }
  };

  const setSelectedPlanId = async (id: string) => {
    setSelectedPlanIdState(id);
    const userId = authSession?.user?.id || "anonymous";
    localStorage.setItem(`flowai_plan_id_${userId}`, id);
    // Client-side database writes for selected plan are disabled.
  };

  useEffect(() => {
    const userId = authSession?.user?.id || "anonymous";
    const meta = authSession?.user?.user_metadata || {};

    // Load Premium status & plan from local storage first as fallbacks
    setIsPremium(localStorage.getItem(`flowai_premium_${userId}`) === "true");
    setSelectedPlanIdState(localStorage.getItem(`flowai_plan_id_${userId}`) || "yearly");

    // Load payment methods
    let methodsVal: any[] = [];
    const savedMethods = localStorage.getItem(`flowai_pm_${userId}`);
    if (savedMethods) {
      methodsVal = JSON.parse(savedMethods);
    } else {
      methodsVal = [
        { id: "visa", icon: "💳", name: "Visa", last4: "4242", type: "Credit/Debit Card", active: true }
      ];
    }
    setPaymentMethods(methodsVal);

    // Load billing history
    let historyVal: any[] = [];
    const savedHistory = localStorage.getItem(`flowai_bh_${userId}`);
    if (savedHistory) {
      historyVal = JSON.parse(savedHistory);
    }
    setBillingHistory(historyVal);

    // Load Merchant config
    const defaultUpi = "flowai@okaxis";
    const defaultName = "FlowAI Inc";
    const defaultProvider = "stripe";
    const defaultKey = "pk_test_51PxFlowAITestKey";

    const envUpi = import.meta.env.VITE_MERCHANT_UPI_ID || defaultUpi;
    const envName = import.meta.env.VITE_MERCHANT_NAME || defaultName;
    const envProvider = import.meta.env.VITE_CARD_GATEWAY_PROVIDER || defaultProvider;
    const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || defaultKey;

    let finalUpi = envUpi;
    if (authSession?.user && meta.dev_merchant_upi !== undefined) {
      if (meta.dev_merchant_upi === defaultUpi && envUpi !== defaultUpi) {
        finalUpi = envUpi;
      } else {
        finalUpi = meta.dev_merchant_upi;
      }
    } else {
      const local = localStorage.getItem("flowai_merchant_upi");
      if (local) {
        if (local === defaultUpi && envUpi !== defaultUpi) {
          finalUpi = envUpi;
        } else {
          finalUpi = local;
        }
      }
    }
    setMerchantUpiId(finalUpi);

    let finalName = envName;
    if (authSession?.user && meta.dev_merchant_name !== undefined) {
      if (meta.dev_merchant_name === defaultName && envName !== defaultName) {
        finalName = envName;
      } else {
        finalName = meta.dev_merchant_name;
      }
    } else {
      const local = localStorage.getItem("flowai_merchant_name");
      if (local) {
        if (local === defaultName && envName !== defaultName) {
          finalName = envName;
        } else {
          finalName = local;
        }
      }
    }
    setMerchantName(finalName);

    let finalProvider: "stripe" | "razorpay" | "mock" = envProvider as any;
    if (authSession?.user && meta.dev_merchant_provider !== undefined) {
      if (meta.dev_merchant_provider === defaultProvider && envProvider !== defaultProvider) {
        finalProvider = envProvider as any;
      } else {
        finalProvider = meta.dev_merchant_provider;
      }
    } else {
      const local = localStorage.getItem("flowai_merchant_provider") as any;
      if (local) {
        if (local === defaultProvider && envProvider !== defaultProvider) {
          finalProvider = envProvider as any;
        } else {
          finalProvider = local;
        }
      }
    }
    setCardGatewayProvider(finalProvider);

    let finalKey = envKey;
    if (authSession?.user && meta.dev_merchant_key !== undefined) {
      if (meta.dev_merchant_key === defaultKey && envKey !== defaultKey) {
        finalKey = envKey;
      } else {
        finalKey = meta.dev_merchant_key;
      }
    } else {
      const local = localStorage.getItem("flowai_merchant_key");
      if (local) {
        if (local === defaultKey && envKey !== defaultKey) {
          finalKey = envKey;
        } else {
          finalKey = local;
        }
      }
    }
    setCardGatewayKey(finalKey);

    // Save resolved config to local storage
    localStorage.setItem("flowai_merchant_upi", finalUpi);
    localStorage.setItem("flowai_merchant_name", finalName);
    localStorage.setItem("flowai_merchant_provider", finalProvider);
    localStorage.setItem("flowai_merchant_key", finalKey);

    // Sync only developer merchant parameters to auth user metadata if needed (or if they changed/default updated)
    if (authSession?.user) {
      const needsSync =
        meta.dev_merchant_upi === undefined ||
        meta.dev_merchant_name === undefined ||
        meta.dev_merchant_provider === undefined ||
        meta.dev_merchant_key === undefined ||
        meta.dev_merchant_upi !== finalUpi ||
        meta.dev_merchant_name !== finalName ||
        meta.dev_merchant_provider !== finalProvider ||
        meta.dev_merchant_key !== finalKey;

      if (needsSync) {
        supabase!.auth.updateUser({
          data: {
            dev_merchant_upi: finalUpi,
            dev_merchant_name: finalName,
            dev_merchant_provider: finalProvider,
            dev_merchant_key: finalKey
          }
        }).catch(err => console.warn("Failed to sync initial local merchant config to Supabase metadata:", err));
      }
    }
  }, [authSession]);

  const updatePremiumStatus = async (status: boolean) => {
    setIsPremium(status);
    const userId = authSession?.user?.id || "anonymous";
    localStorage.setItem(`flowai_premium_${userId}`, String(status));
    // Client-side database writes for premium are disabled for security.
  };

  const addPaymentMethod = async (method: any) => {
    const userId = authSession?.user?.id || "anonymous";
    const next = [...paymentMethods, method];
    setPaymentMethods(next);
    localStorage.setItem(`flowai_pm_${userId}`, JSON.stringify(next));
    // Client-side database writes for payment methods are disabled for security.
  };

  const addBillingHistoryEntry = async (entry: any) => {
    const userId = authSession?.user?.id || "anonymous";
    const next = [entry, ...billingHistory];
    setBillingHistory(next);
    localStorage.setItem(`flowai_bh_${userId}`, JSON.stringify(next));
    // Client-side database writes for billing history are disabled for security.
  };

  const refreshSubscription = async () => {
    if (!authSession?.user) return;
    try {
      const { data: subData } = await supabase!
        .from("subscriptions")
        .select("*")
        .eq("user_id", authSession.user.id)
        .maybeSingle();

      if (subData) {
        setIsPremium(subData.is_premium);
        setSelectedPlanIdState(subData.selected_plan_id || "yearly");
        setPaymentMethods(subData.payment_methods || []);
        setBillingHistory(subData.billing_history || []);
      }
    } catch (err) {
      console.warn("Failed to refresh subscription from Supabase:", err);
    }
  };

  const setPeriodReminder = (val: boolean) => {
    setPeriodReminderLocal(val);
    localStorage.setItem("flowai_period_reminder", String(val));
  };
  const setFertileReminder = (val: boolean) => {
    setFertileReminderLocal(val);
    localStorage.setItem("flowai_fertile_reminder", String(val));
  };
  const setLogReminder = (val: boolean) => {
    setLogReminderLocal(val);
    localStorage.setItem("flowai_log_reminder", String(val));
  };
  const setOvulationReminder = (val: boolean) => {
    setOvulationReminderLocal(val);
    localStorage.setItem("flowai_ovulation_reminder", String(val));
  };
  const setAlertVolume = (val: number) => {
    setAlertVolumeLocal(val);
    localStorage.setItem("flowai_alert_volume", String(val));
  };
  const setAlertRingtone = (val: string) => {
    setAlertRingtoneLocal(val);
    localStorage.setItem("flowai_alert_ringtone", val);
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Automatically clean up sensitive tokens from the browser URL bar after Supabase parses them
    if (window.location.hash.includes("access_token") || window.location.hash.includes("refresh_token")) {
      setTimeout(() => {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }, 500);
    }

    supabase.auth.getSession().then(({ data }) => {
      setAuthSession(data.session);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthSession(session);
      setAuthLoading(false);
      if (event === "PASSWORD_RECOVERY") {
        setPreviousScreen("auth-signin");
        setCurrentScreen("auth-password");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authSession?.user) {
      setLogs([]);
      setStepsLogs([]);
      setWaterLogs([]);
      setSleepLogs([]);
      setUserName("");
      setBirthday("");
      setWeight(60);
      setWeightUnit("kg");
      setHeight(165);
      setHeightUnit("cm");
      setHasPCOS(false);
      setCycleLengthState(defaultCycleLength);
      setPeriodLengthState(5);
      setLastPeriodState(defaultLastPeriod);
      setStepsGoalLocal(10000);
      setWaterGoalLocal(3000);
      setSleepGoalLocal(8);
      setIsPremium(false);
      setSelectedPlanIdState("yearly");
      setPaymentMethods([]);
      setBillingHistory([]);
      return;
    }

    const loadData = async () => {
      const userId = authSession.user.id;

      try {
        // Load subscription data from public.subscriptions
        const { data: subData } = await supabase!
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (subData) {
          setIsPremium(subData.is_premium);
          setSelectedPlanIdState(subData.selected_plan_id || "yearly");
          setPaymentMethods(subData.payment_methods || []);
          setBillingHistory(subData.billing_history || []);
        } else {
          setIsPremium(false);
          setPaymentMethods([]);
          setBillingHistory([]);
        }

        const { data: profile } = await supabase!
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profile) {
          setUserName(profile.name || "");
          setBirthday(profile.birthday || "");
          setWeight(profile.weight ? Number(profile.weight) : 60);
          setWeightUnit(profile.weight_unit || "kg");
          setHeight(profile.height ? Number(profile.height) : 165);
          setHeightUnit(profile.height_unit || "cm");
          setHasPCOS(profile.has_pcos || false);
          setCycleLengthState(profile.cycle_length || defaultCycleLength);
          setPeriodLengthState(profile.period_length || 5);
          if (profile.last_period_date) {
            setLastPeriodState(new Date(profile.last_period_date));
          }
          setStepsGoalLocal(profile.steps_goal || 10000);
          setWaterGoalLocal(profile.water_goal || 3000);
          setSleepGoalLocal(Number(profile.sleep_goal) || 8);

          if (profile.preferred_language) {
            setLanguage(profile.preferred_language);
            localStorage.setItem("flowai_language", profile.preferred_language);
            const i18n = (await import("@/lib/i18n")).default;
            i18n.changeLanguage(profile.preferred_language);
          }
          if (profile.preferred_currency) {
            setCurrency(profile.preferred_currency);
            localStorage.setItem("flowai_currency", profile.preferred_currency);
          }
        } else {
          navigate("profile-setup");
        }

        const { data: healthLogs } = await supabase!
          .from("health_logs")
          .select("*")
          .eq("user_id", userId);

        if (healthLogs) {
          setLogs(healthLogs.map(l => ({
            date: l.date,
            flow: l.flow || undefined,
            mood: l.mood || undefined,
            weight: l.weight ? Number(l.weight) : undefined,
            temperature: l.temperature ? Number(l.temperature) : undefined,
            water: l.water || undefined,
            notes: l.notes || undefined,
            symptoms: l.symptoms || [],
          })));
        }

        const { data: steps } = await supabase!
          .from("steps_logs")
          .select("*")
          .eq("user_id", userId);

        if (steps) {
          setStepsLogs(steps.map(s => ({
            date: s.date,
            steps: s.steps,
            source: s.source,
          })));
        }

        const { data: water } = await supabase!
          .from("water_logs")
          .select("*")
          .eq("user_id", userId);

        if (water) {
          setWaterLogs(water.map(w => ({
            date: w.date,
            amount: w.amount,
          })));
          
          const todayStr = formatDate(new Date());
          const todayWaterTotal = water.find(w => w.date === todayStr)?.amount ?? 0;
          setTodayWater(todayWaterTotal);
        }

        const { data: sleep } = await supabase!
          .from("sleep_logs")
          .select("*")
          .eq("user_id", userId);

        if (sleep) {
          setSleepLogs(sleep.map(s => ({
            date: s.date,
            duration: Number(s.duration),
            quality: s.quality,
          })));
        }
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    };

    loadData();
  }, [authSession]);

  const navigate = (screen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    }
  };

  const addLog = async (entry: LogEntry) => {
    let merged = entry;
    setLogs(prev => {
      const existing = prev.find(l => l.date === entry.date);
      merged = existing ? { ...existing, ...entry } : entry;
      return [...prev.filter(l => l.date !== entry.date), merged];
    });

    if (authSession?.user) {
      try {
        await supabase!.from("health_logs").upsert({
          user_id: authSession.user.id,
          date: merged.date,
          flow: merged.flow || null,
          mood: merged.mood || null,
          weight: merged.weight || null,
          temperature: merged.temperature || null,
          water: merged.water || null,
          notes: merged.notes || null,
          symptoms: merged.symptoms || [],
        });
      } catch (err) {
        console.error("Error saving health log to Supabase:", err);
      }
    }
  };

  const updateUserProfile = async (data: ProfileData) => {
    setUserName(data.name || "");
    setBirthday(data.birthday || "");
    setWeight(data.weight || 60);
    setWeightUnit(data.weightUnit || "kg");
    setHeight(data.height || 165);
    setHeightUnit(data.heightUnit || "cm");
    setHasPCOS(data.hasPCOS ?? false);
    setCycleLengthState(data.cycleLength || defaultCycleLength);
    setPeriodLengthState(data.periodLength || 5);
    if (data.lastPeriodDate) {
      setLastPeriodState(new Date(data.lastPeriodDate));
    }

    if (authSession?.user) {
      try {
        await supabase!
          .from("profiles")
          .upsert({
            id: authSession.user.id,
            name: data.name,
            birthday: data.birthday,
            weight: data.weight,
            weight_unit: data.weightUnit,
            height: data.height,
            height_unit: data.heightUnit,
            period_length: data.periodLength,
            cycle_length: data.cycleLength,
            last_period_date: data.lastPeriodDate,
            has_pcos: data.hasPCOS ?? false,
            steps_goal: stepsGoal,
            water_goal: waterGoal,
            sleep_goal: sleepGoal,
          });
      } catch (err) {
        console.error("Error upserting profile in Supabase:", err);
      }
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) throw error;
    setUserName(name);
    setAuthSession(data.session);
    navigate(data.session ? "profile-setup" : "auth-success");
  };

  const signInWithEmail = async (email: string, password: string) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) throw error;

    try {
      const { data: mfaData } = await client.auth.mfa.listFactors();
      const activeFactors = mfaData?.all?.filter((f: any) => f.status === "verified") || [];
      if (activeFactors.length > 0) {
        setAuthSession(data.session);
        return { mfaRequired: true, factorId: activeFactors[0].id };
      }
    } catch (mfaErr) {
      console.warn("MFA check failed, proceeding normally:", mfaErr);
    }

    setAuthSession(data.session);
    navigate("home");
    return { mfaRequired: false };
  };

  const signInWithProvider = async (provider: Provider) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });

    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.updateUser({ password });

    if (error) throw error;
    navigate("auth-reset-success");
  };

  const signOut = async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();

    if (error) throw error;
    setAuthSession(null);
    navigate("auth-signin");
  };

  const addStepsLog = async (log: StepsLog) => {
    setStepsLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date);
      return [...filtered, log];
    });

    if (authSession?.user) {
      try {
        await supabase!.from("steps_logs").upsert({
          user_id: authSession.user.id,
          date: log.date,
          steps: log.steps,
          source: log.source,
        });
      } catch (err) {
        console.error("Error saving steps log to Supabase:", err);
      }
    }
  };

  const addWaterLog = async (log: WaterLog) => {
    let newAmount = log.amount;
    setWaterLogs(prev => {
      const existingIdx = prev.findIndex(l => l.date === log.date);
      if (existingIdx >= 0) {
        newAmount = prev[existingIdx].amount + log.amount;
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], amount: newAmount };
        return updated;
      }
      return [...prev, log];
    });

    const todayStr = formatDate(new Date());
    if (log.date === todayStr) {
      setTodayWater(prev => prev + log.amount);
    }

    if (authSession?.user) {
      try {
        await supabase!.from("water_logs").upsert({
          user_id: authSession.user.id,
          date: log.date,
          amount: newAmount,
        });
      } catch (err) {
        console.error("Error saving water log to Supabase:", err);
      }
    }
  };

  const addSleepLog = async (log: SleepLog) => {
    setSleepLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date);
      return [...filtered, log];
    });

    if (authSession?.user) {
      try {
        await supabase!.from("sleep_logs").upsert({
          user_id: authSession.user.id,
          date: log.date,
          duration: log.duration,
          quality: log.quality,
        });
      } catch (err) {
        console.error("Error saving sleep log to Supabase:", err);
      }
    }
  };

  const getTodaySteps = () => {
    const todayStr = formatDate(new Date());
    return stepsLogs.find(l => l.date === todayStr)?.steps ?? 0;
  };

  const getTodayWaterTotal = () => {
    const todayStr = formatDate(new Date());
    return waterLogs.find(l => l.date === todayStr)?.amount ?? todayWater;
  };

  const getLastSleep = () => {
    if (sleepLogs.length === 0) return null;
    const sorted = [...sleepLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0];
  };

  const getStepStreak = () => {
    const sorted = [...stepsLogs].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const expected = new Date(now);
      expected.setDate(now.getDate() - i);
      const expectedStr = formatDate(expected);
      const log = sorted.find(l => l.date === expectedStr);
      if (log && log.steps >= stepsGoal * 0.5) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const setStepsGoal = async (goal: number) => {
    setStepsGoalLocal(goal);
    if (authSession?.user) {
      try {
        await supabase!.from("profiles").update({ steps_goal: goal }).eq("id", authSession.user.id);
      } catch (err) {
        console.error("Error updating steps goal in Supabase:", err);
      }
    }
  };

  const setWaterGoal = async (goal: number) => {
    setWaterGoalLocal(goal);
    if (authSession?.user) {
      try {
        await supabase!.from("profiles").update({ water_goal: goal }).eq("id", authSession.user.id);
      } catch (err) {
        console.error("Error updating water goal in Supabase:", err);
      }
    }
  };

  const setSleepGoal = async (goal: number) => {
    setSleepGoalLocal(goal);
    if (authSession?.user) {
      try {
        await supabase!.from("profiles").update({ sleep_goal: goal }).eq("id", authSession.user.id);
      } catch (err) {
        console.error("Error updating sleep goal in Supabase:", err);
      }
    }
  };

  const computedLastPeriod = lastPeriodState;
  const computedCycleLength = cycleLengthState;
  const computedNextPeriod = new Date(computedLastPeriod);
  computedNextPeriod.setDate(computedLastPeriod.getDate() + computedCycleLength);
  const daysSince = Math.floor((new Date().getTime() - computedLastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const computedCurrentDay = (daysSince % computedCycleLength) + 1;
  const computedDaysUntilNext = computedCycleLength - (daysSince % computedCycleLength);

  const authUser = authSession?.user ?? null;
  const displayName = userName || authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Maria";
  const displayEmail = authUser?.email || "maria@example.com";

  return (
    <AppContext.Provider value={{
      currentScreen,
      navigate,
      previousScreen,
      goBack,
      authLoading,
      authUser,
      authSession,
      signUpWithEmail,
      signInWithEmail,
      signInWithProvider,
      resetPassword,
      updatePassword,
      signOut,
      user: { name: displayName, email: displayEmail, avatar: undefined },
      cycleData: {
        lastPeriodStart: computedLastPeriod,
        cycleLength: computedCycleLength,
        periodLength: periodLengthState,
        nextPeriod: computedNextPeriod,
        currentDay: computedCurrentDay,
        phase: getPhase(computedCurrentDay),
        daysUntilNextPeriod: computedDaysUntilNext,
      },
      logs,
      addLog,
      todayWater,
      setTodayWater,
      selectedDate,
      setSelectedDate,
      updateUserProfile,
      birthday,
      weight,
      weightUnit,
      height,
      heightUnit,
      hasPCOS,
      stepsLogs,
      stepsGoal,
      setStepsGoal,
      addStepsLog,
      waterLogs,
      waterGoal,
      setWaterGoal,
      addWaterLog,
      sleepLogs,
      sleepGoal,
      setSleepGoal,
      addSleepLog,
      getTodaySteps,
      getTodayWaterTotal,
      getLastSleep,
      getStepStreak,
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
      isPremium,
      updatePremiumStatus,
      paymentMethods,
      addPaymentMethod,
      selectedPlanId,
      setSelectedPlanId,
      billingHistory,
      addBillingHistoryEntry,
      merchantUpiId,
      merchantName,
      cardGatewayProvider,
      cardGatewayKey,
      updateMerchantConfig,
      refreshSubscription,
      language,
      currency,
      setAppLanguage,
      setAppCurrency,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
