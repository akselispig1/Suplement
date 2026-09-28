import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/product-store";
import { createOrder } from "@/lib/orders";
import { shippingFor } from "@/lib/shipping";
import { randomUUID } from "crypto";
import { Order } from "@/types/product";

/**
 * Live availability check against the supplier's Shopify feed.
 * Returns false ONLY when the product page is gone (404 = delisted/unavailable).
 * Returns true when the feed clearly marks it buyable; otherwise null (unknown),
 * because most of these shops report `available:false` even for in-stock items,
 * so that flag can't be trusted to block an order.
 */
async function liveAvailable(supplierUrl?: string): Promise<boolean | null> {
  if (!supplierUrl) return null;
  try {
    const u = new URL(supplierUrl);
    if (!u.pathname.includes("/products/")) return null;
    const jsonUrl = `${u.origin}${u.pathname.replace(/\/+$/, "")}.json`;
    const res = await fetch(jsonUrl, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 404 || res.status === 410) return false; // product removed
    if (!res.ok) return null;
    const j = await res.json();
    const variants = j?.product?.variants;
    if (Array.isArray(variants) && variants.some((v: { available?: boolean }) => v.available === true)) return true;
    return null; // inconclusive — don't block on the unreliable sold-out flag
  } catch {
    return null; // network/timeout/parse — unknown, fall back to admin flag
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      items: { productId: string; quantity: number }[];
      customerName?: string;
      customerEmail?: string;
      shippingAddress?: { line1: string; city: string; postalCode: string; country?: string };
    };

    const { items, customerName, customerEmail, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const allProducts = getAllProducts();

    // Availability check — verify each item live on the supplier's site, and fall
    // back to the admin in-stock flag if the live check can't be reached. If an
    // item can't be sourced, block the order and offer in-stock replacements.
    const issues = (
      await Promise.all(
        items.map(async ({ productId }) => {
          const product = allProducts.find((p) => p.id === productId);
          if (product && product.inStock) {
            const live = await liveAvailable(product.supplierUrl);
            if (live !== false) return null; // in stock, or unknown -> allow
          }
          const name = product?.name ?? "This product";
          const category = product?.category;
          const replacements = allProducts
            .filter((p) => p.inStock && p.id !== productId && (!category || p.category === category))
            .sort((a, b) => Math.abs(a.priceCHF - (product?.priceCHF ?? a.priceCHF)) - Math.abs(b.priceCHF - (product?.priceCHF ?? b.priceCHF)))
            .slice(0, 3);
          return {
            productId,
            productName: name,
            reason: !product ? "No longer available" : "Out of stock at the supplier",
            replacements,
          };
        })
      )
    ).filter(Boolean);

    if (issues.length > 0) {
      return NextResponse.json(
        { error: "Some items are no longer available", issues },
        { status: 409 }
      );
    }

    const orderItems = items.map(({ productId, quantity }) => {
      const product = allProducts.find((p) => p.id === productId);
      if (!product) throw new Error(`Product ${productId} not found`);
      return { productId, productName: product.name, quantity, priceCHF: product.priceCHF };
    });

    const subtotalCHF = orderItems.reduce((s, i) => s + i.priceCHF * i.quantity, 0);
    const shippingCHF = shippingFor(subtotalCHF);
    const totalCHF = subtotalCHF + shippingCHF;
    const orderId = `SS-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const order: Order = {
      id: orderId,
      customerName: customerName || "Customer",
      customerEmail: customerEmail || "",
      shippingAddress: {
        line1: shippingAddress?.line1 || "",
        city: shippingAddress?.city || "",
        postalCode: shippingAddress?.postalCode || "",
        country: shippingAddress?.country || "CH",
      },
      items: orderItems,
      subtotalCHF,
      shippingCHF,
      totalCHF,
      stripeSessionId: "",
      status: "awaiting_payment",
      createdAt: new Date().toISOString(),
    };

    createOrder(order);

    return NextResponse.json({ orderId, totalCHF, subtotalCHF, shippingCHF });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Checkout failed" }, { status: 500 });
  }
}
