"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductImg from "@/components/ProductImg";
import { Product } from "@/types/product";
import { shippingFor, SHIPPING_FEE_CHF, FREE_SHIPPING_OVER_CHF } from "@/lib/shipping";

type StockIssue = { productId: string; productName: string; reason: string; replacements: Product[] };

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart, addItem } = useCart();
  const shipping = shippingFor(total);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockIssues, setStockIssues] = useState<StockIssue[] | null>(null);
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

  function swapReplacement(oldId: string, replacement: Product) {
    removeItem(oldId);
    addItem(replacement);
    setStockIssues((prev) => {
      const next = (prev ?? []).filter((iss) => iss.productId !== oldId);
      return next.length ? next : null;
    });
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStockIssues(null);
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
      if (res.status === 409 && data.issues) {
        setStockIssues(data.issues);
        setLoading(false);
        return;
      }
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
        <ShoppingBag className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h1>
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
      <h1 className="relative text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>

      <form onSubmit={handleCheckout} className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: items + delivery details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items */}
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="glass rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0">
                    <ProductImg product={product} className="w-full h-full object-contain p-1.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug}`} className="font-semibold text-neutral-900 hover:text-emerald-600 text-sm line-clamp-1 transition-colors">{product.name}</Link>
                    <p className="text-xs text-neutral-400 mt-0.5 font-mono">{product.form} · {product.servingSize}</p>
                    <p className="text-sm font-bold text-neutral-900 mt-1">CHF {(product.priceCHF * quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => updateQty(product.id, quantity - 1)} className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center transition-colors text-neutral-900">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-neutral-900">{quantity}</span>
                    <button type="button" onClick={() => updateQty(product.id, quantity + 1)} className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center transition-colors text-neutral-900">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => removeItem(product.id)} className="ml-1 p-1.5 text-neutral-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <button type="button" onClick={clearCart} className="text-xs text-neutral-400 hover:text-red-400 transition-colors">Clear all</button>
              </div>
            </div>

            {/* Delivery details */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-neutral-900 mb-4">Delivery details</h2>
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
              <h2 className="font-bold text-neutral-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-[var(--muted)]">
                    <span className="line-clamp-1 flex-1 mr-2">{product.name} ×{quantity}</span>
                    <span className="text-neutral-700">CHF {(product.priceCHF * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-4 space-y-2 mb-2 text-sm">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Subtotal</span>
                  <span className="text-neutral-700">CHF {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-emerald-600 font-medium" : "text-neutral-700"}>
                    {shipping === 0 ? "FREE" : `CHF ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-neutral-200">
                  <span className="text-neutral-900">Total</span>
                  <span className="gradient-text text-lg">CHF {(total + shipping).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mb-5">
                {shipping === 0
                  ? `Includes free shipping (orders over CHF ${FREE_SHIPPING_OVER_CHF}).`
                  : `Total includes CHF ${SHIPPING_FEE_CHF.toFixed(2)} shipping. Free over CHF ${FREE_SHIPPING_OVER_CHF} — add CHF ${(FREE_SHIPPING_OVER_CHF - total).toFixed(2)} more to qualify.`}
              </p>

              {/* TWINT badge */}
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-[#04120f] font-black text-xs">T</span>
                </div>
                <span className="text-sm text-neutral-900 font-medium">Pay with TWINT</span>
              </div>

              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

              {stockIssues && stockIssues.length > 0 && (
                <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Some items aren&apos;t available
                  </p>
                  <p className="text-xs text-amber-200/80 mb-3">We couldn&apos;t source the item(s) below right now. Pick a replacement, or remove it, then place your order again.</p>
                  <div className="space-y-3">
                    {stockIssues.map((iss) => (
                      <div key={iss.productId} className="text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-neutral-700"><span className="line-through text-neutral-400">{iss.productName}</span> — {iss.reason}</span>
                          <button onClick={() => removeItem(iss.productId)} className="text-neutral-500 hover:text-red-400 shrink-0">Remove</button>
                        </div>
                        {iss.replacements.length > 0 && (
                          <div className="mt-1.5 space-y-1">
                            <p className="text-neutral-400">Replace with:</p>
                            {iss.replacements.map((r) => (
                              <button
                                key={r.id}
                                onClick={() => swapReplacement(iss.productId, r)}
                                className="w-full flex items-center justify-between gap-2 rounded-lg border border-neutral-200 hover:border-emerald-500/50 bg-neutral-50 px-2.5 py-1.5 text-left transition-colors"
                              >
                                <span className="text-neutral-700 line-clamp-1">{r.name}</span>
                                <span className="text-emerald-600 font-medium shrink-0">CHF {r.priceCHF.toFixed(2)} →</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin w-4 h-4 border-2 border-[#04120f] border-t-transparent rounded-full" /> : null}
                {loading ? "Processing…" : "Place Order →"}
              </button>
              <p className="text-xs text-center text-neutral-400 mt-3">You&apos;ll get TWINT payment instructions next</p>
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
      <label className="block text-xs font-semibold text-neutral-500 mb-1">{label}{required && <span className="text-emerald-600 ml-0.5">*</span>}</label>
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
