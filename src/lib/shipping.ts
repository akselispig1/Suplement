// Shipping charged to the customer at checkout.
// The customer's shipping fee = your typical supplier shipping cost + markup,
// so the 20% margin sits ON TOP OF shipping (you don't lose money on delivery).
export const MARKUP = 0.20;
export const SUPPLIER_SHIP_BASE_CHF = 9.90; // your typical cost to ship one order
export const SHIPPING_FEE_CHF = Math.round(SUPPLIER_SHIP_BASE_CHF * (1 + MARKUP) * 100) / 100; // 11.88
export const FREE_SHIPPING_OVER_CHF = 60;

/** Shipping fee for a given cart subtotal (CHF). Free above the threshold. */
export function shippingFor(subtotalCHF: number): number {
  if (subtotalCHF <= 0) return 0;
  return subtotalCHF >= FREE_SHIPPING_OVER_CHF ? 0 : SHIPPING_FEE_CHF;
}
