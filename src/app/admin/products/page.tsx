"use client";
import { useEffect, useState, useRef } from "react";
import { Product, EvidenceStrength, ProductForm } from "@/types/product";
import { Plus, Pencil, Trash2, X, Check, Upload, RefreshCw, Search, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  "Vitamins","Minerals","Protein & Amino Acids","Performance & Pre-Workout",
  "Omega & Essential Fats","Gut Health","Sleep & Relaxation","Stress & Adaptogens",
  "Focus & Nootropics","Joint & Mobility","Immune Support","Greens & Superfoods",
  "Heart & Circulation","Longevity & Cellular","Hair, Skin & Nails",
  "Energy & Metabolism","Hydration & Electrolytes","Women's & Men's Health",
];
const FORMS: ProductForm[] = ["capsule","tablet","softgel","powder","gummy","liquid"];
const EVIDENCE: EvidenceStrength[] = ["strong","moderate","emerging"];
const GOALS = ["energy","sleep","muscle","immune","focus","joints","gut","stress","endurance","general-health","heart","longevity","skin","hormones","hydration"];

const EMPTY: Partial<Product> = {
  name: "", brandLabel: "SuppStack", category: "Vitamins", goals: [],
  shortDescription: "", longDescription: "", form: "capsule",
  servingSize: "", servingsPerContainer: 30, priceCHF: 0,
  evidenceStrength: "moderate", bestFor: [], pairsWith: [], cautions: "", inStock: true, imageUrl: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string>("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const method = isNew ? "POST" : "PATCH";
    const body = isNew ? editing : { id: editing.id, ...editing };
    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await load();
      setEditing(null);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteId(null);
    load();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    setUploadingId(uploadTarget);
    const slug = editing?.slug || uploadTarget;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.imageUrl) {
      setEditing((prev) => prev ? { ...prev, imageUrl: data.imageUrl } : prev);
      // Also persist immediately if editing existing product
      if (!isNew && editing?.id) {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, imageUrl: data.imageUrl }),
        });
        load();
      }
    }
    setUploadingId(null);
    e.target.value = "";
  }

  function toggleGoal(goal: string) {
    setEditing((prev) => {
      if (!prev) return prev;
      const goals = prev.goals ?? [];
      return { ...prev, goals: goals.includes(goal) ? goals.filter((g) => g !== goal) : [...goals, goal] };
    });
  }

  if (loading) return <div className="p-10 text-center text-white/40">Loading products…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Product Manager</h1>
          <p className="text-white/50 text-sm mt-1">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-4 py-2 border border-white/10 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur">
            <Package className="w-4 h-4" /> Orders
          </Link>
          <button onClick={load} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-4 py-2 border border-white/10 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or category…"
          className="w-full pl-9 pr-4 py-2.5 border border-white/10 rounded-xl text-sm bg-white/[0.03] border border-white/10 backdrop-blur focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] border border-white/10 backdrop-blur/5 text-white/50 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Price (CHF)</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Evidence</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.03] border border-white/10 backdrop-blur/5/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 overflow-hidden flex items-center justify-center shrink-0">
                      {p.imageUrl && p.imageUrl.startsWith("/images") ? (
                        <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="object-cover w-full h-full" onError={() => {}} />
                      ) : (
                        <span className="text-lg">{getCategoryEmoji(p.category)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{p.name}</div>
                      <div className="text-xs text-white/40">{p.id} · {p.form}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/60">{p.category}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">{p.priceCHF.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${p.inStock ? "bg-green-500" : "bg-red-400"}`} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-xs">{p.evidenceStrength === "strong" ? "★★★" : p.evidenceStrength === "moderate" ? "★★" : "★"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditing({ ...p }); setIsNew(false); }}
                      className="p-1.5 text-white/40 hover:text-green-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="p-1.5 text-white/40 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-white/40">No products found</div>
        )}
      </div>

      {/* Edit / Add Drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setEditing(null)} />
          <div className="w-full max-w-xl bg-white/[0.03] border border-white/10 backdrop-blur shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">{isNew ? "Add Product" : "Edit Product"}</h2>
              <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white/60">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 space-y-5">
              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-green-50 overflow-hidden flex items-center justify-center border border-white/10">
                    {editing.imageUrl && editing.imageUrl.startsWith("/images") ? (
                      <Image src={editing.imageUrl} alt={editing.name ?? ""} width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-3xl">{getCategoryEmoji(editing.category ?? "")}</span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleUpload} />
                    <button
                      onClick={() => { setUploadTarget(editing.slug || editing.id || "new"); fileRef.current?.click(); }}
                      disabled={uploadingId !== null}
                      className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.03] border border-white/10 backdrop-blur/5"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingId ? "Uploading…" : "Upload photo"}
                    </button>
                    {editing.imageUrl && (
                      <p className="text-xs text-white/40 mt-1 truncate max-w-48">{editing.imageUrl}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <Field label="Name *">
                <input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} />
              </Field>

              {/* Category */}
              <Field label="Category">
                <select value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (CHF) *">
                  <input type="number" step="0.01" min="0" value={editing.priceCHF ?? ""} onChange={(e) => setEditing({ ...editing, priceCHF: parseFloat(e.target.value) })} className={inputCls} />
                </Field>
                <Field label="Compare-at Price (CHF)">
                  <input type="number" step="0.01" min="0" value={editing.compareAtPriceCHF ?? ""} onChange={(e) => setEditing({ ...editing, compareAtPriceCHF: e.target.value ? parseFloat(e.target.value) : undefined })} className={inputCls} />
                </Field>
              </div>

              {/* Form + Serving */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Form">
                  <select value={editing.form ?? "capsule"} onChange={(e) => setEditing({ ...editing, form: e.target.value as ProductForm })} className={inputCls}>
                    {FORMS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Evidence">
                  <select value={editing.evidenceStrength ?? "moderate"} onChange={(e) => setEditing({ ...editing, evidenceStrength: e.target.value as EvidenceStrength })} className={inputCls}>
                    {EVIDENCE.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Serving Size">
                  <input value={editing.servingSize ?? ""} onChange={(e) => setEditing({ ...editing, servingSize: e.target.value })} className={inputCls} placeholder="e.g. 2 capsules" />
                </Field>
                <Field label="Servings/Container">
                  <input type="number" min="1" value={editing.servingsPerContainer ?? 30} onChange={(e) => setEditing({ ...editing, servingsPerContainer: parseInt(e.target.value) })} className={inputCls} />
                </Field>
              </div>

              {/* Short description */}
              <Field label="Short Description">
                <input value={editing.shortDescription ?? ""} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} className={inputCls} placeholder="One sentence" />
              </Field>

              {/* Long description */}
              <Field label="Long Description">
                <textarea rows={3} value={editing.longDescription ?? ""} onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} className={`${inputCls} resize-none`} />
              </Field>

              {/* Cautions */}
              <Field label="Cautions">
                <input value={editing.cautions ?? ""} onChange={(e) => setEditing({ ...editing, cautions: e.target.value })} className={inputCls} placeholder="e.g. Consult a doctor if pregnant" />
              </Field>

              {/* Goals */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Goals</label>
                <div className="flex flex-wrap gap-1.5">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                        (editing.goals ?? []).includes(g)
                          ? "bg-green-600 text-white"
                          : "bg-white/[0.03] border border-white/10 backdrop-blur/10 text-white/60 hover:bg-white/[0.03] border border-white/10 backdrop-blur/10"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, inStock: !editing.inStock })}
                  className={`w-10 h-6 rounded-full transition-colors ${editing.inStock ? "bg-green-500" : "bg-white/[0.03] border border-white/10 backdrop-blur/10"} relative`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white/[0.03] border border-white/10 backdrop-blur rounded-full shadow transition-transform ${editing.inStock ? "translate-x-5" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-medium text-white/80">In Stock</span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 border border-white/10 text-white/60 py-2.5 rounded-xl text-sm font-medium hover:bg-white/[0.03] border border-white/10 backdrop-blur/5">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.name || !editing.priceCHF}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving…" : isNew ? "Add Product" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-white mb-2">Delete product?</h3>
            <p className="text-white/50 text-sm mb-5">This cannot be undone. The product will be removed from the store.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-white/10 text-white/60 py-2.5 rounded-xl text-sm font-medium hover:bg-white/[0.03] border border-white/10 backdrop-blur/5">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/[0.03] border border-white/10 backdrop-blur";

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    "Vitamins": "💊","Minerals": "🪨","Protein & Amino Acids": "💪",
    "Performance & Pre-Workout": "⚡","Omega & Essential Fats": "🐟",
    "Gut Health": "🦠","Sleep & Relaxation": "🌙","Stress & Adaptogens": "🌿",
    "Focus & Nootropics": "🧠","Joint & Mobility": "🦴","Immune Support": "🛡️",
    "Greens & Superfoods": "🥦","Heart & Circulation": "❤️","Longevity & Cellular": "⚗️",
    "Hair, Skin & Nails": "✨","Energy & Metabolism": "🔋",
    "Hydration & Electrolytes": "💧","Women's & Men's Health": "👥",
  };
  return map[category] || "🌱";
}
