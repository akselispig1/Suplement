"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, ClipboardList, ShieldCheck, Package, Zap } from "lucide-react";
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
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> 200+ science-backed supplements
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Your perfect supplement stack,<br />
            <span className="text-green-600">shipped as one package</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Describe your goals and our AI builds your personalised stack — or take the guided quiz to find products yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/survey" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors">
              <ClipboardList className="w-5 h-5" /> Take the Quiz
            </Link>
            <a href="#ai-recommend" className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              <Sparkles className="w-5 h-5 text-green-600" /> Ask AI
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {["Evidence-rated products", "One package, free shipping", "Stripe-secured checkout", "No subscription traps"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" /> {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommender */}
      <section id="ai-recommend" className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Describe your goals</h2>
          <p className="text-gray-500">Tell us what you&apos;re trying to achieve. Our AI will suggest products from our catalog.</p>
        </div>
        <form onSubmit={handleRecommend} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I want better sleep, less stress, and more energy at the gym…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Thinking…" : "Suggest"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
        {results && (
          <div className="mt-8">
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              📚 Educational suggestions only — not medical advice. Consult a healthcare professional before starting any supplement.
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{results.length} suggestions for you</h3>
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
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How SuppStack works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Sparkles className="w-6 h-6" />, title: "1. Discover", text: "Use AI or take the quiz to find products matched to your goals." },
              { icon: <Package className="w-6 h-6" />, title: "2. Bundle", text: "Add items to your cart — everything ships as one package." },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "3. Done", text: "Secure Stripe checkout, then we handle the rest." },
            ].map((s) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Browse 200+ products</h2>
        <p className="text-gray-500 mb-6">Filter by category, goal, or evidence strength.</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
          Shop All <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

function AddAllButton({ results }: { results: { product: Product; reason: string }[] }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => results.filter((r) => r.product.inStock).forEach((r) => addItem(r.product))}
      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
    >
      Add All to Cart
    </button>
  );
}
