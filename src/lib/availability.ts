/**
 * Availability check against a supplier's Shopify product feed.
 * Returns true when the product has been delisted/removed:
 *  - HTTP 404/410, or
 *  - the product URL redirects to a different product (handle mismatch).
 * Non-standard/unparseable responses, rate-limits and network errors return
 * false (unknown) so we never wrongly flag a genuinely listed product.
 * The public `available` flag is intentionally ignored (these shops report it
 * false even for buyable items).
 */
export async function isDelisted(supplierUrl?: string): Promise<boolean> {
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
    if (!res.ok) return false; // 429/5xx/etc — unknown, don't flag
    const j = await res.json().catch(() => undefined);
    if (j && typeof j === "object" && j.product && j.product.id) {
      if (j.product.handle && handle && String(j.product.handle).toLowerCase() !== handle) return true;
      return false;
    }
    return false;
  } catch {
    return false;
  }
}
