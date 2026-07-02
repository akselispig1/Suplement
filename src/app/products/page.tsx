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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glow glow-emerald w-80 h-80 -top-32 right-0 opacity-20" />
      <div className="relative mb-8">
        <div className="eyebrow text-emerald-400 mb-3">Catalog</div>
        <h1 className="text-4xl font-bold text-white mb-4">All Products</h1>
        <EvidenceLegend />
      </div>

      {/* Search + filter bar */}
      <div className="relative flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="field w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters ? "btn-primary" : "btn-ghost"}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="relative glass rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-5 fade-up">
          <FilterGroup label="Category">
            {ALL_CATEGORIES.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>{c}</FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Goal">
            {ALL_GOALS.map((g) => (
              <FilterChip key={g} active={goal === g} onClick={() => setGoal(goal === g ? null : g)} className="capitalize">{g}</FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Evidence">
            {(["strong", "moderate", "emerging"] as EvidenceStrength[]).map((e) => (
              <FilterChip key={e} active={evidence === e} onClick={() => setEvidence(evidence === e ? null : e)} className="capitalize">{e}</FilterChip>
            ))}
          </FilterGroup>
        </div>
      )}

      <p className="relative text-sm text-white/40 mb-4 font-mono">{filtered.length} products</p>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg font-medium">No products found</p>
          <button onClick={clearFilters} className="mt-3 text-emerald-400 hover:underline text-sm">Clear filters</button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block eyebrow text-white/40 mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children, className = "" }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${className} ${
        active ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#04120f]" : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
