"use client";
import { products } from "@/data/catalog";
import { notFound } from "next/navigation";
import EvidenceBadge from "@/components/EvidenceBadge";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";
import { useState, use } from "react";
import ProductImg from "@/components/ProductImg";

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
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
      <div className="glow glow-emerald w-80 h-80 -top-32 -left-20 opacity-20" />
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="relative rounded-3xl h-80 overflow-hidden glass">
          <ProductImg product={p_} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-white/60 glass px-2.5 py-1 rounded-full">{p_.category}</span>
            <EvidenceBadge strength={p_.evidenceStrength} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{p_.name}</h1>
          <p className="text-[var(--muted)] mb-5 leading-relaxed">{p_.longDescription}</p>

          <div className="grid grid-cols-2 gap-3 text-sm mb-5">
            {[
              { label: "Form", value: p_.form, cap: true },
              { label: "Serving", value: p_.servingSize },
              { label: "Servings", value: `${p_.servingsPerContainer} per container` },
              { label: "Brand", value: p_.brandLabel },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-3">
                <div className="eyebrow text-white/40 mb-1">{s.label}</div>
                <div className={`font-medium text-white ${s.cap ? "capitalize" : ""}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-white">CHF {p_.priceCHF.toFixed(2)}</span>
            {p_.compareAtPriceCHF && (
              <span className="text-lg text-white/30 line-through">CHF {p_.compareAtPriceCHF.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!p_.inStock}
            className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold transition-all mb-4 ${
              !p_.inStock ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5" : "btn-primary"
            }`}
          >
            {added ? <><Check className="w-5 h-5" /> Added to Cart</> : <><ShoppingCart className="w-5 h-5" /> {p_.inStock ? "Add to Cart" : "Out of Stock"}</>}
          </button>

          {p_.cautions && (
            <div className="flex items-start gap-2 text-xs text-amber-300 glass !border-amber-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{p_.cautions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      {p_.bestFor.length > 0 && (
        <div className="relative mb-10">
          <h2 className="text-xl font-bold text-white mb-3">Best for</h2>
          <div className="flex flex-wrap gap-2">
            {p_.bestFor.map((g) => (
              <span key={g} className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-3 py-1 rounded-full text-sm font-medium capitalize">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Pairs with */}
      {pairs.length > 0 && (
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-4">Pairs well with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {pairs.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
