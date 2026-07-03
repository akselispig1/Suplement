"use client";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import { productImage, categorySlug } from "@/lib/product-image";

/**
 * Product image with graceful fallback: tries the resolved image (an uploaded
 * photo when present) and falls back to the tinted category illustration if it
 * fails to load — so seeded products with placeholder photo paths never break.
 */
export default function ProductImg({
  product,
  className = "",
}: {
  product: Pick<Product, "imageUrl" | "category" | "name">;
  className?: string;
}) {
  const fallback = `/images/categories/${categorySlug(product.category)}.svg`;
  const [src, setSrc] = useState(productImage(product));
  const ref = useRef<HTMLImageElement>(null);

  // Catch images that errored during SSR before React attached onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0 && src !== fallback) setSrc(fallback);
  }, [src, fallback]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={product.name}
      className={className}
      onError={() => { if (src !== fallback) setSrc(fallback); }}
    />
  );
}
