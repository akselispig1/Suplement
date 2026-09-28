// Shipping charged to the customer at checkout.
// Change these two numbers to adjust the shipping model everywhere.
export const SHIPPING_FEE_CHF = 6.90;
export const FREE_SHIPPING_OVER_CHF = 60;

/** Shipping fee for a given cart subtotal (CHF). Free above the threshold. */
export function shippingFor(subtotalCHF: number): number {
  if (subtotalCHF <= 0) return 0;
  return subtotalCHF >= FREE_SHIPPING_OVER_CHF ? 0 : SHIPPING_FEE_CHF;
}
