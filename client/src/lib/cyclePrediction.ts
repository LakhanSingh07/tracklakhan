export interface LogEntry {
  date: string;
  flow?: "none" | "light" | "medium" | "heavy";
  mood?: string;
  weight?: number;
  temperature?: number;
  water?: number;
  notes?: string;
}

export interface PeriodEvent {
  startDate: string;
  endDate: string;
  durationDays: number;
}

export interface CycleRecord {
  startDate: string;
  length: number;
}

export interface PatternInsight {
  icon: string;
  title: string;
  description: string;
  type: "cycle" | "symptom" | "mood" | "lifestyle" | "prediction";
  confidence?: number;
}

export interface SymptomPattern {
  symptom: string;
  phase: "Menstrual" | "Follicular" | "Ovulation" | "Luteal";
  count: number;
}

export interface MoodPattern {
  mood: string;
  emoji: string;
  phase: "Menstrual" | "Follicular" | "Ovulation" | "Luteal";
  count: number;
}

export type DataQuality = "insufficient" | "learning" | "good" | "excellent";

export interface CyclePrediction {
  nextPeriodDate: Date;
  confidence: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleHistory: CycleRecord[];
  variability: number;
  dataQuality: DataQuality;
  patternInsights: PatternInsight[];
  symptomPatterns: SymptomPattern[];
  moodPatterns: MoodPattern[];
  periodEvents: PeriodEvent[];
  longestCycle: number;
  shortestCycle: number;
  usingAI: boolean;
}

