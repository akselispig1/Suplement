import { EvidenceStrength } from "@/types/product";

const config: Record<EvidenceStrength, { label: string; className: string }> = {
  strong: { label: "Strong Evidence", className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" },
  moderate: { label: "Moderate Evidence", className: "bg-amber-500/15 text-amber-300 border border-amber-500/25" },
  emerging: { label: "Emerging Evidence", className: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25" },
};

export default function EvidenceBadge({ strength }: { strength: EvidenceStrength }) {
  const { label, className } = config[strength];
  return (
    <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full ${className}`}>
      {strength === "strong" ? "★★★" : strength === "moderate" ? "★★" : "★"}
    </span>
  );
}

export function EvidenceLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {(["strong", "moderate", "emerging"] as EvidenceStrength[]).map((s) => (
        <span key={s} className={`px-2 py-1 rounded-full font-medium ${config[s].className}`}>
          {s === "strong" ? "★★★" : s === "moderate" ? "★★" : "★"} {config[s].label}
        </span>
      ))}
    </div>
  );
}
