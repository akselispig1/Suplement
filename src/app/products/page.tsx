"use client";
import { useState, useMemo } from "react";
import { products } from "@/data/catalog";
import ProductCard from "@/components/ProductCard";
import { EvidenceLegend } from "@/components/EvidenceBadge";
import { Search, X, ChevronDown } from "lucide-react";
import { EvidenceStrength } from "@/types/product";

const ALL_CATEGORIES = [...new Set(products.map((p) => p.category))].sort();
const ALL_GOALS = [...new Set(products.flatMap((p) => p.goals))].sort();

const EVIDENCE_RANK: Record<EvidenceStrength, number> = { strong: 0, moderate: 1, emerging: 2 };

type SortKey = "recommended" | "price-asc" | "price-desc" | "name";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [evidence, setEvidence] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");

  const filtered = useMemo(() => {
    let list = [...products];
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

    list.sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.priceCHF - b.priceCHF;
        case "price-desc": return b.priceCHF - a.priceCHF;
        case "name": return a.name.localeCompare(b.name);
        default:
          return EVIDENCE_RANK[a.evidenceStrength] - EVIDENCE_RANK[b.evidenceStrength] || a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [search, category, goal, evidence, sort]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setGoal("");
    setEvidence("");
    setSort("recommended");
  }

  const hasFilters = search || category || goal || evidence || sort !== "recommended";

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glow glow-emerald w-80 h-80 -top-32 right-0 opacity-20" />
      <div className="relative mb-8">
        <div className="eyebrow text-emerald-400 mb-3">Catalog</div>
        <h1 className="text-4xl font-bold text-white mb-4">All Products</h1>
        <EvidenceLegend />
      </div>

      {/* Toolbar: search + sorted dropdowns */}
      <div className="relative glass rounded-2xl p-3 mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="field w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Dropdown label="Category" value={category} onChange={setCategory} options={ALL_CATEGORIES} />
          <Dropdown label="Goal" value={goal} onChange={setGoal} options={ALL_GOALS} capitalize />
          <Dropdown label="Evidence" value={evidence} onChange={setEvidence} options={["strong", "moderate", "emerging"]} capitalize />
          <Dropdown label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)} options={SORTS} noAll />
        </div>
      </div>

      {/* Active filter row */}
      <div className="relative flex items-center gap-3 mb-6 flex-wrap">
        <p className="text-sm text-white/40 font-mono">{filtered.length} products</p>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>

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

function Dropdown({
  label, value, onChange, options, capitalize, noAll,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
  capitalize?: boolean;
  noAll?: boolean;
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const active = value && (!noAll ? true : true);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`field appearance-none rounded-xl pl-3.5 pr-9 py-2.5 text-sm cursor-pointer ${capitalize ? "capitalize" : ""} ${active && value ? "!border-emerald-500/50 text-white" : "text-white/70"}`}
      >
        {!noAll && <option value="">{label}: All</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0b0d12] text-white">
            {noAll ? o.label : o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
    </div>
  );
}
