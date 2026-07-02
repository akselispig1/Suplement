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
    <div className={`group relative glass glass-hover rounded-2xl overflow-hidden flex flex-col ${selected ? "!border-emerald-500/70 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]" : ""}`}>
      <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col">
        <div className="relative h-44 flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
            {getCategoryEmoji(product.category)}
          </div>
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-snug">{product.name}</h3>
            <EvidenceBadge strength={product.evidenceStrength} />
          </div>
          <p className="text-xs text-[var(--muted)] line-clamp-2">{product.shortDescription}</p>
          {reason && (
            <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1.5 leading-relaxed">{reason}</p>
          )}
          <div className="mt-auto pt-2 flex items-center justify-between">
            <div>
              <span className="font-bold text-white">CHF {product.priceCHF.toFixed(2)}</span>
              {product.compareAtPriceCHF && (
                <span className="ml-2 text-xs text-white/30 line-through">CHF {product.compareAtPriceCHF.toFixed(2)}</span>
              )}
            </div>
            <span className="text-xs text-white/40 font-mono">{product.form}</span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex gap-2">
        {showSelect ? (
          <button
            onClick={onToggleSelect}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${selected ? "btn-primary" : "btn-ghost"}`}
          >
            {selected ? <><Check className="w-3.5 h-3.5" /> Selected</> : <><Plus className="w-3.5 h-3.5" /> Select</>}
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              !product.inStock ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5" : "btn-primary"
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
