"use client";
import Link from "next/link";
import { ShoppingCart, Plus, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import EvidenceBadge from "./EvidenceBadge";

interface Props {
  product: Product;
  reason?: string;
  showSelect?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export default function ProductCard({ product, reason, showSelect, selected, onToggleSelect }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={`group relative bg-white rounded-2xl border ${selected ? "border-green-500 ring-2 ring-green-200" : "border-gray-100"} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col`}>
      <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 h-44 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl">
            {getCategoryEmoji(product.category)}
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h3>
            <EvidenceBadge strength={product.evidenceStrength} />
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{product.shortDescription}</p>
          {reason && (
            <p className="text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1 italic">{reason}</p>
          )}
          <div className="mt-auto pt-2 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">CHF {product.priceCHF.toFixed(2)}</span>
              {product.compareAtPriceCHF && (
                <span className="ml-2 text-xs text-gray-400 line-through">CHF {product.compareAtPriceCHF.toFixed(2)}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">{product.form}</span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex gap-2">
        {showSelect ? (
          <button
            onClick={onToggleSelect}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 ${selected ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {selected ? <><Check className="w-3.5 h-3.5" /> Selected</> : <><Plus className="w-3.5 h-3.5" /> Select</>}
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
              !product.inStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : added
                ? "bg-green-600 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {added ? <><Check className="w-3.5 h-3.5" /> Added</> : <><ShoppingCart className="w-3.5 h-3.5" /> {product.inStock ? "Add to Cart" : "Out of Stock"}</>}
          </button>
        )}
      </div>
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Vitamins": "💊",
    "Minerals": "🪨",
    "Protein & Amino Acids": "💪",
    "Performance & Pre-Workout": "⚡",
    "Omega & Essential Fats": "🐟",
    "Gut Health": "🦠",
    "Sleep & Relaxation": "🌙",
    "Stress & Adaptogens": "🌿",
    "Focus & Nootropics": "🧠",
    "Joint & Mobility": "🦴",
    "Immune Support": "🛡️",
    "Greens & Superfoods": "🥦",
    "Heart & Circulation": "❤️",
    "Longevity & Cellular": "⚗️",
    "Hair, Skin & Nails": "✨",
    "Energy & Metabolism": "🔋",
    "Hydration & Electrolytes": "💧",
    "Women's & Men's Health": "👥",
  };
  return map[category] || "🌱";
}
