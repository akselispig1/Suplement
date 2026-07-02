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
      router.push(`/checkout/twint?orderId=${encodeURIComponent(data.orderId)}&total=${data.totalCHF.toFixed(2)}&name=${encodeURIComponent(form.customerName)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-white/10 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
        <p className="text-[var(--muted)] mb-6">Find your perfect supplement stack</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl">
          Shop Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glow glow-cyan w-72 h-72 -top-24 right-0 opacity-20" />
      <h1 className="relative text-4xl font-bold text-white mb-8">Checkout</h1>

      <form onSubmit={handleCheckout} className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: items + delivery details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items */}
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                    {getCategoryEmoji(product.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug}`} className="font-semibold text-white hover:text-emerald-400 text-sm line-clamp-1 transition-colors">{product.name}</Link>
                    <p className="text-xs text-white/40 mt-0.5 font-mono">{product.form} · {product.servingSize}</p>
                    <p className="text-sm font-bold text-white mt-1">CHF {(product.priceCHF * quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => updateQty(product.id, quantity - 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors text-white">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-white">{quantity}</span>
                    <button type="button" onClick={() => updateQty(product.id, quantity + 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => removeItem(product.id)} className="ml-1 p-1.5 text-white/30 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <button type="button" onClick={clearCart} className="text-xs text-white/40 hover:text-red-400 transition-colors">Clear all</button>
              </div>
            </div>

            {/* Delivery details */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-white mb-4">Delivery details</h2>
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
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-white mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-[var(--muted)]">
                    <span className="line-clamp-1 flex-1 mr-2">{product.name} ×{quantity}</span>
                    <span className="text-white/80">CHF {(product.priceCHF * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between font-bold mb-2">
                <span className="text-white">Total</span>
                <span className="gradient-text text-lg">CHF {total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-white/40 mb-5">Free shipping · Switzerland</p>

              {/* TWINT badge */}
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-[#04120f] font-black text-xs">T</span>
                </div>
                <span className="text-sm text-white font-medium">Pay with TWINT</span>
              </div>

              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin w-4 h-4 border-2 border-[#04120f] border-t-transparent rounded-full" /> : null}
                {loading ? "Processing…" : "Place Order →"}
              </button>
              <p className="text-xs text-center text-white/40 mt-3">You&apos;ll get TWINT payment instructions next</p>
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
      <label className="block text-xs font-semibold text-white/60 mb-1">{label}{required && <span className="text-emerald-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field w-full rounded-xl px-3 py-2.5 text-sm"
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
