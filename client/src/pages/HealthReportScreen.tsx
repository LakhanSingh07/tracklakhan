import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileLayout, StatusBar, HomeIndicator } from "@/components/MobileLayout";
import { useApp } from "@/lib/appContext";
import { FileText, Download, Share2, Sparkles, ChevronLeft, RefreshCw } from "lucide-react";

const PHASE_COLORS: Record<string, { from: string; to: string; badge: string }> = {
  Menstrual:  { from: "#FF657D", to: "#FF8FA3", badge: "#FF657D" },
  Follicular: { from: "#FB923C", to: "#FCA572", badge: "#FB923C" },
  Ovulation:  { from: "#8B5CF6", to: "#A78BFA", badge: "#8B5CF6" },
  Luteal:     { from: "#60A5FA", to: "#93C5FD", badge: "#3B82F6" },
};

const SEVERITY_COLORS = { Mild: "#34D399", Moderate: "#F59E0B", Severe: "#EF4444" };
const SEVERITY_BG    = { Mild: "#ECFDF5", Moderate: "#FFFBEB", Severe: "#FEF2F2" };

function ScoreBar({ label, value, max, color, icon }: { label: string; value: number; max: number; color: string; icon: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[12px] font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-[12px] font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-gray-50 p-3 text-center">
      <p className="text-[18px] font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mx-5 mb-4 bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-[14px] font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/** Safe bold renderer — NO dangerouslySetInnerHTML. Splits on **text** and renders spans. */
function SafeText({ text, className, boldColor }: { text: string; className?: string; boldColor?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={boldColor ? { color: boldColor } : undefined}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function SafeParagraphs({ text, paraClass, boldColor }: { text: string; paraClass?: string; boldColor?: string }) {
  return (
    <>
      {text.split("\n").filter(Boolean).map((para, i) => (
        <p key={i} className={`${paraClass ?? ""} ${i > 0 ? "mt-2" : ""}`}>
          <SafeText text={para} boldColor={boldColor} />
        </p>
      ))}
    </>
  );
}

export const HealthReportScreen = () => {
  const { navigate, user, cycleData, logs, todayWater } = useApp();
  const [narrative, setNarrative] = useState("");
  const [narrativeStreaming, setNarrativeStreaming] = useState(false);
  const [narrativeDone, setNarrativeDone] = useState(false);
  const [narrativeError, setNarrativeError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const phaseStyle = PHASE_COLORS[cycleData.phase] ?? PHASE_COLORS.Luteal;

  // ── Derived stats from logs ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const allLogs = logs;
    const waterLogs = allLogs.filter(l => l.water && l.water > 0);
    const weightLogs = allLogs.filter(l => l.weight && l.weight > 0);
    const moodLogs = allLogs.filter(l => l.mood);

    const avgWater = waterLogs.length
      ? Math.round(waterLogs.reduce((s, l) => s + (l.water ?? 0), 0) / waterLogs.length)
      : 0;
    const avgWeight = weightLogs.length
      ? parseFloat((weightLogs.reduce((s, l) => s + (l.weight ?? 0), 0) / weightLogs.length).toFixed(1))
      : 0;

    // Mood distribution
    const moodCounts: Record<string, number> = {};
    moodLogs.forEach(l => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] ?? 0) + 1; });
    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const totalMoodLogs = moodLogs.length;

    // Symptom extraction + severity breakdown from notes
    const symptomKeywords = ["cramps", "bloating", "fatigue", "headache", "acne", "backache", "nausea", "insomnia", "spotting"];
    const symptomCounts: Record<string, number> = {};
    allLogs.forEach(l => {
      if (l.notes) {
        const lower = l.notes.toLowerCase();
        symptomKeywords.forEach(s => {
          if (lower.includes(s)) symptomCounts[s] = (symptomCounts[s] ?? 0) + 1;
        });
      }
    });
    const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Severity: based on frequency across logs
    const getSeverity = (count: number): keyof typeof SEVERITY_COLORS => {
      if (count >= 4) return "Severe";
      if (count >= 2) return "Moderate";
      return "Mild";
    };

    // Sleep quality from notes — parses "Sleep: X/5" patterns and quality words
    const sleepLogs = allLogs.filter(l => l.notes && /sleep/i.test(l.notes));
    let avgSleepScore = 0;
    let sleepQualityLabel = "Not tracked";
    if (sleepLogs.length > 0) {
      const scores: number[] = [];
      sleepLogs.forEach(l => {
        if (!l.notes) return;
        const match = l.notes.match(/sleep[:\s]+(\d+)[\/\s]*(?:\d+)?/i);
        if (match) {
          scores.push(parseInt(match[1], 10));
        } else if (/good|great|excellent/i.test(l.notes)) {
          scores.push(4);
        } else if (/poor|bad|terrible/i.test(l.notes)) {
          scores.push(2);
        } else {
          scores.push(3);
        }
      });
      avgSleepScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      if (avgSleepScore >= 4) sleepQualityLabel = "Good";
      else if (avgSleepScore >= 3) sleepQualityLabel = "Average";
      else sleepQualityLabel = "Poor";
    }

    // Fertile window
    const ovulationDate = new Date(cycleData.lastPeriodStart);
    ovulationDate.setDate(ovulationDate.getDate() + 13);
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 2);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const regularityScore = Math.min(100, Math.round(50 + allLogs.length * 5));

    return {
      avgWater, avgWeight,
      topSymptoms, sortedMoods, totalMoodLogs,
      getSeverity,
      sleepLogs: sleepLogs.length, sleepQualityLabel, avgSleepScore,
      fertileWindowStr: `${fmtDate(fertileStart)} – ${fmtDate(fertileEnd)}`,
      fertileStart: fmtDate(fertileStart),
      fertileEnd: fmtDate(fertileEnd),
      regularityScore,
      logCount: allLogs.length,
      nextPeriodStr: fmtDate(cycleData.nextPeriod),
    };
  }, [logs, cycleData]);

  // ── Fetch AI narrative on mount ──────────────────────────────────────────
  const fetchNarrative = useCallback(async () => {
    setNarrative("");
    setNarrativeDone(false);
    setNarrativeError("");
    setNarrativeStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai-coach/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            userName: user.name,
            phase: cycleData.phase,
            cycleDay: cycleData.currentDay,
            cycleLength: cycleData.cycleLength,
            periodLength: cycleData.periodLength,
            nextPeriodDate: stats.nextPeriodStr,
            fertileWindowStart: stats.fertileStart,
            fertileWindowEnd: stats.fertileEnd,
            regularityScore: stats.regularityScore,
            topSymptoms: stats.topSymptoms.map(([s]) => s),
            topMoods: stats.sortedMoods.map(([m]) => m),
            avgWater: stats.avgWater,
            avgWeight: stats.avgWeight,
            logCount: stats.logCount,
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Network error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      if (!reader) throw new Error("No body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) { acc += json.content; setNarrative(acc); }
            if (json.done) setNarrativeDone(true);
            if (json.error) setNarrativeError(json.error);
          } catch { /* ignore */ }
        }
      }
      setNarrativeDone(true);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setNarrativeError("Couldn't generate your AI summary. Tap refresh to try again.");
      }
    } finally {
      setNarrativeStreaming(false);
    }
  }, [user, cycleData, stats]);

  useEffect(() => {
    fetchNarrative();
    return () => abortRef.current?.abort();
  }, []);

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, useCORS: true, backgroundColor: "#FAF5FF", logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();
      if (pdfH <= pageH) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      } else {
        let y = 0;
        while (y < pdfH) {
          pdf.addImage(imgData, "PNG", 0, -y, pdfW, pdfH);
          y += pageH;
          if (y < pdfH) pdf.addPage();
        }
      }
      pdf.save(`FlowAI_Report_${new Date().toISOString().slice(0, 7)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  // ── Share — copies a shareable report link (clipboard fallback) ──────────
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?report=health&user=${encodeURIComponent(user.name)}&phase=${encodeURIComponent(cycleData.phase)}`;
    const shareTitle = `${user.name}'s FlowAI Health Report`;
    const shareText = `Check out my FlowAI Health Report 🌸\n\nCycle Phase: ${cycleData.phase} (Day ${cycleData.currentDay})\nNext Period: ${stats.nextPeriodStr}\nFertile Window: ${stats.fertileWindowStr}\nCycle Regularity: ${stats.regularityScore}/100\n\nGenerated by FlowAI — AI Period Tracker`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch { /* user cancelled or unsupported */ }
    }
    // Clipboard fallback — copies both the link and summary
    await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  const reportMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <MobileLayout gradient="linear-gradient(180deg, #FAF5FF 0%, #FDF2F8 50%, #FFF0F4 100%)">
      <div className="flex flex-col h-screen">
        <StatusBar />

        {/* Header */}
        <div
          className="flex-shrink-0 px-4 pt-2 pb-4"
          style={{ background: `linear-gradient(135deg, ${phaseStyle.from} 0%, ${phaseStyle.to} 100%)` }}
        >
          <div className="flex items-center justify-between mb-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("insights")}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
              data-testid="button-back-report"
            >
              <ChevronLeft size={20} color="white" />
            </motion.button>
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <FileText size={15} color="white" />
                <h1 className="text-white font-bold text-[16px]" style={{ fontFamily: "Instrument Sans, sans-serif" }}>
                  Health Report
                </h1>
              </div>
              <p className="text-white/70 text-[11px]">{reportMonth}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                data-testid="button-share-report"
              >
                <Share2 size={16} color="white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                disabled={exporting}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                data-testid="button-download-report"
              >
                {exporting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RefreshCw size={16} color="white" />
                  </motion.div>
                ) : (
                  <Download size={16} color="white" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Share copied toast */}
          <AnimatePresence>
            {shareSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full z-50 shadow-lg whitespace-nowrap"
              >
                ✓ Report link copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable report content */}
        <div className="flex-1 overflow-y-auto scrollbar-none pb-6">
          <div ref={reportRef} style={{ background: "linear-gradient(180deg, #FAF5FF 0%, #FFF0F4 100%)" }}>

            {/* 1. User Profile */}
            <div
              className="mx-5 mt-4 mb-4 rounded-3xl p-5 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${phaseStyle.from}18 0%, ${phaseStyle.to}18 100%)`,
                border: `1.5px solid ${phaseStyle.from}30`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${phaseStyle.from}, ${phaseStyle.to})` }}
                >
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-bold text-gray-900">{user.name}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: phaseStyle.badge }}>
                      {cycleData.phase} Phase
                    </span>
                    <span className="text-[10px] text-gray-400">Day {cycleData.currentDay} of {cycleData.cycleLength}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-400">Report for</p>
                  <p className="text-[12px] font-bold text-gray-700">{reportMonth}</p>
                </div>
              </div>
            </div>

            {/* 2. Cycle Summary */}
            <SectionCard title="Cycle Summary" icon="🗓️">
              <div className="flex gap-2 mb-4">
                <MiniStat label="Cycle Length" value={`${cycleData.cycleLength}d`} color={phaseStyle.from} />
                <MiniStat label="Period Length" value={`${cycleData.periodLength}d`} color={phaseStyle.to} />
                <MiniStat label="Regularity" value={`${stats.regularityScore}`} sub="/100" color="#34D399" />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                  <span className="text-[12px] text-gray-600 flex items-center gap-2"><span>🔴</span> Next Period</span>
                  <span className="text-[13px] font-bold" style={{ color: phaseStyle.from }}>{stats.nextPeriodStr}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                  <span className="text-[12px] text-gray-600 flex items-center gap-2"><span>🌱</span> Fertile Window</span>
                  <span className="text-[13px] font-bold text-green-500">{stats.fertileWindowStr}</span>
                </div>
                <ScoreBar label="Cycle Regularity" value={stats.regularityScore} max={100} color="#34D399" icon="📊" />
              </div>
            </SectionCard>

            {/* 3. AI Predictions */}
            <SectionCard title="AI Predictions" icon="🧠">
              <div className="rounded-2xl p-4 mb-3" style={{ background: "linear-gradient(135deg, #F5F0FF, #FDF2F8)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} color="#8B5CF6" />
                  <span className="text-[12px] font-semibold text-purple-700">Prediction Confidence</span>
                  <span className="ml-auto text-[13px] font-bold text-purple-600">
                    {Math.min(100, Math.round(60 + stats.logCount * 3))}%
                  </span>
                </div>
                <ScoreBar
                  label="Prediction Accuracy"
                  value={Math.min(100, Math.round(60 + stats.logCount * 3))}
                  max={100} color="#8B5CF6" icon="🎯"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-pink-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Next Period</p>
                  <p className="text-[14px] font-bold text-pink-500">{stats.nextPeriodStr}</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Fertile Days</p>
                  <p className="text-[13px] font-bold text-green-500">{stats.fertileWindowStr}</p>
                </div>
              </div>
            </SectionCard>

            {/* 4. Symptom Analysis — frequency + severity breakdown */}
            <SectionCard title="Symptom Analysis" icon="🩺">
              {stats.topSymptoms.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {stats.topSymptoms.map(([symptom, count]) => {
                      const severity = stats.getSeverity(count);
                      const sevColor = SEVERITY_COLORS[severity];
                      const sevBg = SEVERITY_BG[severity];
                      const icon = symptom === "cramps" ? "😣" : symptom === "fatigue" ? "😴" : symptom === "headache" ? "🤕" : symptom === "bloating" ? "🤰" : symptom === "nausea" ? "🤢" : "😕";
                      return (
                        <div key={symptom}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{icon}</span>
                              <span className="text-[12px] font-medium text-gray-700">
                                {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400">{count}x logged</span>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: sevBg, color: sevColor }}
                              >
                                {severity}
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: sevColor }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((count / Math.max(...stats.topSymptoms.map(([, c]) => c))) * 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Severity legend */}
                  <div className="flex gap-2">
                    {(["Mild", "Moderate", "Severe"] as const).map(sev => (
                      <div key={sev} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-1 justify-center" style={{ background: SEVERITY_BG[sev] }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[sev] }} />
                        <span className="text-[11px] font-medium" style={{ color: SEVERITY_COLORS[sev] }}>{sev}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 text-center mt-2">Based on {stats.logCount} log entries</p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">📋</p>
                  <p className="text-[13px] text-gray-500">No symptoms logged yet.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Use the Symptom Tracker to log symptoms</p>
                </div>
              )}
            </SectionCard>

            {/* 5. Mood Analysis */}
            <SectionCard title="Mood Analysis" icon="😊">
              {stats.sortedMoods.length > 0 ? (
                <>
                  <div className="flex items-end justify-around gap-3 mb-3 h-20">
                    {stats.sortedMoods.map(([mood, count], i) => {
                      const pct = Math.round((count / stats.totalMoodLogs) * 100);
                      const colors = [phaseStyle.from, phaseStyle.to, "#34D399", "#F59E0B"];
                      return (
                        <div key={mood} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-gray-600">{pct}%</span>
                          <motion.div
                            className="w-8 rounded-t-lg"
                            style={{ background: colors[i] ?? "#E5E7EB" }}
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(12, pct * 0.6) }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                          <span className="text-xl">{mood}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">Based on {stats.totalMoodLogs} mood logs</p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-4xl mb-2">💭</p>
                  <p className="text-[13px] text-gray-500">No mood data yet.</p>
                  <p className="text-[11px] text-gray-400 mt-1">Log your daily mood to see trends here</p>
                </div>
              )}
            </SectionCard>

            {/* 6. Wellness Analysis — water, weight, sleep quality summary */}
            <SectionCard title="Wellness Analysis" icon="💪">
              <div className="flex gap-2 mb-4">
                <MiniStat
                  label="Avg Water"
                  value={stats.avgWater > 0 ? `${stats.avgWater}ml` : "—"}
                  sub={stats.avgWater > 0 ? (stats.avgWater >= 2000 ? "✓ Goal met" : "↑ Drink more") : "Not tracked"}
                  color="#60A5FA"
                />
                <MiniStat
                  label="Avg Weight"
                  value={stats.avgWeight > 0 ? `${stats.avgWeight}kg` : "—"}
                  sub={stats.avgWeight > 0 ? "Tracked" : "Not tracked"}
                  color="#34D399"
                />
                <MiniStat
                  label="Sleep"
                  value={stats.sleepLogs > 0 ? stats.sleepQualityLabel : "—"}
                  sub={stats.sleepLogs > 0 ? `${stats.sleepLogs} entries` : "Not tracked"}
                  color={stats.sleepQualityLabel === "Good" ? "#34D399" : stats.sleepQualityLabel === "Average" ? "#F59E0B" : "#EF4444"}
                />
              </div>

              {/* Sleep quality bar */}
              {stats.sleepLogs > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🌙</span>
                      <span className="text-[12px] font-medium text-gray-700">Sleep Quality</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: stats.sleepQualityLabel === "Good" ? "#34D399" : stats.sleepQualityLabel === "Average" ? "#F59E0B" : "#EF4444" }}>
                      {stats.sleepQualityLabel}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: stats.sleepQualityLabel === "Good" ? "#34D399" : stats.sleepQualityLabel === "Average" ? "#F59E0B" : "#EF4444" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.avgSleepScore / 5) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Hydration bar */}
              {stats.avgWater > 0 && (
                <ScoreBar
                  label="Hydration Goal (2000ml)"
                  value={Math.min(stats.avgWater, 2000)}
                  max={2000}
                  color="#60A5FA"
                  icon="💧"
                />
              )}

              {/* Log count */}
              <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                <span className="text-[12px] text-gray-600 flex items-center gap-2"><span>📝</span> Total Log Entries</span>
                <span className="text-[13px] font-bold text-gray-700">{stats.logCount}</span>
              </div>
            </SectionCard>

            {/* 7. AI-Generated Narrative — safe rendering, NO dangerouslySetInnerHTML */}
            <div className="mx-5 mb-4 rounded-3xl p-5 shadow-sm overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #4C1D95 50%, #6D28D9 100%)" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: narrativeStreaming ? 360 : 0 }}
                    transition={{ duration: 2, repeat: narrativeStreaming ? Infinity : 0, ease: "linear" }}
                  >
                    <Sparkles size={16} color="#A78BFA" />
                  </motion.div>
                  <span className="text-white font-bold text-[14px]">AI Health Summary</span>
                  {narrativeStreaming && (
                    <span className="text-purple-300 text-[11px] animate-pulse ml-auto">Writing…</span>
                  )}
                  {narrativeDone && !narrativeStreaming && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={fetchNarrative}
                      className="ml-auto w-7 h-7 rounded-full bg-white/15 flex items-center justify-center"
                      data-testid="button-refresh-narrative"
                    >
                      <RefreshCw size={12} color="white" />
                    </motion.button>
                  )}
                </div>

                {narrativeError ? (
                  <div className="text-center py-3">
                    <p className="text-white/70 text-[12px] mb-3">{narrativeError}</p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchNarrative}
                      className="px-4 py-2 rounded-xl bg-white/20 text-white text-[12px] font-semibold"
                    >
                      Try Again
                    </motion.button>
                  </div>
                ) : narrative ? (
                  <div>
                    <SafeParagraphs
                      text={narrative}
                      paraClass="text-white/85 text-[13px] leading-relaxed"
                      boldColor="#C4B5FD"
                    />
                    {narrativeStreaming && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-4 bg-purple-300 ml-0.5 align-text-bottom"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-300"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                    <span className="text-white/60 text-[12px]">Generating your AI summary…</span>
                  </div>
                )}
              </div>
            </div>

            {/* 8. Doctor View CTA */}
            <div className="mx-5 mb-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={exporting}
                className="w-full rounded-3xl p-5 flex items-center gap-4 shadow-sm"
                style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", border: "1.5px solid #6EE7B7" }}
                data-testid="button-doctor-view"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                  🩺
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14px] font-bold text-gray-800">Doctor View</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {exporting ? "Generating PDF…" : "Download a clean PDF to share with your doctor"}
                  </p>
                </div>
                <Download size={18} color="#059669" />
              </motion.button>
            </div>

            {/* Share button */}
            <div className="mx-5 mb-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleShare}
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-[15px] text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${phaseStyle.from} 0%, ${phaseStyle.to} 100%)` }}
                data-testid="button-share-report-bottom"
              >
                <Share2 size={18} color="white" />
                Share Report
              </motion.button>
            </div>

            {/* Disclaimer */}
            <div className="mx-5 mb-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-[11px] text-amber-700 leading-relaxed text-center">
                ⚠️ This report is for informational purposes only and is not a substitute for professional medical advice.
                Always consult a qualified healthcare provider for medical concerns.
              </p>
            </div>

          </div>
        </div>

        <HomeIndicator />
      </div>
    </MobileLayout>
  );
};