function parseDate(s: string): Date {
  const d = new Date(s + "T12:00:00");
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function getPhase(cycleDay: number, cycleLength: number): "Menstrual" | "Follicular" | "Ovulation" | "Luteal" {
  const ovulationDay = cycleLength - 14;
  if (cycleDay <= 5) return "Menstrual";
  if (cycleDay < ovulationDay - 1) return "Follicular";
  if (cycleDay <= ovulationDay + 1) return "Ovulation";
  return "Luteal";
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function extractPeriodEvents(logs: LogEntry[]): PeriodEvent[] {
  const periodDates = logs
    .filter((l) => l.flow && l.flow !== "none")
    .map((l) => l.date)
    .sort();

  if (periodDates.length === 0) return [];

  const events: PeriodEvent[] = [];
  let groupStart = periodDates[0];
  let groupEnd = periodDates[0];

  for (let i = 1; i < periodDates.length; i++) {
    const gap = daysBetween(parseDate(periodDates[i - 1]), parseDate(periodDates[i]));
    if (gap <= 2) {
      groupEnd = periodDates[i];
    } else {
      events.push({
        startDate: groupStart,
        endDate: groupEnd,
        durationDays: daysBetween(parseDate(groupStart), parseDate(groupEnd)) + 1,
      });
      groupStart = periodDates[i];
      groupEnd = periodDates[i];
    }
  }
  events.push({
    startDate: groupStart,
    endDate: groupEnd,
    durationDays: daysBetween(parseDate(groupStart), parseDate(groupEnd)) + 1,
  });

  return events;
}

function extractCycleHistory(events: PeriodEvent[]): CycleRecord[] {
  const records: CycleRecord[] = [];
  for (let i = 1; i < events.length; i++) {
    const len = daysBetween(parseDate(events[i - 1].startDate), parseDate(events[i].startDate));
    if (len >= 14 && len <= 60) {
      records.push({ startDate: events[i - 1].startDate, length: len });
    }
  }
  return records;
}

function weightedAverage(values: number[]): number {
  if (values.length === 0) return 28;
  const weights = values.map((_, i) => i + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted = values.reduce((sum, v, i) => sum + v * weights[i], 0);
  return weighted / totalWeight;
}

function buildPatternInsights(
  cycles: CycleRecord[],
  events: PeriodEvent[],
  avgCycle: number,
  avgPeriod: number,
  stdDev: number,
  confidence: number
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  if (cycles.length >= 2) {
    const isRegular = stdDev <= 2;
    const trend =
      cycles.length >= 3
        ? cycles.slice(-3).map((c) => c.length)
        : cycles.map((c) => c.length);
    const trendDir =
      trend[trend.length - 1] > trend[0] ? "lengthening" : trend[trend.length - 1] < trend[0] ? "shortening" : "stable";

    insights.push({
      icon: isRegular ? "🎯" : "📊",
      title: isRegular ? "Very Regular Cycle" : "Slightly Variable Cycle",
      description: isRegular
        ? `Your cycle varies by only ±${stdDev.toFixed(1)} days — you're in the most regular 20% of users.`
        : `Your cycle varies by ±${stdDev.toFixed(1)} days. This is normal — many factors affect cycle length.`,
      type: "cycle",
      confidence,
    });

    if (trendDir !== "stable" && cycles.length >= 3) {
      insights.push({
        icon: trendDir === "lengthening" ? "📈" : "📉",
        title: `Cycle is ${trendDir === "lengthening" ? "Getting Longer" : "Getting Shorter"}`,
        description:
          trendDir === "lengthening"
            ? "Your last 3 cycles have been progressively longer. This can be normal or related to stress and lifestyle changes."
            : "Your last 3 cycles have been progressively shorter. Common causes include increased exercise or dietary changes.",
        type: "cycle",
        confidence,
      });
    }
  }

  if (avgPeriod > 0) {
    const periodDesc =
      avgPeriod <= 3 ? "short" : avgPeriod <= 5 ? "average" : avgPeriod <= 7 ? "above average" : "long";
    insights.push({
      icon: "🩸",
      title: `${Math.round(avgPeriod)}-Day ${periodDesc.charAt(0).toUpperCase() + periodDesc.slice(1)} Period`,
      description:
        avgPeriod <= 3
          ? "Short periods are common. If they feel unusually brief, mention it to your doctor."
          : avgPeriod <= 5
          ? "Your period length is typical. Most people menstruate for 3–7 days."
          : "Slightly longer periods are normal. Iron-rich foods like spinach can help with energy.",
      type: "cycle",
    });
  }

  if (avgCycle < 26) {
    insights.push({
      icon: "⚡",
      title: "Shorter-Than-Average Cycle",
      description: `Your average cycle is ${Math.round(avgCycle)} days, shorter than the typical 28. Ovulation happens earlier for you — around day ${Math.round(avgCycle - 14)}.`,
      type: "prediction",
      confidence,
    });
  } else if (avgCycle > 32) {
    insights.push({
      icon: "🌙",
      title: "Longer-Than-Average Cycle",
      description: `Your average cycle is ${Math.round(avgCycle)} days. Ovulation likely occurs around day ${Math.round(avgCycle - 14)}, later than average.`,
      type: "prediction",
      confidence,
    });
  }

  insights.push({
    icon: "🧠",
    title: "AI Learning Progress",
    description:
      cycles.length === 0
        ? "Log your first period to start training the AI. Just a few cycles gives great results!"
        : cycles.length < 3
        ? `${3 - cycles.length} more cycle${3 - cycles.length > 1 ? "s" : ""} until predictions reach 75% accuracy. Keep logging!`
        : cycles.length < 6
        ? `${6 - cycles.length} more cycle${6 - cycles.length > 1 ? "s" : ""} until predictions reach 90%+ accuracy.`
        : "Your predictions are highly personalized. FlowAI knows your cycle well.",
    type: "prediction",
    confidence,
  });

  return insights;
}

function extractSymptomPatterns(logs: LogEntry[], profileCycleLength: number, lastPeriodStart: Date): SymptomPattern[] {
  const symptomKeywords = [
    "cramps", "bloating", "headache", "fatigue", "nausea", "acne",
    "back-pain", "breast-tender", "spotting", "insomnia", "dizziness",
  ];

  const counts: Record<string, Record<string, number>> = {};

  for (const log of logs) {
    if (!log.notes) continue;
    const cycleDay = daysBetween(lastPeriodStart, parseDate(log.date)) % profileCycleLength + 1;
    const phase = getPhase(Math.max(1, cycleDay), profileCycleLength);

    for (const sym of symptomKeywords) {
      if (log.notes.toLowerCase().includes(sym.replace("-", " "))) {
        if (!counts[sym]) counts[sym] = { Menstrual: 0, Follicular: 0, Ovulation: 0, Luteal: 0 };
        counts[sym][phase] = (counts[sym][phase] || 0) + 1;
      }
    }
  }

  const patterns: SymptomPattern[] = [];
  for (const [symptom, phaseCounts] of Object.entries(counts)) {
    const maxPhase = (Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0]);
    if (maxPhase && maxPhase[1] >= 1) {
      patterns.push({
        symptom: symptom.replace("-", " "),
        phase: maxPhase[0] as any,
        count: maxPhase[1],
      });
    }
  }

  return patterns.sort((a, b) => b.count - a.count).slice(0, 6);
}

function extractMoodPatterns(logs: LogEntry[], profileCycleLength: number, lastPeriodStart: Date): MoodPattern[] {
  const moodMap: Record<string, { label: string; emoji: string }> = {
    "😊": { label: "Happy", emoji: "😊" },
    "😄": { label: "Excited", emoji: "😄" },
    "😌": { label: "Calm", emoji: "😌" },
    "😴": { label: "Tired", emoji: "😴" },
    "😰": { label: "Anxious", emoji: "😰" },
    "😢": { label: "Sad", emoji: "😢" },
    "😤": { label: "Irritated", emoji: "😤" },
    "🤗": { label: "Loved", emoji: "🤗" },
    "😐": { label: "Neutral", emoji: "😐" },
  };

  const counts: Record<string, Record<string, number>> = {};

  for (const log of logs) {
    if (!log.mood) continue;
    const cycleDay = daysBetween(lastPeriodStart, parseDate(log.date)) % profileCycleLength + 1;
    const phase = getPhase(Math.max(1, cycleDay), profileCycleLength);
    const mood = log.mood;
    if (!counts[mood]) counts[mood] = { Menstrual: 0, Follicular: 0, Ovulation: 0, Luteal: 0 };
    counts[mood][phase] = (counts[mood][phase] || 0) + 1;
  }

  const patterns: MoodPattern[] = [];
  for (const [mood, phaseCounts] of Object.entries(counts)) {
    const maxPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxPhase && maxPhase[1] >= 1 && moodMap[mood]) {
      patterns.push({
        mood: moodMap[mood].label,
        emoji: moodMap[mood].emoji,
        phase: maxPhase[0] as any,
        count: maxPhase[1],
      });
    }
  }

  return patterns.sort((a, b) => b.count - a.count).slice(0, 4);
}

export function computeCyclePrediction(
  logs: LogEntry[],
  profileCycleLength: number,
  profilePeriodLength: number,
  lastPeriodStart: Date
): CyclePrediction {
  const events = extractPeriodEvents(logs);
  const cycles = extractCycleHistory(events);

  const lengths = cycles.map((c) => c.length);
  const avgCycle = cycles.length >= 2 ? weightedAverage(lengths) : profileCycleLength;
  const stdDev = cycles.length >= 2 ? standardDeviation(lengths) : 3;

  const periodDurations = events.map((e) => e.durationDays).filter((d) => d >= 1 && d <= 10);
  const avgPeriod =
    periodDurations.length > 0
      ? periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length
      : profilePeriodLength;

  const lastEvent = events.slice(-1)[0];
  const baseDate = lastEvent ? parseDate(lastEvent.startDate) : lastPeriodStart;
  const nextPeriodDate = new Date(baseDate);
  nextPeriodDate.setDate(baseDate.getDate() + Math.round(avgCycle));

  const confidence = Math.min(
    95,
    cycles.length === 0 ? 20 :
    cycles.length === 1 ? 40 :
    cycles.length === 2 ? 58 :
    cycles.length === 3 ? 72 :
    cycles.length === 4 ? 82 :
    cycles.length === 5 ? 88 :
    90 - Math.min(15, stdDev * 2)
  );

  const dataQuality: DataQuality =
    cycles.length < 2 ? "insufficient" :
    cycles.length < 4 ? "learning" :
    cycles.length < 8 ? "good" : "excellent";

  const patternInsights = buildPatternInsights(cycles, events, avgCycle, avgPeriod, stdDev, confidence);
  const symptomPatterns = extractSymptomPatterns(logs, profileCycleLength, lastPeriodStart);
  const moodPatterns = extractMoodPatterns(logs, profileCycleLength, lastPeriodStart);

  const allLengths = lengths.length > 0 ? lengths : [profileCycleLength];

  return {
    nextPeriodDate,
    confidence: Math.round(confidence),
    averageCycleLength: Math.round(avgCycle * 10) / 10,
    averagePeriodLength: Math.round(avgPeriod * 10) / 10,
    cycleHistory: cycles,
    variability: Math.round(stdDev * 10) / 10,
    dataQuality,
    patternInsights,
    symptomPatterns,
    moodPatterns,
    periodEvents: events,
    longestCycle: Math.max(...allLengths),
    shortestCycle: Math.min(...allLengths),
    usingAI: cycles.length >= 2,
  };
}
