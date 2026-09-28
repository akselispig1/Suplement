import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/product-store";
import { createOrder } from "@/lib/orders";
import { shippingFor } from "@/lib/shipping";
import { randomUUID } from "crypto";
import { Order } from "@/types/product";

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

    // Stock / availability check — ensure every item can actually be sourced and
    // shipped. If not, tell the customer and offer in-stock replacements.
    const issues = items
      .map(({ productId }) => {
        const product = allProducts.find((p) => p.id === productId);
        if (product && product.inStock) return null;
        const name = product?.name ?? "This product";
        const category = product?.category;
        const replacements = allProducts
          .filter((p) => p.inStock && p.id !== productId && (!category || p.category === category))
          .sort((a, b) => Math.abs((a.priceCHF) - (product?.priceCHF ?? a.priceCHF)) - Math.abs((b.priceCHF) - (product?.priceCHF ?? b.priceCHF)))
          .slice(0, 3);
        return { productId, productName: name, reason: product ? "Out of stock" : "No longer available", replacements };
      })
      .filter(Boolean);

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
