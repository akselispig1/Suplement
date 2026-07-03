"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, ClipboardList, ShieldCheck, Package, Zap, Cpu } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ product: Product; reason: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRecommend(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get recommendations");
      setResults(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-28">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
        <div className="glow glow-emerald glow-pulse w-[520px] h-[520px] -top-40 left-1/2 -translate-x-1/2" />
        <div className="glow glow-cyan glow-pulse w-[360px] h-[360px] top-20 -right-20" />
        <div className="relative max-w-4xl mx-auto text-center fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm font-medium mb-8 text-emerald-300">
            <Zap className="w-4 h-4" /> 200+ science-backed supplements
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Your perfect stack,<br />
            <span className="gradient-text">engineered by AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your goals and our AI assembles a personalised supplement stack — or take the guided quiz. Everything ships as one package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/survey" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl">
              <ClipboardList className="w-5 h-5" /> Take the Quiz
            </Link>
            <a href="#ai-recommend" className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Ask AI
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
            {["Evidence-rated products", "One package, free shipping", "TWINT checkout", "No subscription traps"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommender */}
      <section id="ai-recommend" className="relative max-w-3xl mx-auto px-4 py-20 scroll-mt-20">
        <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="glow glow-emerald w-64 h-64 -top-24 -left-24 opacity-30" />
          <div className="relative">
            <div className="text-center mb-8">
              <div className="eyebrow text-emerald-400 mb-3 flex items-center justify-center gap-2">
                <Cpu className="w-3.5 h-3.5" /> AI Recommender
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Describe your goals</h2>
              <p className="text-[var(--muted)]">Tell us what you&apos;re trying to achieve. Our AI suggests products from our catalog.</p>
            </div>
            <form onSubmit={handleRecommend} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. better sleep, less stress, more energy at the gym…"
                className="field flex-1 rounded-xl px-4 py-3.5 text-sm"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-primary px-6 py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin w-4 h-4 border-2 border-[#04120f] border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Thinking…" : "Suggest"}
              </button>
            </form>
            {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
          </div>
        </div>
        {results && (
          <div className="mt-8 fade-up">
            <div className="mb-4 glass rounded-lg px-3 py-2 text-xs text-amber-300/90 border-amber-500/20">
              📚 Educational suggestions only — not medical advice. Consult a healthcare professional before starting any supplement.
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{results.length} suggestions for you</h3>
              <AddAllButton results={results} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => (
                <ProductCard key={r.product.id} product={r.product} reason={r.reason} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="eyebrow text-emerald-400 mb-3">Process</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How SuppStack works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Sparkles className="w-6 h-6" />, title: "Discover", text: "Use AI or take the quiz to find products matched to your goals.", n: "01" },
              { icon: <Package className="w-6 h-6" />, title: "Bundle", text: "Add items to your cart — everything ships as one package.", n: "02" },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Done", text: "Fast TWINT checkout, then we handle the rest.", n: "03" },
            ].map((s) => (
              <div key={s.title} className="glass glass-hover rounded-2xl p-6 relative">
                <span className="absolute top-5 right-6 font-mono text-xs text-white/20">{s.n}</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-4">{s.icon}</div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="glow glow-cyan w-72 h-72 -bottom-32 left-1/2 -translate-x-1/2 opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Browse 200+ products</h2>
            <p className="text-[var(--muted)] mb-8">Filter by category, goal, or evidence strength.</p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl">
              Shop All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function AddAllButton({ results }: { results: { product: Product; reason: string }[] }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => results.filter((r) => r.product.inStock).forEach((r) => addItem(r.product))}
      className="btn-primary text-sm px-4 py-2 rounded-lg"
    >
      Add All to Cart
    </button>
  );
}
