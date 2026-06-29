import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { products } from "@/data/catalog";
import { createOrder, getOrderByStripeSession } from "@/lib/orders";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { Order } from "@/types/product";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any;

    // Idempotency: skip if already processed
    if (getOrderByStripeSession(session.id)) {
      return NextResponse.json({ received: true });
    }

    const rawItems = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
    const orderItems = rawItems.map(({ productId, quantity }: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === productId);
      return {
        productId,
        productName: product?.name ?? productId,
        quantity,
        priceCHF: product?.priceCHF ?? 0,
      };
    });

    const addr = session.shipping_details?.address;
    const order: Order = {
      id: `SS-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
      customerName: session.shipping_details?.name ?? session.customer_details?.name ?? "Customer",
      customerEmail: session.customer_details?.email ?? "",
      shippingAddress: {
        line1: addr?.line1 ?? "",
        line2: addr?.line2 ?? undefined,
        city: addr?.city ?? "",
        state: addr?.state ?? undefined,
        postalCode: addr?.postal_code ?? "",
        country: addr?.country ?? "",
      },
      items: orderItems,
      totalCHF: (session.amount_total ?? 0) / 100,
      stripeSessionId: session.id,
      status: "to_ship",
      createdAt: new Date().toISOString(),
    };

    createOrder(order);

    const fulfillment = getFulfillmentProvider();
    await Promise.allSettled([
      fulfillment.notifyOperator(order),
      fulfillment.notifyCustomer(order),
    ]);

    console.log("[webhook] Order created:", order.id);
  }

  return NextResponse.json({ received: true });
}

