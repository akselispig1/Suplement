"use client";
import { products } from "@/data/catalog";
import { notFound } from "next/navigation";
import EvidenceBadge from "@/components/EvidenceBadge";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";
import { useState, use } from "react";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  // After notFound(), TypeScript needs help knowing product is defined
  const p_ = product!;

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const pairs = products.filter((p) => p_.pairsWith.includes(p.id)).slice(0, 4);

  function handleAdd() {
    addItem(p_);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center h-80">
          <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center text-6xl">
            {getCategoryEmoji(p_.category)}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{p_.category}</span>
            <EvidenceBadge strength={p_.evidenceStrength} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{p_.name}</h1>
          <p className="text-gray-500 mb-5">{p_.longDescription}</p>

          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-0.5">Form</div>
              <div className="font-medium capitalize">{p_.form}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-0.5">Serving</div>
              <div className="font-medium">{p_.servingSize}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-0.5">Servings</div>
              <div className="font-medium">{p_.servingsPerContainer} per container</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-0.5">Brand</div>
              <div className="font-medium">{p_.brandLabel}</div>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">CHF {p_.priceCHF.toFixed(2)}</span>
            {p_.compareAtPriceCHF && (
              <span className="text-lg text-gray-400 line-through">CHF {p_.compareAtPriceCHF.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!p_.inStock}
            className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold transition-colors mb-4 ${
              !p_.inStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : added
                ? "bg-green-600 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {added ? <><Check className="w-5 h-5" /> Added to Cart</> : <><ShoppingCart className="w-5 h-5" /> {p_.inStock ? "Add to Cart" : "Out of Stock"}</>}
          </button>

          {p_.cautions && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{p_.cautions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      {p_.bestFor.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Best for</h2>
          <div className="flex flex-wrap gap-2">
            {p_.bestFor.map((g) => (
              <span key={g} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium capitalize">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Pairs with */}
      {pairs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pairs well with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {pairs.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Vitamins": "💊", "Minerals": "🪨", "Protein & Amino Acids": "💪",
    "Performance & Pre-Workout": "⚡", "Omega & Essential Fats": "🐟",
    "Gut Health": "🦠", "Sleep & Relaxation": "🌙", "Stress & Adaptogens": "🌿",
    "Focus & Nootropics": "🧠", "Joint & Mobility": "🦴", "Immune Support": "🛡️",
    "Greens & Superfoods": "🥦", "Heart & Circulation": "❤️", "Longevity & Cellular": "⚗️",
    "Hair, Skin & Nails": "✨", "Energy & Metabolism": "🔋",
    "Hydration & Electrolytes": "💧", "Women's & Men's Health": "👥",
  };
  return map[category] || "🌱";
}
