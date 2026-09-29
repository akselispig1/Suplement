import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/product-store";
import { createOrder } from "@/lib/orders";
import { shippingFor } from "@/lib/shipping";
import { randomUUID } from "crypto";
import { Order, Product } from "@/types/product";

const MAX_LINE_QTY = 20;
const MAX_LINES = 50;

/** Simple in-memory per-IP rate limiter (best-effort; resets on redeploy). */
const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 12, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

function clean(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * The reliable live signal from these suppliers is whether the product still
 * exists on their site. Returns true when it's been delisted/removed:
 *  - HTTP 404/410, or
 *  - a "soft 404" (200 but the JSON has no real product / handle mismatch, i.e.
 *    the store redirected a dead URL to a generic page).
 * The public `available` flag is NOT used (shops report false for buyable items).
 * Best-effort and never throws; a network failure does not block the order.
 */
async function isDelisted(supplierUrl?: string): Promise<boolean> {
  if (!supplierUrl) return false;
  try {
    const u = new URL(supplierUrl);
    if (!u.pathname.includes("/products/")) return false;
    const handle = u.pathname.split("/products/")[1]?.replace(/\/+$/, "").toLowerCase();
    const res = await fetch(`${u.origin}/products/${handle}.json`, {
      method: "GET",
      headers: { accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404 || res.status === 410) return true;
    if (!res.ok) return false; // 429/5xx/etc — unknown, don't block
    const j = await res.json().catch(() => undefined);
    // Only act on a clean, parseable product response. Anything non-standard
    // (a store that doesn't serve product JSON) is treated as unknown -> allow.
    if (j && typeof j === "object" && j.product && j.product.id) {
      if (j.product.handle && handle && String(j.product.handle).toLowerCase() !== handle) return true; // redirected to a different product
      return false; // genuine product page still exists
    }
    return false; // couldn't confirm -> don't block
  } catch {
    return false; // network/timeout -> don't block
  }
}

function replacementsFor(product: Product | undefined, all: Product[]) {
  const category = product?.category;
  return all
    .filter((p) => p.inStock && p.id !== product?.id && (!category || p.category === category))
    .sort((a, b) => Math.abs(a.priceCHF - (product?.priceCHF ?? a.priceCHF)) - Math.abs(b.priceCHF - (product?.priceCHF ?? b.priceCHF)))
    .slice(0, 3);
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many attempts. Please wait a moment and try again." }, { status: 429 });
    }

    const body = await req.json().catch(() => null) as {
      items?: { productId?: unknown; quantity?: unknown }[];
      customerName?: unknown; customerEmail?: unknown;
      shippingAddress?: { line1?: unknown; city?: unknown; postalCode?: unknown; country?: unknown };
    } | null;

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (body.items.length > MAX_LINES) {
      return NextResponse.json({ error: "Too many items in the cart." }, { status: 400 });
    }

    // Validate + merge line items (server is the source of truth for what's valid).
    const wanted = new Map<string, number>();
    for (const raw of body.items) {
      const productId = clean(raw?.productId, 40);
      const qty = Number(raw?.quantity);
      if (!productId || !Number.isInteger(qty) || qty < 1) {
        return NextResponse.json({ error: "Invalid item in cart." }, { status: 400 });
      }
      const capped = Math.min(qty, MAX_LINE_QTY);
      wanted.set(productId, Math.min((wanted.get(productId) ?? 0) + capped, MAX_LINE_QTY));
    }

    // Validate delivery details.
    const customerName = clean(body.customerName, 120) || "Customer";
    const customerEmail = clean(body.customerEmail, 160);
    if (customerEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const line1 = clean(body.shippingAddress?.line1, 200);
    const city = clean(body.shippingAddress?.city, 120);
    const postalCode = clean(body.shippingAddress?.postalCode, 20);
    if (!line1 || !city || !postalCode) {
      return NextResponse.json({ error: "Please complete your delivery address." }, { status: 400 });
    }

    const allProducts = getAllProducts();

    // Availability: product must exist AND be in stock (authoritative admin flag),
    // AND not delisted at the supplier. Anything else -> block with replacements.
    const issues = (
      await Promise.all(
        [...wanted.keys()].map(async (productId) => {
          const product = allProducts.find((p) => p.id === productId);
          if (!product) {
            return { productId, productName: "This product", reason: "No longer available", replacements: replacementsFor(undefined, allProducts) };
          }
          if (!product.inStock) {
            return { productId, productName: product.name, reason: "Out of stock", replacements: replacementsFor(product, allProducts) };
          }
          if (await isDelisted(product.supplierUrl)) {
            return { productId, productName: product.name, reason: "No longer available from the supplier", replacements: replacementsFor(product, allProducts) };
          }
          return null;
        })
      )
    ).filter(Boolean);

    if (issues.length > 0) {
      return NextResponse.json({ error: "Some items are no longer available", issues }, { status: 409 });
    }

    // Build order from server-side data ONLY — prices/totals can't be tampered by the client.
    const orderItems = [...wanted.entries()].map(([productId, quantity]) => {
      const product = allProducts.find((p) => p.id === productId)!;
      return { productId, productName: product.name, quantity, priceCHF: product.priceCHF };
    });

    const subtotalCHF = Math.round(orderItems.reduce((s, i) => s + i.priceCHF * i.quantity, 0) * 100) / 100;
    const shippingCHF = shippingFor(subtotalCHF);
    const totalCHF = Math.round((subtotalCHF + shippingCHF) * 100) / 100;
    const orderId = `SS-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const order: Order = {
      id: orderId,
      customerName, customerEmail,
      shippingAddress: { line1, city, postalCode, country: clean(body.shippingAddress?.country, 4) || "CH" },
      items: orderItems,
      subtotalCHF, shippingCHF, totalCHF,
      stripeSessionId: "",
      status: "awaiting_payment",
      createdAt: new Date().toISOString(),
    };

    createOrder(order);

    return NextResponse.json({ orderId, totalCHF, subtotalCHF, shippingCHF });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
