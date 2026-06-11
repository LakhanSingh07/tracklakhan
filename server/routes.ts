import type { Express } from "express";
import { type Server } from "http";
import { createClient } from "@supabase/supabase-js";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const verifiedUtrs = new Set<string>();

const pricingMatrix: Record<string, Record<string, { rawPrice: number; discount: number; tax: number }>> = {
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

const getGeoCurrency = (req: any): string => {
  const country = (req.headers['cf-ipcountry'] || req.headers['x-appengine-country'] || '').toString().toUpperCase();
  if (country === 'IN') return 'INR';
  if (['GB', 'UK'].includes(country)) return 'GBP';
  if (['ES', 'DE', 'FR', 'IT', 'NL', 'BE', 'AT', 'FI', 'IE', 'PT', 'GR'].includes(country)) return 'EUR';
  return 'USD';
};


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
  language?: string;
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
    language = "en",
  } = context;

  // Language instructions mapping
  let langInstructions = "";
  if (language === "es") {
    langInstructions = "You MUST respond in Spanish (Español). Translate all your advice, explanations, and comfort naturally into Spanish.";
  } else if (language === "hi") {
    langInstructions = "You MUST respond in Hindi (हिंदी). Use simple, regular day-to-day Hindi (conversational, easy-to-understand, not overly pure or Sanskritized Hindi, but simple Hindi that is commonly used in casual text messages and spoken language).";
  } else {
    langInstructions = "You MUST respond in English.";
  }

  return `You are FlowAI Coach, a warm and knowledgeable women's health assistant inside the FlowAI period tracking app. You are NOT a doctor and always remind users to consult healthcare professionals for medical concerns.

${langInstructions}

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
  language?: string;
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
    language = "en",
  } = context;

  // Language instructions mapping
  let langInstructions = "";
  if (language === "es") {
    langInstructions = "You MUST write the narrative report in Spanish (Español) naturally.";
  } else if (language === "hi") {
    langInstructions = "You MUST write the narrative report in simple, regular conversational Hindi (हिंदी) that is easy to understand, avoiding typical, high-register or pure Sanskritized Hindi.";
  } else {
    langInstructions = "You MUST write the narrative report in English.";
  }

  return `You are FlowAI Health Coach writing a personalized monthly health report for ${userName}.

