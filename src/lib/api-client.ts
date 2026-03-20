import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

type MutationConfig<TData, TVariables> = {
  mutation?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">;
};

export type QuoteRequest    = { data: { theme: string; mood?: string; count?: number } };
export type QuoteResponse   = { quotes: string[] };
export type CaptionRequest  = { data: { description: string; mood?: string; platform?: string } };
export type CaptionResponse = { captions: string[] };
export type HashtagRequest  = { data: { topic: string; count?: number; platform?: string } };
export type HashtagResponse = { hashtags: string[] };
export type TranslateRequest  = { data: { text: string; targetLanguage: string } };
export type TranslateResponse = { translatedText: string; targetLanguage: string };

// ─── Cloudflare AI Gateway → OpenAI ──────────────────────────────────────────
//
// All AI calls go through your Cloudflare AI Gateway, which:
//   • Keeps your OpenAI key off the client (gateway holds it server-side)
//   • Adds caching, rate limiting, and usage analytics
//   • Lets you swap AI providers without touching frontend code
//
// .env variables needed:
//   VITE_CF_GATEWAY_URL  — your Cloudflare AI Gateway base URL
//                          e.g. https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/openai
//   VITE_CF_API_TOKEN    — your Cloudflare API token (if your gateway requires auth)
//                          Leave blank if your gateway is set to "No auth"

