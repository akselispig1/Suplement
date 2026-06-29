import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { products } from "@/data/catalog";

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json() as { items: { productId: string; quantity: number }[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const lineItems = items.map(({ productId, quantity }) => {
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error(`Product ${productId} not found`);
      return {
        price_data: {
          currency: "chf",
          unit_amount: Math.round(product.priceCHF * 100),
          product_data: {
            name: product.name,
            description: product.shortDescription,
            metadata: { productId: product.id },
          },
        },
        quantity,
      };
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["CH", "DE", "AT", "FR", "GB", "US"] },
      metadata: { items: JSON.stringify(items) },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
