"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/data/catalog";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";

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

export default function SurveyPage() {
  const router = useRouter();
  const { addItem, items } = useCart();
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
      next.has(id) ? next.delete(id) : next.add(id);
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
  const progressPct = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Step {stepIdx + 1} of {steps.length}</span>
          <span className="capitalize">{step}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Goals */}
      {step === "goals" && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">What are your goals?</h1>
          <p className="text-gray-500 mb-8">Select all that apply. You can skip any step.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedGoals.includes(g.id)
                    ? "border-green-500 bg-green-50 text-green-900"
                    : "border-gray-100 bg-white text-gray-700 hover:border-gray-200"
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="font-medium text-sm">{g.label}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("browse")} className="text-sm text-gray-400 hover:text-gray-600">Skip</button>
            <button onClick={() => setStep("preferences")} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preferences */}
      {step === "preferences" && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your preferences</h1>
          <p className="text-gray-500 mb-8">These help us filter the right products for you.</p>
          <div className="space-y-6 mb-8">
            <div>
              <p className="font-semibold text-gray-800 mb-3">Are you vegan?</p>
              <div className="flex gap-3">
                {[{ val: true, label: "Yes" }, { val: false, label: "No" }, { val: null, label: "No preference" }].map(({ val, label }) => (
                  <button
                    key={label}
                    onClick={() => setVegan(val)}
                    className={`px-4 py-2 rounded-xl border font-medium text-sm transition-colors ${vegan === val ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-3">Preferred form</p>
              <div className="flex flex-wrap gap-2">
                {FORM_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormPref(f)}
                    className={`px-4 py-2 rounded-xl border font-medium text-sm capitalize transition-colors ${formPref === f ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-3">Budget per product (CHF)</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`px-4 py-2 rounded-xl border font-medium text-sm transition-colors ${budget === b ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep("goals")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setStep("browse")} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700">
              See Products <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Browse */}
      {step === "browse" && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose your products</h1>
          <p className="text-gray-500 mb-6">{relevantProducts.length} products matched. Select the ones you want.</p>
          {Object.entries(byCategory).map(([cat, prods]) => (
            <div key={cat} className="mb-10">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{cat}</h2>
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
            <p className="text-gray-400 py-12 text-center">No products match your filters. <button className="text-green-600 underline" onClick={() => { setFormPref("any"); setBudget("no limit"); setVegan(null); }}>Reset preferences</button></p>
          )}
          <div className="flex justify-between items-center mt-6">
            <button onClick={() => setStep("preferences")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep("summary")}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
              disabled={selectedProducts.size === 0}
            >
              Review ({selectedProducts.size}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      {step === "summary" && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your stack</h1>
          <p className="text-gray-500 mb-6">{selectedProducts.size} products selected. Ready to add to cart?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {products
              .filter((p) => selectedProducts.has(p.id))
              .map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Estimated total</span>
              <span className="text-xl font-bold text-gray-900">
                CHF {products.filter((p) => selectedProducts.has(p.id)).reduce((s, p) => s + p.priceCHF, 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("browse")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-4 py-3 border border-gray-200 rounded-xl">
              <ChevronLeft className="w-4 h-4" /> Edit
            </button>
            <button onClick={addSelectedToCart} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">
              <ShoppingCart className="w-5 h-5" /> Add All to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
