import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/product-store";
import { createOrder } from "@/lib/orders";
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
    const orderItems = items.map(({ productId, quantity }) => {
      const product = allProducts.find((p) => p.id === productId);
      if (!product) throw new Error(`Product ${productId} not found`);
      return { productId, productName: product.name, quantity, priceCHF: product.priceCHF };
    });

    const totalCHF = orderItems.reduce((s, i) => s + i.priceCHF * i.quantity, 0);
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
      totalCHF,
      stripeSessionId: "",
      status: "awaiting_payment",
      createdAt: new Date().toISOString(),
    };

    createOrder(order);

    return NextResponse.json({ orderId, totalCHF });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Checkout failed" }, { status: 500 });
  }
}
