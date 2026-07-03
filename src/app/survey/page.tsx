"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/data/catalog";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, ChevronLeft, ShoppingCart, Check } from "lucide-react";

type Step = "goals" | "preferences" | "browse" | "summary";

const GOAL_OPTIONS = [
  { id: "energy", label: "More energy", emoji: "⚡" },
  { id: "sleep", label: "Better sleep", emoji: "🌙" },
  { id: "muscle", label: "Build muscle", emoji: "💪" },
  { id: "focus", label: "Sharper focus", emoji: "🧠" },
  { id: "stress", label: "Less stress", emoji: "🌿" },
  { id: "immune", label: "Immune support", emoji: "🛡️" },
  { id: "gut", label: "Gut health", emoji: "🦠" },
  { id: "joints", label: "Joint support", emoji: "🦴" },
  { id: "heart", label: "Heart health", emoji: "❤️" },
  { id: "longevity", label: "Longevity", emoji: "⚗️" },
  { id: "skin", label: "Skin & hair", emoji: "✨" },
  { id: "endurance", label: "Endurance", emoji: "🏃" },
];

const FORM_OPTIONS = ["capsule", "tablet", "powder", "softgel", "gummy", "any"];
const BUDGET_OPTIONS = ["under 30", "30–60", "60+", "no limit"];

const STEP_LABELS: Record<Step, string> = {
  goals: "Goals",
  preferences: "Preferences",
  browse: "Your matches",
  summary: "Review",
};

