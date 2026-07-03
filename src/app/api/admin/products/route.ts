import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, updateProduct, deleteProduct, nextProductId } from "@/lib/product-store";
import { Product } from "@/types/product";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  const token =
    req.cookies.get("admin_token")?.value ||
    req.nextUrl.searchParams.get("token") ||
    req.headers.get("x-admin-token");
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ products: getAllProducts() });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allProducts = getAllProducts();
  const id = nextProductId(allProducts);
  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const product: Product = {
    id,
    slug: body.slug || slug,
    name: body.name,
    brandLabel: body.brandLabel || "SuppStack",
    category: body.category,
    subCategory: body.subCategory || undefined,
    goals: body.goals || [],
    shortDescription: body.shortDescription || "",
    longDescription: body.longDescription || "",
    form: body.form || "capsule",
    servingSize: body.servingSize || "",
    servingsPerContainer: Number(body.servingsPerContainer) || 30,
    priceCHF: Number(body.priceCHF) || 0,
    compareAtPriceCHF: body.compareAtPriceCHF ? Number(body.compareAtPriceCHF) : undefined,
    evidenceStrength: body.evidenceStrength || "moderate",
    bestFor: body.bestFor || [],
    pairsWith: body.pairsWith || [],
    cautions: body.cautions || "",
    inStock: body.inStock !== false,
    imageUrl: body.imageUrl || "",
    supplierUrl: body.supplierUrl || "",
    supplierCostCHF: body.supplierCostCHF ? Number(body.supplierCostCHF) : 0,
    shippingCostCHF: body.shippingCostCHF ? Number(body.shippingCostCHF) : 0,
  };

  createProduct(product);
  return NextResponse.json({ product }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  const updated = updateProduct(id, updates);
  if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const ok = deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
