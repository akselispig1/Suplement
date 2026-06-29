"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Find your perfect supplement stack</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">
          Shop Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {getCategoryEmoji(product.category)}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="font-semibold text-gray-900 hover:text-green-700 text-sm line-clamp-1">{product.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{product.form} · {product.servingSize}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">CHF {(product.priceCHF * quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQty(product.id, quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => updateQty(product.id, quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => removeItem(product.id)} className="ml-1 p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{product.name} ×{quantity}</span>
                  <span>CHF {(product.priceCHF * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900 mb-2">
              <span>Total</span>
              <span>CHF {total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">Free shipping · Everything in one package</p>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
              {loading ? "Redirecting…" : "Checkout with Stripe"}
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">Secured by Stripe · Test mode</p>
          </div>
        </div>
      </div>
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