export default function SurveyPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [step, setStep] = useState<Step>("goals");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [vegan, setVegan] = useState<boolean | null>(null);
  const [formPref, setFormPref] = useState<string>("any");
  const [budget, setBudget] = useState<string>("no limit");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const relevantProducts = products.filter((p) => {
    if (selectedGoals.length > 0 && !p.goals.some((g) => selectedGoals.includes(g))) return false;
    if (vegan === true && ["softgel", "gummy"].includes(p.form)) return false;
    if (formPref !== "any" && p.form !== formPref) return false;
    if (budget === "under 30" && p.priceCHF >= 30) return false;
    if (budget === "30–60" && (p.priceCHF < 30 || p.priceCHF > 60)) return false;
    if (budget === "60+" && p.priceCHF < 60) return false;
    return true;
  });

  const byCategory = relevantProducts.reduce((acc: Record<string, Product[]>, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  function toggleGoal(id: string) {
    setSelectedGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  }

  function toggleProduct(id: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function addSelectedToCart() {
    const toAdd = products.filter((p) => selectedProducts.has(p.id) && p.inStock);
    toAdd.forEach((p) => addItem(p));
    router.push("/cart");
  }

  const steps: Step[] = ["goals", "preferences", "browse", "summary"];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_top,black_5%,transparent_60%)]" />
      <div className="glow glow-emerald w-96 h-96 -top-40 -left-20 opacity-30" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    i < stepIdx ? "bg-gradient-to-br from-emerald-400 to-cyan-400 text-[#04120f]"
                    : i === stepIdx ? "glass !border-emerald-500/60 text-emerald-300"
                    : "glass text-white/30"
                  }`}>
                    {i < stepIdx ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === stepIdx ? "text-white" : "text-white/40"}`}>{STEP_LABELS[s]}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${i < stepIdx ? "bg-emerald-500/50" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        {step === "goals" && (
          <div className="fade-up">
            <div className="eyebrow text-emerald-400 mb-3">Step 1</div>
            <h1 className="text-4xl font-bold text-white mb-2">What are your goals?</h1>
            <p className="text-[var(--muted)] mb-8">Select all that apply — we&apos;ll match products to each one.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {GOAL_OPTIONS.map((g) => {
                const on = selectedGoals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`group flex items-center gap-3 p-4 rounded-2xl text-left transition-all glass glass-hover ${
                      on ? "!border-emerald-500/70 !bg-emerald-500/10" : ""
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{g.emoji}</span>
                    <span className={`font-medium text-sm ${on ? "text-emerald-200" : "text-white/80"}`}>{g.label}</span>
                    {on && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <button onClick={() => setStep("browse")} className="text-sm text-white/40 hover:text-white transition-colors">Skip →</button>
              <button onClick={() => setStep("preferences")} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Preferences */}
        {step === "preferences" && (
          <div className="fade-up">
            <div className="eyebrow text-emerald-400 mb-3">Step 2</div>
            <h1 className="text-4xl font-bold text-white mb-2">Your preferences</h1>
            <p className="text-[var(--muted)] mb-8">These help us narrow down to the right products.</p>
            <div className="space-y-8 mb-8">
              <Pref label="Are you vegan?">
                {[{ val: true, label: "Yes" }, { val: false, label: "No" }, { val: null, label: "No preference" }].map(({ val, label }) => (
                  <Chip key={label} active={vegan === val} onClick={() => setVegan(val)}>{label}</Chip>
                ))}
              </Pref>
              <Pref label="Preferred form">
                {FORM_OPTIONS.map((f) => (
                  <Chip key={f} active={formPref === f} onClick={() => setFormPref(f)} className="capitalize">{f}</Chip>
                ))}
              </Pref>
              <Pref label="Budget per product (CHF)">
                {BUDGET_OPTIONS.map((b) => (
                  <Chip key={b} active={budget === b} onClick={() => setBudget(b)}>{b}</Chip>
                ))}
              </Pref>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep("goals")} className="btn-ghost flex items-center gap-1 text-sm px-4 py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep("browse")} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl">
                See {relevantProducts.length} Matches <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Browse */}
        {step === "browse" && (
          <div className="fade-up">
            <div className="eyebrow text-emerald-400 mb-3">Step 3</div>
            <h1 className="text-4xl font-bold text-white mb-2">Your matches</h1>
            <p className="text-[var(--muted)] mb-6">
              <span className="text-white font-semibold">{relevantProducts.length} products</span> matched
              {selectedGoals.length > 0 && <> your {selectedGoals.length} goal{selectedGoals.length !== 1 ? "s" : ""}</>}. Tap to add them to your stack.
            </p>
            {Object.entries(byCategory).map(([cat, prods]) => (
              <div key={cat} className="mb-10">
                <h2 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {cat}
                  <span className="text-white/30 font-normal font-mono text-xs">({prods.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {prods.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      showSelect
                      selected={selectedProducts.has(p.id)}
                      onToggleSelect={() => toggleProduct(p.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {relevantProducts.length === 0 && (
              <div className="glass rounded-2xl p-10 text-center text-[var(--muted)]">
                No products match your filters.{" "}
                <button className="text-emerald-400 underline" onClick={() => { setFormPref("any"); setBudget("no limit"); setVegan(null); }}>Reset preferences</button>
              </div>
            )}
            <div className="flex justify-between items-center mt-6">
              <button onClick={() => setStep("preferences")} className="btn-ghost flex items-center gap-1 text-sm px-4 py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep("summary")}
                className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl"
                disabled={selectedProducts.size === 0}
              >
                Review ({selectedProducts.size}) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {step === "summary" && (
          <div className="fade-up">
            <div className="eyebrow text-emerald-400 mb-3">Step 4</div>
            <h1 className="text-4xl font-bold text-white mb-2">Your stack</h1>
            <p className="text-[var(--muted)] mb-6">{selectedProducts.size} product{selectedProducts.size !== 1 ? "s" : ""} selected. Ready to add to cart?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {products.filter((p) => selectedProducts.has(p.id)).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="glass rounded-2xl p-6 mb-6 flex justify-between items-center">
              <span className="font-semibold text-white/80">Estimated total</span>
              <span className="text-2xl font-black gradient-text">
                CHF {products.filter((p) => selectedProducts.has(p.id)).reduce((s, p) => s + p.priceCHF, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("browse")} className="btn-ghost flex items-center gap-1 text-sm px-5 py-3 rounded-xl">
                <ChevronLeft className="w-4 h-4" /> Edit
              </button>
              <button onClick={addSelectedToCart} disabled={selectedProducts.size === 0} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl">
                <ShoppingCart className="w-5 h-5" /> Add All to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pref({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-white mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children, className = "" }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${className} ${
        active ? "btn-primary" : "btn-ghost"
      }`}
    >
      {children}
    </button>
  );
}
