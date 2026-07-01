import { Leaf, Sparkles, Package, ShieldCheck, FlaskConical, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About — SuppStack",
  description: "Science-backed supplements, AI-powered recommendations, shipped as one package.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-8 h-8 text-green-700" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About SuppStack</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          We believe getting the right supplements should be simple, honest, and backed by real science — not marketing hype.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-green-50 rounded-3xl p-8 md:p-12 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our mission</h2>
        <p className="text-gray-600 text-lg leading-relaxed mb-4">
          The supplement industry is noisy. Thousands of products, exaggerated claims, and confusing labels make it hard to know what actually works. SuppStack cuts through that.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed">
          We curate a catalog of 200+ evidence-rated supplements, let AI match them to your goals, and ship everything you need in a single package. No subscriptions, no dark patterns — just the right products for you.
        </p>
      </div>

      {/* What makes us different */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What makes us different</h2>
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
            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog categories */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What we carry</h2>
        <p className="text-gray-500 mb-6">200+ products across 18 categories — from the everyday essentials to the cutting-edge.</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Vitamins", "Minerals", "Protein & Amino Acids", "Performance & Pre-Workout",
            "Omega & Essential Fats", "Gut Health", "Sleep & Relaxation", "Stress & Adaptogens",
            "Focus & Nootropics", "Joint & Mobility", "Immune Support", "Greens & Superfoods",
            "Heart & Circulation", "Longevity & Cellular", "Hair, Skin & Nails",
            "Energy & Metabolism", "Hydration & Electrolytes", "Women's & Men's Health",
          ].map((cat) => (
            <span key={cat} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-900 rounded-3xl p-8 md:p-12 mb-12 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold">Our commitments</h2>
        </div>
        <ul className="space-y-4 text-gray-300">
          {[
            "We never recommend products we wouldn't take ourselves.",
            "We label evidence strength honestly — including when research is still emerging.",
            "We show cautions and contraindications for every product, no exceptions.",
            "We make no disease or treatment claims. Supplements support health; they don't replace medicine.",
            "We never use subscription traps, auto-renewals, or hidden fees.",
            "Everything ships as one package — we handle the logistics so you don't have to.",
          ].map((c) => (
            <li key={c} className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5 shrink-0">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to build your stack?</h2>
        <p className="text-gray-500 mb-6">Use AI to get personalised suggestions, or browse the full catalog yourself.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/#ai-recommend" className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors">
            <Sparkles className="w-5 h-5" /> Ask AI
          </Link>
          <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
