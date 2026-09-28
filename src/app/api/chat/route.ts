import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { products } from "@/data/catalog";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const catalogSummary = products
  .filter((p) => p.inStock)
  .map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brandLabel,
    category: p.category,
    goals: p.goals,
    form: p.form,
    evidence: p.evidenceStrength,
    priceCHF: p.priceCHF,
    note: p.shortDescription,
  }));

const VALID_IDS = new Set(products.map((p) => p.id));

type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are a friendly, knowledgeable supplement adviser at SuppStack, a Swiss shop. You have a natural conversation with the customer to understand their goals, lifestyle, diet, budget and any constraints, then suggest suitable products from the catalog.

HOW TO BEHAVE:
- Be conversational and concise. If you need more detail to give a good answer (e.g. their main goal, age, diet, budget), ask ONE short clarifying question instead of guessing.
- Only recommend when you have enough context. It's fine for early turns to have zero recommendations and just ask a question.
- Recommend at most 6 products, only from the catalog below, and only ones that genuinely fit what they told you. Do not pad the list to fill space. Quality over quantity.
- Prefer "strong" evidence products when equivalent options exist. Consider their stated budget and diet.
- Never invent products or IDs. Never claim a product diagnoses, treats, cures or prevents disease. Use "may support", "is associated with", "research suggests". Add a brief reminder to consult a healthcare professional when relevant.

OUTPUT FORMAT — return ONLY valid JSON, no markdown, exactly:
{"reply": "your conversational message to the customer", "recommendations": [{"productId": "p001", "reason": "one short sentence why it fits THEM"}]}
If you are only asking a question this turn, return an empty recommendations array.

CATALOG (only these products exist):
${JSON.stringify(catalogSummary)}`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMsg[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI chat is not configured. Set ANTHROPIC_API_KEY." }, { status: 503 });
    }
    // keep the last ~12 turns, cap message length
    const trimmed = messages
      .slice(-12)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

    const message = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      messages: trimmed,
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    let parsed: { reply?: string; recommendations?: { productId: string; reason: string }[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { reply: text, recommendations: [] };
    }

    const recommendations = (parsed.recommendations ?? [])
      .filter((r) => VALID_IDS.has(r.productId))
      .map((r) => ({ product: products.find((p) => p.id === r.productId)!, reason: r.reason }))
      .filter((r) => r.product?.inStock)
      .slice(0, 6);

    return NextResponse.json({
      reply: parsed.reply || "Here are some options that could fit.",
      recommendations,
    });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
