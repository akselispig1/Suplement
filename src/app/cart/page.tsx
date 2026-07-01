"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    line1: "",
    city: "",
    postalCode: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          shippingAddress: { line1: form.line1, city: form.city, postalCode: form.postalCode, country: "CH" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clearCart();
      router.push(`/checkout/twint?orderId=${encodeURIComponent(data.orderId)}&total=${data.totalCHF.toFixed(2)}`);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleCheckout}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: items + delivery details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items */}
            <div className="space-y-3">
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
                    <button type="button" onClick={() => updateQty(product.id, quantity - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                    <button type="button" onClick={() => updateQty(product.id, quantity + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => removeItem(product.id)} className="ml-1 p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <button type="button" onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
              </div>
            </div>

            {/* Delivery details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Delivery details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name" required value={form.customerName} onChange={(v) => set("customerName", v)} placeholder="Anna Müller" />
                  <Field label="Email" type="email" required value={form.customerEmail} onChange={(v) => set("customerEmail", v)} placeholder="anna@example.ch" />
                </div>
                <Field label="Street address" required value={form.line1} onChange={(v) => set("line1", v)} placeholder="Bahnhofstrasse 1" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Postcode" required value={form.postalCode} onChange={(v) => set("postalCode", v)} placeholder="8001" />
                  <Field label="City" required value={form.city} onChange={(v) => set("city", v)} placeholder="Zürich" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: order summary */}
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
              <p className="text-xs text-gray-400 mb-5">Free shipping · Switzerland</p>

              {/* TWINT badge */}
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-xs">T</span>
                </div>
                <span className="text-sm text-blue-700 font-medium">Pay with TWINT</span>
              </div>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
                {loading ? "Processing…" : "Place Order →"}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">You&apos;ll get TWINT payment instructions next</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
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
