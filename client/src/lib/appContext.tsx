import React, { createContext, useContext, useState, ReactNode } from "react";

export type Screen =
  | "splash"
  | "onboarding"
  | "auth-signup"
  | "auth-signup-form"
  | "auth-signin"
  | "auth-otp"
  | "auth-password"
  | "auth-success"
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
  | "account"
  | "personal-data"
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
  | "wellness-sleep";

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
}

const AppContext = createContext<AppState | null>(null);

const lastPeriod = new Date(2024, 2, 1);
const cycleLength = 28;
const nextPeriod = new Date(lastPeriod);
nextPeriod.setDate(lastPeriod.getDate() + cycleLength);
const today = new Date();
const daysSincePeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
const currentDay = (daysSincePeriod % cycleLength) + 1;
const daysUntilNext = cycleLength - (daysSincePeriod % cycleLength);

const getPhase = (day: number) => {
  if (day <= 5) return "Menstrual";
  if (day <= 13) return "Follicular";
  if (day === 14) return "Ovulation";
  return "Luteal";
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const genMockSteps = (): StepsLog[] => {
  const logs: StepsLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const base = 5500 + Math.floor(Math.random() * 5000);
    logs.push({ date: formatDate(d), steps: i === 0 ? 6432 : base, source: "manual" });
  }
  return logs;
};

const genMockWater = (): WaterLog[] => {
  const logs: WaterLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const base = 1200 + Math.floor(Math.random() * 1800);
    logs.push({ date: formatDate(d), amount: i === 0 ? 1540 : base });
  }
  return logs;
};

const genMockSleep = (): SleepLog[] => {
  const qualities: SleepLog["quality"][] = ["poor", "fair", "good", "excellent"];
  const logs: SleepLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dur = 5.5 + Math.random() * 3;
    const q = qualities[Math.floor(Math.random() * 4)];
    logs.push({ date: formatDate(d), duration: Math.round(dur * 2) / 2, quality: i === 0 ? "good" : q });
  }
  return logs;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { date: "2024-03-01", flow: "medium", mood: "😊", weight: 58, temperature: 36.5, water: 1800 },
    { date: "2024-03-02", flow: "heavy", mood: "😴", weight: 58.2, temperature: 36.6, water: 2000 },
    { date: "2024-03-03", flow: "medium", mood: "😐", weight: 57.9, temperature: 36.4, water: 1600 },
    { date: "2024-03-04", flow: "light", mood: "😊", weight: 57.8, temperature: 36.5, water: 2200 },
    { date: "2024-03-05", flow: "light", mood: "😄", weight: 57.7, temperature: 36.3, water: 1900 },
  ]);
  const [todayWater, setTodayWater] = useState(1540);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userName, setUserName] = useState("Maria");
  const [cycleLengthState, setCycleLengthState] = useState(cycleLength);
  const [periodLengthState, setPeriodLengthState] = useState(5);
  const [lastPeriodState, setLastPeriodState] = useState(lastPeriod);

  const [stepsLogs, setStepsLogs] = useState<StepsLog[]>(genMockSteps);
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(genMockWater);
  const [waterGoal, setWaterGoal] = useState(3000);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(genMockSleep);
  const [sleepGoal, setSleepGoal] = useState(8);

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

  const addLog = (entry: LogEntry) => {
    setLogs(prev => [...prev.filter(l => l.date !== entry.date), entry]);
  };

  const updateUserProfile = (data: ProfileData) => {
    setUserName(data.name || "Maria");
    setCycleLengthState(data.cycleLength || 28);
    setPeriodLengthState(data.periodLength || 5);
    if (data.lastPeriodDate) {
      setLastPeriodState(new Date(data.lastPeriodDate));
    }
  };

  const addStepsLog = (log: StepsLog) => {
    setStepsLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date);
      return [...filtered, log];
    });
  };

  const addWaterLog = (log: WaterLog) => {
    setWaterLogs(prev => {
      const existingIdx = prev.findIndex(l => l.date === log.date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], amount: updated[existingIdx].amount + log.amount };
        return updated;
      }
      return [...prev, log];
    });
    const todayStr = formatDate(new Date());
    if (log.date === todayStr) {
      setTodayWater(prev => prev + log.amount);
    }
  };

  const addSleepLog = (log: SleepLog) => {
    setSleepLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date);
      return [...filtered, log];
    });
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

  const computedLastPeriod = lastPeriodState;
  const computedCycleLength = cycleLengthState;
  const computedNextPeriod = new Date(computedLastPeriod);
  computedNextPeriod.setDate(computedLastPeriod.getDate() + computedCycleLength);
  const daysSince = Math.floor((new Date().getTime() - computedLastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  const computedCurrentDay = (daysSince % computedCycleLength) + 1;
  const computedDaysUntilNext = computedCycleLength - (daysSince % computedCycleLength);

  return (
    <AppContext.Provider value={{
      currentScreen,
      navigate,
      previousScreen,
      goBack,
      user: { name: userName, email: "maria@example.com", avatar: undefined },
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