async function openaiChat(prompt: string, temperature = 0.8, maxTokens = 400): Promise<string> {
  const gatewayUrl = (import.meta.env.VITE_CF_GATEWAY_URL as string | undefined)?.replace(/\/$/, "");

  if (!gatewayUrl) throw new Error("VITE_CF_GATEWAY_URL not set in .env");

  const cfToken = import.meta.env.VITE_CF_API_TOKEN as string | undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only send auth header if a token is configured
  if (cfToken) {
    headers["cf-aig-authorization"] = `Bearer ${cfToken}`;
  }

  const res = await fetch(`${gatewayUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gateway error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/** Parse the model's JSON array response safely */
function parseJsonArray(raw: string): string[] {
  try {
    // Strip markdown code fences if present
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch { /* fall through */ }
  // Last resort: treat whole string as one item
  return [raw.replace(/^["'\[]+|["'\]]+$/g, "").trim()].filter(Boolean);
}

// ─── Fallbacks (used when OpenAI key is missing or call fails) ────────────────

function quotesFallback(theme: string, mood?: string, count = 1): string[] {
  const t = theme.trim() || "life";
  const m = (mood?.trim() || "inspiring").toLowerCase();
  return [
    `${t} grows when consistency beats excuses.`,
    `Every step in ${t} is progress worth honoring.`,
    `${m} minds turn small moments into lasting wins.`,
    `Start where you are, build what you can, repeat tomorrow.`,
    `${t} rewards those who stay patient and brave.`,
  ].slice(0, Math.max(1, count));
}

function captionFallback(description: string, mood?: string): string {
  return `${description.trim() || "A fresh moment"}\n\nKeeping it ${mood?.trim() || "real"} and consistent. ✨`;
}

function hashtagsFallback(topic: string, count = 15): string[] {
  const seed = topic.toLowerCase().replace(/[^a-z0-9]/g, "") || "motivation";
  return [
    `#${seed}`, "#quoteoftheday", "#dailyinspiration", "#mindset",
    "#growth", "#selfimprovement", "#positivity", "#creator",
    "#contentcreator", "#viral", "#inspire", "#motivation",
    "#success", "#lifequotes", "#goals",
  ].slice(0, count);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useGenerateQuote(config: MutationConfig<QuoteResponse, QuoteRequest> = {}) {
  return useMutation<QuoteResponse, Error, QuoteRequest>({
    mutationFn: async ({ data }) => {
      const count = Math.max(1, data.count ?? 1);
      try {
        const prompt = `Generate ${count} short, punchy, original quote${count > 1 ? "s" : ""} about "${data.theme.trim()}"${data.mood ? ` with a ${data.mood} mood` : ""}.
Each quote should be 1-2 sentences and memorable.
Respond ONLY with a JSON array of strings. No explanation, no markdown.
Example: ["Quote one here.", "Quote two here."]`;
        const raw = await openaiChat(prompt, 0.85, 300);
        const quotes = parseJsonArray(raw);
        return { quotes: quotes.length ? quotes : quotesFallback(data.theme, data.mood, count) };
      } catch (err) {
        console.warn("OpenAI quote failed, using fallback:", err);
        return { quotes: quotesFallback(data.theme, data.mood, count) };
      }
    },
    ...(config.mutation ?? {}),
  });
}

export function useGenerateCaption(config: MutationConfig<CaptionResponse, CaptionRequest> = {}) {
  return useMutation<CaptionResponse, Error, CaptionRequest>({
    mutationFn: async ({ data }) => {
      try {
        const prompt = `Write 3 engaging ${data.platform ?? "instagram"} captions for a quote image about: "${data.description.trim()}"${data.mood ? `. Tone: ${data.mood}` : ""}.
Each caption: 1-3 sentences with good hooks.
Respond ONLY with a JSON array of strings. No explanation, no markdown.
Example: ["Caption one.", "Caption two.", "Caption three."]`;
        const raw = await openaiChat(prompt, 0.8, 400);
        const captions = parseJsonArray(raw);
        return { captions: captions.length ? captions : [captionFallback(data.description, data.mood)] };
      } catch (err) {
        console.warn("OpenAI caption failed, using fallback:", err);
        return { captions: [captionFallback(data.description, data.mood)] };
      }
    },
    ...(config.mutation ?? {}),
  });
}

export function useGenerateHashtags(config: MutationConfig<HashtagResponse, HashtagRequest> = {}) {
  return useMutation<HashtagResponse, Error, HashtagRequest>({
    mutationFn: async ({ data }) => {
      const count = Math.max(1, data.count ?? 15);
      try {
        const prompt = `Generate exactly ${count} relevant ${data.platform ?? "instagram"} hashtags for: "${data.topic.trim()}".
Mix popular and niche hashtags. Each must start with #.
Respond ONLY with a JSON array of strings. No explanation, no markdown.
Example: ["#motivation", "#success", "#mindset"]`;
        const raw = await openaiChat(prompt, 0.7, 300);
        let hashtags = parseJsonArray(raw).map(h => h.startsWith("#") ? h : `#${h}`);
        return { hashtags: hashtags.length ? hashtags : hashtagsFallback(data.topic, count) };
      } catch (err) {
        console.warn("OpenAI hashtag failed, using fallback:", err);
        return { hashtags: hashtagsFallback(data.topic, count) };
      }
    },
    ...(config.mutation ?? {}),
  });
}

export function useTranslateText(config: MutationConfig<TranslateResponse, TranslateRequest> = {}) {
  return useMutation<TranslateResponse, Error, TranslateRequest>({
    mutationFn: async ({ data }) => {
      const languageMap: Record<string, string> = {
        hindi:     "Hindi (Devanagari script)",
        kannada:   "Kannada",
        malayalam: "Malayalam",
        tamil:     "Tamil",
        telugu:    "Telugu",
      };
      const langFull = languageMap[data.targetLanguage.toLowerCase()] ?? data.targetLanguage;
      try {
        const prompt = `Translate the following text to ${langFull}. Keep the meaning, tone, and emotional impact intact.
Respond ONLY with the translated text — no labels, no explanation.

Text:
${data.text.trim()}`;
        const translatedText = await openaiChat(prompt, 0.3, 500);
        return { translatedText: translatedText || data.text, targetLanguage: data.targetLanguage };
      } catch (err) {
        console.warn("OpenAI translate failed, using fallback:", err);
        return { translatedText: `${data.text} (${data.targetLanguage})`, targetLanguage: data.targetLanguage };
      }
    },
    ...(config.mutation ?? {}),
  });
}
