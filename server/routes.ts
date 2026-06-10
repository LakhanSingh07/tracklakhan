import type { Express } from "express";
import { type Server } from "http";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

// Free models tried in order — falls back automatically on rate-limit or unavailability
const MODELS = [
  "google/gemma-4-31b-it:free",
  "moonshotai/kimi-k2.6:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildSystemPrompt(context: {
  phase?: string;
  cycleDay?: number;
  daysUntilPeriod?: number;
  cycleLength?: number;
  periodLength?: number;
  recentMoods?: string[];
  recentWeight?: number;
  recentWater?: number;
}): string {
  const {
    phase = "Unknown",
    cycleDay = 1,
    daysUntilPeriod = 14,
    cycleLength = 28,
    periodLength = 5,
    recentMoods = [],
    recentWeight,
    recentWater,
  } = context;

  return `You are FlowAI Coach, a warm and knowledgeable women's health assistant inside the FlowAI period tracking app. You are NOT a doctor and always remind users to consult healthcare professionals for medical concerns.

## User's Current Cycle Data
- Cycle Day: ${cycleDay} of ${cycleLength}
- Current Phase: ${phase} Phase
- Period Length: ${periodLength} days
- Days Until Next Period: ${daysUntilPeriod}
${recentMoods.length > 0 ? `- Recent moods: ${recentMoods.join(", ")}` : "- No recent moods logged"}
${recentWeight ? `- Weight: ${recentWeight} kg` : ""}
${recentWater ? `- Water today: ${recentWater} ml` : ""}

## Guidelines
- Be warm, empathetic, and conversational — like a knowledgeable friend
- Personalise EVERY response using the cycle data above
- Use **bold** for key points, bullet (•) for lists
- Keep responses under 200 words unless genuinely needed
- Use emoji naturally but sparingly (🌸 💗 🌙 🌟)
- NEVER diagnose or prescribe — always suggest seeing a doctor for serious concerns

## Phase Context
${phase === "Menstrual" ? "User is menstruating. Focus on comfort, rest, iron-rich foods, and pain relief." : ""}
${phase === "Follicular" ? "User is in follicular phase. Energy is rising — good for activity and new starts." : ""}
${phase === "Ovulation" ? "User is ovulating. Energy and mood are at peak. Fertility is highest now." : ""}
${phase === "Luteal" ? "User is in luteal phase. PMS may appear. Focus on self-care and mood support." : ""}

End with a brief follow-up question or helpful tip when appropriate.`;
}

async function callOpenRouter(
  messages: ChatMessage[],
  model: string,
  apiKey: string,
): Promise<Response> {
  return fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://flowai.app",
      "X-Title": "FlowAI Coach",
    },
    body: JSON.stringify({ model, messages, stream: true, max_tokens: 500 }),
  });
}

function buildReportPrompt(context: {
  userName?: string;
  phase?: string;
  cycleDay?: number;
  cycleLength?: number;
  periodLength?: number;
  nextPeriodDate?: string;
  fertileWindowStart?: string;
  fertileWindowEnd?: string;
  regularityScore?: number;
  topSymptoms?: string[];
  topMoods?: string[];
  avgWater?: number;
  avgWeight?: number;
  logCount?: number;
}): string {
  const {
    userName = "User",
    phase = "Luteal",
    cycleDay = 1,
    cycleLength = 28,
    periodLength = 5,
    nextPeriodDate = "unknown",
    fertileWindowStart = "unknown",
    fertileWindowEnd = "unknown",
    regularityScore = 80,
    topSymptoms = [],
    topMoods = [],
    avgWater = 0,
    avgWeight = 0,
    logCount = 0,
  } = context;

  return `You are FlowAI Health Coach writing a personalized monthly health report for ${userName}.

User data:
- Current cycle phase: ${phase} (Day ${cycleDay} of ${cycleLength})
- Period length: ${periodLength} days
- Next period: ${nextPeriodDate}
- Fertile window: ${fertileWindowStart} to ${fertileWindowEnd}
- Cycle regularity score: ${regularityScore}/100
- Top symptoms logged: ${topSymptoms.length > 0 ? topSymptoms.join(", ") : "none"}
- Dominant moods: ${topMoods.length > 0 ? topMoods.join(", ") : "not enough data"}
- Average daily water intake: ${avgWater > 0 ? `${avgWater} ml` : "not tracked"}
- Average weight: ${avgWeight > 0 ? `${avgWeight} kg` : "not tracked"}
- Total log entries this cycle: ${logCount}

Write a warm, personalized 150–180 word health narrative for this report. Structure it as:
1. A warm opening sentence greeting ${userName} and acknowledging her current phase
2. 2–3 sentences on cycle health observations (regularity, predictions)
3. 1–2 sentences on symptom/mood patterns (if data exists)
4. 1–2 sentences on wellness habits (water/weight if available)
5. A warm closing encouragement and one specific actionable tip for her current phase

Use **bold** for key terms. Be warm, empathetic, and science-backed. Write as if you are her health companion. Do NOT use bullet points — write in flowing paragraphs. Do NOT include headers. Keep it under 200 words.`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI Coach streaming chat with multi-model fallback
  app.post("/api/ai-coach/chat", async (req, res) => {
    const { message, history = [], context = {} } = req.body ?? {};

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const messages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt(context) },
      ...history.slice(-10).map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message.trim() },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Try each model in order until one works
    let response: Response | null = null;
    let lastError = "";

    for (const model of MODELS) {
      try {
        const r = await callOpenRouter(messages, model, apiKey);
        if (r.ok) {
          response = r;
          break;
        }
        const errData = await r.json() as any;
        const code = r.status;
        lastError = `${code}: ${errData?.error?.message ?? "unknown"}`;
        console.warn(`[ai-coach] Model ${model} failed (${code}), trying next...`);
        if (code === 401 || code === 402) break; // Auth error — stop trying
      } catch (fetchErr: any) {
        lastError = fetchErr.message;
        console.warn(`[ai-coach] Fetch error for ${model}:`, fetchErr.message);
      }
    }

    if (!response) {
      console.error("[ai-coach] All models failed:", lastError);
      res.write(`data: ${JSON.stringify({ error: "AI service temporarily unavailable. Please try again in a moment." })}\n\n`);
      res.end();
      return;
    }

    // Stream SSE tokens to client
    try {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // ignore malformed SSE chunks
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (streamErr: any) {
      console.error("[ai-coach] Stream error:", streamErr.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
        res.end();
      }
    }
  });

  // AI Health Report — streaming narrative generation
  app.post("/api/ai-coach/report", async (req, res) => {
    const { context = {} } = req.body ?? {};

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI service not configured" });
    }

    const messages: ChatMessage[] = [
      { role: "system", content: buildReportPrompt(context) },
      { role: "user", content: "Generate my personalized health report narrative now." },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let response: Response | null = null;
    let lastError = "";

    for (const model of MODELS) {
      try {
        const r = await callOpenRouter(messages, model, apiKey);
        if (r.ok) { response = r; break; }
        const errData = await r.json() as any;
        const code = r.status;
        lastError = `${code}: ${errData?.error?.message ?? "unknown"}`;
        console.warn(`[ai-report] Model ${model} failed (${code}), trying next...`);
        if (code === 401 || code === 402) break;
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!response) {
      res.write(`data: ${JSON.stringify({ error: "AI service temporarily unavailable." })}\n\n`);
      res.end();
      return;
    }

    try {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
          } catch { /* ignore */ }
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  });

  return httpServer;
}
