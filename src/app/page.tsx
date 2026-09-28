"use client";
import Link from "next/link";
import { ArrowRight, Sparkles, ClipboardList, ShieldCheck, Package, Zap } from "lucide-react";
import AiChat from "@/components/AiChat";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-28">
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
        <div className="glow glow-emerald glow-pulse w-[520px] h-[520px] -top-40 left-1/2 -translate-x-1/2" />
        <div className="relative max-w-4xl mx-auto text-center fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm font-medium mb-8 text-emerald-300">
            <Zap className="w-4 h-4" /> 470+ evidence-rated supplements
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Supplements, matched<br />
            to <span className="gradient-text">your goals</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Chat with our adviser about what you want to improve and get a personalised stack from evidence-rated products — or take the guided quiz. Everything ships as one package.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="#ai-chat" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl">
              <Sparkles className="w-5 h-5" /> Chat with the adviser
            </a>
            <Link href="/survey" className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold">
              <ClipboardList className="w-5 h-5 text-emerald-400" /> Take the Quiz
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
            {["Evidence-rated products", "One package delivery", "TWINT checkout", "No subscription traps"].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat */}
      <section id="ai-chat" className="relative max-w-3xl mx-auto px-4 py-16 scroll-mt-20">
        <div className="text-center mb-8">
          <div className="eyebrow text-emerald-400 mb-3">Ask the adviser</div>
          <h2 className="text-3xl font-bold text-white mb-3">Not sure what to take?</h2>
          <p className="text-[var(--muted)]">Have a conversation about your goals — it&apos;ll ask a few questions and suggest products that fit.</p>
        </div>
        <AiChat />
        <p className="mt-3 text-center text-xs text-white/40">Educational suggestions only — not medical advice. Consult a healthcare professional before starting any supplement.</p>
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
              { icon: <Sparkles className="w-6 h-6" />, title: "Discover", text: "Chat with the adviser or take the quiz to find products matched to your goals.", n: "01" },
              { icon: <Package className="w-6 h-6" />, title: "Bundle", text: "Add items to your cart — everything ships as one package.", n: "02" },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Done", text: "Fast TWINT checkout, then we handle the rest.", n: "03" },
            ].map((s) => (
              <div key={s.title} className="glass glass-hover rounded-2xl p-6 relative">
                <span className="absolute top-5 right-6 font-mono text-xs text-white/20">{s.n}</span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-center mb-4">{s.icon}</div>
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
            <h2 className="text-3xl font-bold text-white mb-3">Browse the full range</h2>
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
