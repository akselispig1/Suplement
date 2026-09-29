import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, updateProduct } from "@/lib/product-store";
import { isDelisted } from "@/lib/availability";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  const token =
    req.cookies.get("admin_token")?.value ||
    req.nextUrl.searchParams.get("token") ||
    req.headers.get("x-admin-token");
  return token === secret;
}

/**
 * Bulk availability sweep — combs the catalog in batches so it never times out.
 * Called repeatedly by the admin panel with an increasing offset.
 * Products found delisted at the supplier are marked out of stock.
 * GET /api/admin/check-stock?offset=0&limit=30
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = getAllProducts();
  const offset = Math.max(0, parseInt(req.nextUrl.searchParams.get("offset") || "0", 10) || 0);
  const limit = Math.min(40, Math.max(5, parseInt(req.nextUrl.searchParams.get("limit") || "25", 10) || 25));
  const slice = all.slice(offset, offset + limit);

  const results = await Promise.all(
    slice.map(async (p) => {
      const gone = await isDelisted(p.supplierUrl);
      if (gone && p.inStock) updateProduct(p.id, { inStock: false });
      return gone ? { id: p.id, name: p.name, brand: p.brandLabel } : null;
    })
  );

  const delisted = results.filter(Boolean);
  const nextOffset = offset + limit;
  return NextResponse.json({
    total: all.length,
    checked: Math.min(nextOffset, all.length),
    delisted,
    done: nextOffset >= all.length,
    nextOffset: nextOffset >= all.length ? null : nextOffset,
  });
}
