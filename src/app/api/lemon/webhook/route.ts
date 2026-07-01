import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrderByStripeSession } from "@/lib/orders";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { getAllProducts } from "@/lib/product-store";
import { Order } from "@/types/product";
import { randomUUID } from "crypto";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-signature");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (secret && sig) {
    const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (hmac !== sig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(body);
  const eventName: string = event.meta?.event_name ?? "";

  if (eventName === "order_created") {
    const attr = event.data?.attributes ?? {};
    const sessionId = String(event.data?.id ?? "");

    if (getOrderByStripeSession(sessionId)) {
      return NextResponse.json({ received: true });
    }

    const customData: Record<string, string> = attr.first_order_item?.custom_data ?? attr.meta?.custom_data ?? {};
    const rawItems: { productId: string; quantity: number }[] = customData.items
      ? JSON.parse(customData.items)
      : [];

    const allProducts = getAllProducts();
    const orderItems = rawItems.map(({ productId, quantity }) => {
      const product = allProducts.find((p) => p.id === productId);
      return {
        productId,
        productName: product?.name ?? productId,
        quantity,
        priceCHF: product?.priceCHF ?? 0,
      };
    });

    const billingAddr = attr.billing_address ?? {};
    const order: Order = {
      id: `SS-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
      customerName: attr.user_name ?? "Customer",
      customerEmail: attr.user_email ?? "",
      shippingAddress: {
        line1: billingAddr.street ?? "",
        city: billingAddr.city ?? "",
        state: billingAddr.state ?? undefined,
        postalCode: billingAddr.zip ?? "",
        country: billingAddr.country ?? "",
      },
      items: orderItems,
      totalCHF: (attr.total ?? 0) / 100,
      stripeSessionId: sessionId,
      status: "to_ship",
      createdAt: new Date().toISOString(),
    };

    createOrder(order);

    const fulfillment = getFulfillmentProvider();
    await Promise.allSettled([
      fulfillment.notifyOperator(order),
      fulfillment.notifyCustomer(order),
    ]);

    console.log("[lemon webhook] Order created:", order.id);
  }

  return NextResponse.json({ received: true });
}
