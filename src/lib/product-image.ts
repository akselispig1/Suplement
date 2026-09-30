import { Product } from "@/types/product";

/** Slugify a category name to match the generated /images/categories/*.svg files. */
export function categorySlug(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Resolve the image to show for a product:
 * - an uploaded photo (/images/products/...) always wins
 * - otherwise fall back to the tinted category bottle illustration
 */
export function productImage(p: Pick<Product, "imageUrl" | "category">): string {
  // Honour a real photo: an external supplier image (http) or an uploaded file
  // under /images/uploads. Anything else falls back to the category illustration.
  if (p.imageUrl && (p.imageUrl.startsWith("http") || p.imageUrl.startsWith("/images/uploads"))) {
    return p.imageUrl;
  }
  return `/images/categories/${categorySlug(p.category)}.svg`;
}

/** Default operator buy-link: iHerb Switzerland search (ships to CH at normal rates). */
export function defaultSupplierUrl(name: string): string {
  return `https://ch.iherb.com/search?kw=${encodeURIComponent(name)}`;
}
