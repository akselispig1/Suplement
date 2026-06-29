import { EvidenceStrength } from "@/types/product";

const config: Record<EvidenceStrength, { label: string; className: string }> = {
  strong: { label: "Strong Evidence", className: "bg-green-100 text-green-800" },
  moderate: { label: "Moderate Evidence", className: "bg-yellow-100 text-yellow-800" },
  emerging: { label: "Emerging Evidence", className: "bg-blue-100 text-blue-800" },
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
