import { Leaf, Sparkles, Package, ShieldCheck, FlaskConical, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About — SuppStack",
  description: "Science-backed supplements, AI-powered recommendations, shipped as one package.",
};

export default function AboutPage() {
  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
      <div className="glow glow-emerald glow-pulse w-96 h-96 -top-40 left-1/2 -translate-x-1/2 opacity-30" />

      {/* Hero */}
      <div className="relative text-center mb-16 fade-up">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_30px_-4px_rgba(16,185,129,0.7)]">
          <Leaf className="w-8 h-8 text-[#04120f]" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">About <span className="gradient-text">SuppStack</span></h1>
        <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
          Getting the right supplements should be simple, honest, and backed by real science — not marketing hype.
        </p>
      </div>

      {/* Mission */}
      <div className="relative glass rounded-3xl p-8 md:p-12 mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Our mission</h2>
        <p className="text-[var(--muted)] text-lg leading-relaxed mb-4">
          The supplement industry is noisy. Thousands of products, exaggerated claims, and confusing labels make it hard to know what actually works. SuppStack cuts through that.
        </p>
        <p className="text-[var(--muted)] text-lg leading-relaxed">
          We curate a catalog of 200+ evidence-rated supplements, let AI match them to your goals, and ship everything you need in a single package. No subscriptions, no dark patterns — just the right products for you.
        </p>
      </div>

      {/* What makes us different */}
      <div className="relative mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">What makes us different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <FlaskConical className="w-6 h-6" />,
              title: "Evidence ratings on every product",
              text: "Every product carries a ★★★ (strong), ★★ (moderate), or ★ (emerging) badge based on the quality of scientific research behind it. No pseudoscience, no vague promises.",
            },
            {
              icon: <Sparkles className="w-6 h-6" />,
              title: "AI that actually knows the catalog",
              text: "Describe your goals in plain language and our AI — powered by Anthropic — suggests only real products from our catalog. It gives you reasons, not just names, and always recommends the most evidence-backed options first.",
            },
            {
              icon: <Package className="w-6 h-6" />,
              title: "One package, always",
              text: "However many products you order, they ship together in a single package. No fragmented deliveries, no multiple tracking numbers, no unnecessary packaging.",
            },
            {
              icon: <ShieldCheck className="w-6 h-6" />,
              title: "Honest about what we don't know",
              text: "We label emerging research as emerging. We show cautions for every product. Our AI recommendations come with a clear disclaimer: educational suggestions, not medical advice.",
            },
          ].map((item) => (
            <div key={item.title} className="glass glass-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog categories */}
      <div className="relative mb-16">
        <h2 className="text-2xl font-bold text-white mb-4">What we carry</h2>
        <p className="text-[var(--muted)] mb-6">200+ products across 18 categories — from the everyday essentials to the cutting-edge.</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Vitamins", "Minerals", "Protein & Amino Acids", "Performance & Pre-Workout",
            "Omega & Essential Fats", "Gut Health", "Sleep & Relaxation", "Stress & Adaptogens",
            "Focus & Nootropics", "Joint & Mobility", "Immune Support", "Greens & Superfoods",
            "Heart & Circulation", "Longevity & Cellular", "Hair, Skin & Nails",
            "Energy & Metabolism", "Hydration & Electrolytes", "Women's & Men's Health",
          ].map((cat) => (
            <span key={cat} className="glass px-3 py-1.5 rounded-full text-sm font-medium text-white/70">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="relative glass rounded-3xl p-8 md:p-12 mb-12 overflow-hidden">
        <div className="glow glow-cyan w-64 h-64 -bottom-24 -right-16 opacity-30" />
        <div className="relative flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Our commitments</h2>
        </div>
        <ul className="relative space-y-4 text-[var(--muted)]">
          {[
            "We never recommend products we wouldn't take ourselves.",
            "We label evidence strength honestly — including when research is still emerging.",
            "We show cautions and contraindications for every product, no exceptions.",
            "We make no disease or treatment claims. Supplements support health; they don't replace medicine.",
            "We never use subscription traps, auto-renewals, or hidden fees.",
            "Everything ships as one package — we handle the logistics so you don't have to.",
          ].map((c) => (
            <li key={c} className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="relative text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to build your stack?</h2>
        <p className="text-[var(--muted)] mb-6">Use AI to get personalised suggestions, or browse the full catalog yourself.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/#ai-recommend" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl">
            <Sparkles className="w-5 h-5" /> Ask AI
          </Link>
          <Link href="/products" className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
