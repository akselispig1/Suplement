import { Order } from "@/types/product";
import { Resend } from "resend";

export interface FulfillmentProvider {
  notifyOperator(order: Order): Promise<void>;
  notifyCustomer(order: Order): Promise<void>;
}

function buildPackingListHtml(order: Order): string {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px;border:1px solid #ddd">${item.productName}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:center">${item.quantity}</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right">CHF ${(item.priceCHF * item.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  const addr = order.shippingAddress;
  return `
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
<h2 style="color:#16a34a">📦 New Order — Pack & Ship</h2>
<p><strong>Order ID:</strong> ${order.id}</p>
<p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
<h3>Ship To:</h3>
<p>${order.customerName}<br>${addr.line1}${addr.line2 ? "<br>" + addr.line2 : ""}<br>${addr.city}${addr.postalCode ? " " + addr.postalCode : ""}${addr.state ? ", " + addr.state : ""}<br>${addr.country}</p>
<h3>Items:</h3>
<table style="border-collapse:collapse;width:100%">
<thead><tr><th style="padding:4px 8px;border:1px solid #ddd;text-align:left">Product</th><th style="padding:4px 8px;border:1px solid #ddd">Qty</th><th style="padding:4px 8px;border:1px solid #ddd;text-align:right">Subtotal</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p style="margin-top:12px"><strong>Total: CHF ${order.totalCHF.toFixed(2)}</strong></p>
</body></html>`;
}

function buildConfirmationHtml(order: Order): string {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:4px 8px">${item.productName}</td><td style="padding:4px 8px;text-align:center">${item.quantity}</td><td style="padding:4px 8px;text-align:right">CHF ${(item.priceCHF * item.quantity).toFixed(2)}</td></tr>`
    )
    .join("");

  return `
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
<h2 style="color:#16a34a">Thank you for your order, ${order.customerName}!</h2>
<p>Your order <strong>${order.id}</strong> has been confirmed and will be shipped as one package.</p>
<table style="border-collapse:collapse;width:100%;margin:16px 0">
<thead><tr style="background:#f3f4f6"><th style="padding:8px;text-align:left">Product</th><th style="padding:8px">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p><strong>Total: CHF ${order.totalCHF.toFixed(2)}</strong></p>
<p style="color:#6b7280;font-size:14px">You'll receive a shipping confirmation once your order is on its way. Questions? Reply to this email.</p>
</body></html>`;
}

class ResendFulfillment implements FulfillmentProvider {
  private resend: Resend;
  private operatorEmail: string;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.operatorEmail = process.env.OPERATOR_EMAIL || "operator@suppstack.com";
    this.fromEmail = process.env.FROM_EMAIL || "orders@suppstack.com";
  }

  async notifyOperator(order: Order) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: this.operatorEmail,
      subject: `[SuppStack] New Order ${order.id} — Pack & Ship`,
      html: buildPackingListHtml(order),
    });
  }

  async notifyCustomer(order: Order) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: order.customerEmail,
      subject: `Your SuppStack order ${order.id} is confirmed`,
      html: buildConfirmationHtml(order),
    });
  }
}

class ConsoleFulfillment implements FulfillmentProvider {
  async notifyOperator(order: Order) {
    console.log("[FULFILLMENT] Operator packing list for order", order.id, JSON.stringify(order, null, 2));
  }
  async notifyCustomer(order: Order) {
    console.log("[FULFILLMENT] Customer confirmation for order", order.id, "to", order.customerEmail);
  }
}

export function getFulfillmentProvider(): FulfillmentProvider {
  if (process.env.RESEND_API_KEY) return new ResendFulfillment();
  return new ConsoleFulfillment();
}

export { buildPackingListHtml };
