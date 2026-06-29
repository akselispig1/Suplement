"use client";
import { useState, useMemo } from "react";
import { products } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import { EvidenceLegend } from "@/components/EvidenceBadge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EvidenceStrength } from "@/types/product";

const ALL_CATEGORIES = [...new Set(products.map((p) => p.category))].sort();
const ALL_GOALS = [...new Set(products.flatMap((p) => p.goals))].sort();

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceStrength | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    if (goal) list = list.filter((p) => p.goals.includes(goal));
    if (evidence) list = list.filter((p) => p.evidenceStrength === evidence);
    return list;
  }, [search, category, goal, evidence]);

  function clearFilters() {
    setSearch("");
    setCategory(null);
    setGoal(null);
    setEvidence(null);
  }

  const hasFilters = search || category || goal || evidence;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <EvidenceLegend />
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(category === c ? null : c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${category === c ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Goal</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(goal === g ? null : g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${goal === g ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evidence</label>
            <div className="flex flex-wrap gap-1.5">
              {(["strong", "moderate", "emerging"] as EvidenceStrength[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEvidence(evidence === e ? null : e)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${evidence === e ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">{filtered.length} products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No products found</p>
          <button onClick={clearFilters} className="mt-3 text-green-600 hover:underline text-sm">Clear filters</button>
        </div>
      )}
    </div>
  );
}
