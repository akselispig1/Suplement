import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { products } from "@/data/catalog";
import { Product } from "@/types/product";

const inStock = products.filter((p) => p.inStock);

const catalogSummary = inStock.map((p) => ({
  id: p.id, name: p.name, brand: p.brandLabel, category: p.category,
  goals: p.goals, form: p.form, evidence: p.evidenceStrength,
  priceCHF: p.priceCHF, note: p.shortDescription,
}));

const VALID_IDS = new Set(products.map((p) => p.id));

type ChatMsg = { role: "user" | "assistant"; content: string };
type Rec = { product: Product; reason: string };

const SYSTEM = `You are a friendly, knowledgeable supplement adviser at SuppStack, a Swiss shop. Have a natural conversation to understand the customer's goals, lifestyle, diet, budget and constraints, then suggest suitable products from the catalog.

HOW TO BEHAVE:
- Be conversational and concise. If you need more detail for a good answer, ask ONE short clarifying question instead of guessing.
- Only recommend when you have enough context; early turns can have zero recommendations and just ask a question.
- Recommend at most 6 products, only from the catalog below, only ones that genuinely fit. Quality over quantity.
- Prefer "strong" evidence when equivalent options exist. Respect stated budget and diet.
- Never invent products or IDs. Never claim a product diagnoses, treats, cures or prevents disease. Use "may support", "is associated with". Remind them to consult a healthcare professional when relevant.

OUTPUT: return ONLY valid JSON, no markdown, exactly:
{"reply": "your message to the customer", "recommendations": [{"productId": "p001", "reason": "one short sentence why it fits THEM"}]}
If you are only asking a question, return an empty recommendations array.

CATALOG (only these products exist):
${JSON.stringify(catalogSummary)}`;

function toRecs(list: { productId: string; reason: string }[]): Rec[] {
  return (list ?? [])
    .filter((r) => VALID_IDS.has(r.productId))
    .map((r) => ({ product: products.find((p) => p.id === r.productId)!, reason: r.reason }))
    .filter((r) => r.product?.inStock)
    .slice(0, 6);
}

function extractJson(text: string): { reply?: string; recommendations?: { productId: string; reason: string }[] } {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : { reply: text, recommendations: [] };
  }
}

/* ---------- Provider: Google Gemini (free tier) ---------- */
async function viaGemini(messages: ChatMsg[], sys: string) {
  const key = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024, responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const parsed = extractJson(text);
  return { reply: parsed.reply || "Here are some options that could fit.", recommendations: toRecs(parsed.recommendations ?? []) };
}

/* ---------- Provider: Anthropic ---------- */
async function viaAnthropic(messages: ChatMsg[], sys: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6", max_tokens: 1024, system: sys, messages,
  });
  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = extractJson(text);
  return { reply: parsed.reply || "Here are some options that could fit.", recommendations: toRecs(parsed.recommendations ?? []) };
}

/* ---------- Fallback: local, no API key, no cost ---------- */
const GOAL_KW: [RegExp, string][] = [
  [/sleep|insomnia|rest|night/, "sleep"], [/stress|anxious|anxiety|calm|relax|cortisol/, "stress"],
  [/energy|tired|fatigue|energ/, "energy"], [/focus|concentrat|brain|memory|cognit|study/, "focus"],
  [/muscle|gym|lift|strength|gains|train|protein|workout/, "muscle"], [/immun|cold|sick|defence|defense/, "immune"],
  [/gut|digest|bloat|stomach|probiotic/, "gut"], [/joint|knee|mobility|ache|arthr/, "joints"],
  [/heart|cholesterol|blood pressure|cardio/, "heart"], [/skin|hair|nail|beauty|glow/, "skin"],
  [/endurance|run|marathon|cycl|stamina/, "endurance"], [/longevity|aging|age|cellular/, "longevity"],
];
const evidenceRank: Record<string, number> = { strong: 0, moderate: 1, emerging: 2 };

function localReply(messages: ChatMsg[], context = "") {
  const text = (context + " " + messages.filter((m) => m.role === "user").map((m) => m.content).join(" ")).toLowerCase();
  const goals = GOAL_KW.filter(([re]) => re.test(text)).map(([, g]) => g);
  const vegan = /vegan|plant.?based/.test(text);
  const budgetMatch = text.match(/(\d{2,3})\s*(chf|fr|francs|budget|max)?/);
  const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  if (goals.length === 0) {
    return {
      reply: "Happy to help! What are you mainly looking to improve — for example energy, sleep, stress, muscle, focus, immunity, gut health or skin? A word or two is enough.",
      recommendations: [] as Rec[],
    };
  }

  const scored = inStock
    .filter((p) => !vegan || !["softgel", "gummy"].includes(p.form))
    .filter((p) => budget == null || p.priceCHF <= budget)
    .map((p) => ({ p, score: p.goals.filter((g) => goals.includes(g)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (evidenceRank[a.p.evidenceStrength] ?? 3) - (evidenceRank[b.p.evidenceStrength] ?? 3) || a.p.priceCHF - b.p.priceCHF)
    .slice(0, 6);

  const goalText = goals.join(", ");
  const recommendations: Rec[] = scored.map(({ p }) => ({
    product: p,
    reason: `May support your ${p.goals.filter((g) => goals.includes(g))[0] || goalText} goal — ${p.evidenceStrength} evidence.`,
  }));

  return {
    reply: recommendations.length
      ? `Based on ${goalText}, here are some options that fit${vegan ? " (vegan-friendly)" : ""}${budget ? ` under CHF ${budget}` : ""}. Tell me more — your diet, budget or age — and I can refine. Educational only; check with a healthcare professional before starting.`
      : "I couldn't find a close match in stock for that. Could you tell me a bit more about your main goal?",
    recommendations,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = (await req.json()) as { messages: ChatMsg[]; context?: string };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }
    const trimmed = messages.slice(-12).map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));
    const ctx = typeof context === "string" ? context.slice(0, 1500) : "";
    const sys = ctx ? `${SYSTEM}\n\nCURRENT SHOPPER CONTEXT (use it to tailor answers, e.g. about what's in their basket or the product they're viewing):\n${ctx}` : SYSTEM;

    let result;
    try {
      if (process.env.GEMINI_API_KEY) result = await viaGemini(trimmed, sys);
      else if (process.env.ANTHROPIC_API_KEY) result = await viaAnthropic(trimmed, sys);
      else result = localReply(trimmed, ctx);
    } catch (providerErr) {
      console.error("[chat] provider error, using local fallback:", providerErr);
      result = localReply(trimmed, ctx);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
