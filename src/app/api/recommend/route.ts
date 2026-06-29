import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { products } from "@/data/catalog";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const catalogSummary = products.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  goals: p.goals,
  shortDescription: p.shortDescription,
  evidenceStrength: p.evidenceStrength,
  form: p.form,
  priceCHF: p.priceCHF,
  inStock: p.inStock,
}));

const VALID_IDS = new Set(products.map((p) => p.id));

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.length > 500) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "AI recommendations not configured. Set ANTHROPIC_API_KEY." }, { status: 503 });
    }

    const message = await getClient().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are a knowledgeable supplement educator at SuppStack. Your role is to suggest relevant supplements from our catalog based on a person's goals.

IMPORTANT RULES:
- Only recommend products from the catalog provided below
- Return valid JSON only — an array of objects with "productId" and "reason" fields
- Maximum 8 recommendations
- Prefer products with evidenceStrength "strong" when available
- Keep reasons brief (1-2 sentences), educational, and avoid any disease/treatment claims
- Use phrases like "may support", "is associated with", "research suggests"
- Never claim products can diagnose, treat, cure, or prevent any disease
- If a product is not in stock (inStock: false), do not recommend it

CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

Return format (JSON only, no markdown):
[{"productId": "p001", "reason": "..."}]`,
      messages: [
        {
          role: "user",
          content: `My goals: ${query}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    let parsed: { productId: string; reason: string }[];
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Invalid AI response format");
      parsed = JSON.parse(match[0]);
    }

    const recommendations = parsed
      .filter((r) => VALID_IDS.has(r.productId))
      .map((r) => ({
        product: products.find((p) => p.id === r.productId)!,
        reason: r.reason,
      }))
      .filter((r) => r.product?.inStock);

    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("[recommend]", err);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
