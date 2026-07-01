import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/product-store";

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json() as { items: { productId: string; quantity: number }[] };
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const allProducts = getAllProducts();
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Lemon Squeezy path
    const lsApiKey = process.env.LEMONSQUEEZY_API_KEY;
    const lsStoreId = process.env.LEMONSQUEEZY_STORE_ID;
    const lsVariantId = process.env.LEMONSQUEEZY_VARIANT_ID;

    if (lsApiKey && lsStoreId && lsVariantId) {
      const { createLSCheckout } = await import("@/lib/lemonsqueezy");

      // Build a summary of items for the order
      const lineItems = items.map(({ productId, quantity }) => {
        const product = allProducts.find((p) => p.id === productId);
        if (!product) throw new Error(`Product ${productId} not found`);
        return { name: product.name, quantity, priceCHF: product.priceCHF };
      });

      const total = lineItems.reduce((s, i) => s + i.priceCHF * i.quantity, 0);
      const itemsSummary = JSON.stringify(items);

      const url = await createLSCheckout({
        storeId: lsStoreId,
        variantId: lsVariantId,
        customData: {
          items: itemsSummary,
          total: total.toFixed(2),
        },
        redirectUrl: `${origin}/checkout/success`,
      });

      return NextResponse.json({ url });
    }

    // Demo fallback (no payment keys configured)
    return NextResponse.json({
      url: `${origin}/checkout/success?demo=1`,
      demo: true,
    });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Checkout failed" }, { status: 500 });
  }
}