${langInstructions}

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

  // Secure order creation endpoint
  app.post("/api/payments/create-order", async (req, res) => {
    try {
      const { planId, currency: bodyCurrency, customMerchantUpiId, customMerchantName, customGatewayProvider, customGatewayKey } = req.body ?? {};
      
      const currency = (bodyCurrency || getGeoCurrency(req) || 'USD').toUpperCase();
      const supportedCurrencies = ["USD", "INR", "EUR", "GBP"];
      const finalCurrency = supportedCurrencies.includes(currency) ? currency : "USD";

      // Read coordinates, falling back to server environment variables
      let merchantUpiId = customMerchantUpiId || process.env.VITE_MERCHANT_UPI_ID || "flowai@okaxis";
      if (merchantUpiId === "flowai@okaxis" && process.env.VITE_MERCHANT_UPI_ID && process.env.VITE_MERCHANT_UPI_ID !== "flowai@okaxis") {
        merchantUpiId = process.env.VITE_MERCHANT_UPI_ID;
      }

      let merchantName = customMerchantName || process.env.VITE_MERCHANT_NAME || "FlowAI Inc";
      if (merchantName === "FlowAI Inc" && process.env.VITE_MERCHANT_NAME && process.env.VITE_MERCHANT_NAME !== "FlowAI Inc") {
        merchantName = process.env.VITE_MERCHANT_NAME;
      }

      let gatewayProvider = customGatewayProvider || process.env.VITE_CARD_GATEWAY_PROVIDER || "stripe";
      if (gatewayProvider === "stripe" && process.env.VITE_CARD_GATEWAY_PROVIDER && process.env.VITE_CARD_GATEWAY_PROVIDER !== "stripe") {
        gatewayProvider = process.env.VITE_CARD_GATEWAY_PROVIDER;
      }

      let gatewayKey = customGatewayKey || process.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51PxFlowAITestKey";
      if (gatewayKey === "pk_test_51PxFlowAITestKey" && process.env.VITE_STRIPE_PUBLISHABLE_KEY && process.env.VITE_STRIPE_PUBLISHABLE_KEY !== "pk_test_51PxFlowAITestKey") {
        gatewayKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
      }


      // Compute secure prices on the server
      if (planId === "test") {
        return res.status(400).json({ error: "The requested subscription plan is no longer available." });
      }

      let normPlanId = (planId || "yearly").toLowerCase();
      if (!["monthly", "quarterly", "yearly"].includes(normPlanId)) {
        normPlanId = "yearly";
      }

      const pricing = pricingMatrix[finalCurrency]?.[normPlanId] || pricingMatrix[finalCurrency]["yearly"];
      const rawPrice = pricing.rawPrice;
      const discount = pricing.discount;
      const tax = pricing.tax;
      const totalPreferred = rawPrice - discount + tax;

      // Compute totalINR conversion for UPI QR/deeplink
      let totalINR = 450;
      if (finalCurrency === "INR") {
        totalINR = Math.round(totalPreferred);
      } else if (finalCurrency === "EUR") {
        totalINR = Math.round(totalPreferred * 90.0);
      } else if (finalCurrency === "GBP") {
        totalINR = Math.round(totalPreferred * 106.0);
      } else {
        // USD
        totalINR = Math.round(totalPreferred * 83.5);
      }

      const txnId = "TXN" + Date.now() + Math.floor(1000 + Math.random() * 9000);
      const upiPayUrl = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${totalINR}.00&cu=INR&tn=FlowAI%20Premium%20Subscription&tr=${txnId}`;

      res.json({
        success: true,
        txnId,
        currency: finalCurrency,
        rawPrice,
        discount,
        tax,
        totalAmount: totalPreferred.toFixed(2),
        totalUSD: finalCurrency === "USD" ? totalPreferred.toFixed(2) : (totalINR / 83.5).toFixed(2),
        totalINR,
        upiPayUrl,
        merchantUpiId,
        merchantName,
        gatewayProvider,
        gatewayKey
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to generate secure order: " + err.message });
    }
  });

  // Secure UTR transaction validation and activation endpoint
  app.post("/api/payments/verify-utr", async (req, res) => {
    try {
      const { utr, userId, planId, methodName } = req.body ?? {};

      if (!utr || !/^\d{12}$/.test(utr)) {
        return res.status(400).json({ error: "Please provide a valid 12-digit transaction UTR / Ref No." });
      }

      if (!userId) {
        return res.status(400).json({ error: "User identity is required to activate subscription." });
      }

      // Replay Attack protection: check if UTR was already processed
      if (verifiedUtrs.has(utr)) {
        return res.status(400).json({ error: "This transaction reference number (UTR) has already been processed." });
      }

      // Initialize Supabase Server Client with service key bypass (fall back to anon key if not configured)
      const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
      const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

      if (!supabaseUrl || !supabaseSecretKey) {
        return res.status(500).json({ error: "Supabase connection is not initialized on the server." });
      }

      const supabaseServer = createClient(supabaseUrl, supabaseSecretKey);

      // Verify user exists
      const { data: profileCheck, error: profileError } = await supabaseServer
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (profileError || !profileCheck) {
        return res.status(404).json({ error: "User profile not found in database registry." });
      }

      if (planId === "test") {
        return res.status(400).json({ error: "The requested subscription plan is no longer available." });
      }

      let normPlanId = (planId || "yearly").toLowerCase();
      if (!["monthly", "quarterly", "yearly"].includes(normPlanId)) {
        normPlanId = "yearly";
      }

      // Determine user currency: check request body first, then fallback to database profile preferred_currency
      let preferredCurrency = req.body.currency;
      if (!preferredCurrency && profileCheck) {
        const { data: profile } = await supabaseServer
          .from("profiles")
          .select("preferred_currency")
          .eq("id", userId)
          .maybeSingle();
        preferredCurrency = profile?.preferred_currency;
      }
      preferredCurrency = (preferredCurrency || "USD").toUpperCase();
      const supportedCurrencies = ["USD", "INR", "EUR", "GBP"];
      const finalCurrency = supportedCurrencies.includes(preferredCurrency) ? preferredCurrency : "USD";

      const pricing = pricingMatrix[finalCurrency]?.[normPlanId] || pricingMatrix[finalCurrency]["yearly"];
      const totalPreferred = pricing.rawPrice - pricing.discount + pricing.tax;

      let formattedAmount = "";
      if (finalCurrency === "INR") {
        formattedAmount = `₹${Math.round(totalPreferred)}`;
      } else if (finalCurrency === "EUR") {
        formattedAmount = `€${totalPreferred.toFixed(2)}`;
      } else if (finalCurrency === "GBP") {
        formattedAmount = `£${totalPreferred.toFixed(2)}`;
      } else {
        formattedAmount = `$${totalPreferred.toFixed(2)}`;
      }

      const planName = normPlanId === "yearly" ? "Premium Annual" : normPlanId === "quarterly" ? "Premium Quarterly" : "Premium Monthly";

      const newHistoryEntry = {
        id: "INV-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        planName,
        amount: formattedAmount,
        method: methodName || "UPI Mobile Payment",
        status: "SUCCESS"
      };

      // Fetch existing subscription row
      const { data: existing } = await supabaseServer
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const history = existing?.billing_history ? [newHistoryEntry, ...existing.billing_history] : [newHistoryEntry];
      const methods = existing?.payment_methods || [];

      // Upsert the subscription record using bypass permissions
      const { error: upsertError } = await supabaseServer
        .from("subscriptions")
        .upsert({
          user_id: userId,
          is_premium: true,
          selected_plan_id: normPlanId,
          billing_history: history,
          payment_methods: methods,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      // Lock UTR to prevent multiple validation logs
      verifiedUtrs.add(utr);

      console.log(`[Billing] Successfully activated Premium for User ID: ${userId} via UTR: ${utr}`);

      res.json({
        success: true,
        message: "Premium subscription activated successfully!"
      });
    } catch (err: any) {
      console.error("[Billing] Secure UTR verification failed:", err.message);
      res.status(500).json({ error: "Transaction verification failed: " + err.message });
    }
  });

  // AI Coach streaming chat with multi-model fallback
  app.post("/api/ai-coach/chat", async (req, res) => {
    const { message, history = [], context = {} } = req.body ?? {};

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const mockText = `Hello! I'm your FlowAI Health Coach. Since the OpenAI/OpenRouter API key is not configured in this local dev environment, I am running in **Offline Mock Mode** to demonstrate the app features.

Based on your cycle data, here is some friendly advice:
• Stay hydrated and drink plenty of water
• Take some rest if you feel fatigued
• Try to maintain a consistent sleep schedule

Let me know if you want to log your symptoms or have any questions about your period tracking! 🌸`;

      const words = mockText.split(" ");
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          const content = (i === 0 ? "" : " ") + words[i];
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
          i++;
        } else {
          clearInterval(interval);
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        }
      }, 50);
      return;
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
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const mockReport = `Here is your **FlowAI Health Report** summary:

Your cycle regularity score is **85/100**. Over the last cycle, you logged consistent water intake and maintained a stable sleep routine. In the upcoming follicular phase, you can expect rising energy levels. Continue tracking your symptoms to get more personalized insights! 🌸`;

      const words = mockReport.split(" ");
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          const content = (i === 0 ? "" : " ") + words[i];
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
          i++;
        } else {
          clearInterval(interval);
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        }
      }, 50);
      return;
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
