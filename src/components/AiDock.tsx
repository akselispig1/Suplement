"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/catalog";
import { Product } from "@/types/product";
import ProductImg from "./ProductImg";

type Msg = {
  role: "user" | "assistant";
  content: string;
  recommendations?: { product: Product; reason: string }[];
};

export default function AiDock() {
  const [open, setOpen] = useState(false);
  const { items, total, addItem } = useCart();
  const pathname = usePathname();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide on admin pages
  const hidden = pathname?.startsWith("/admin");

  // Current product (if viewing one) + basket, used as context for the AI.
  const viewing =
    pathname?.startsWith("/products/")
      ? products.find((p) => p.slug === pathname.split("/products/")[1])
      : undefined;

  function buildContext(): string {
    const parts: string[] = [];
    if (viewing) parts.push(`Viewing product: ${viewing.name} — ${viewing.category}, ${viewing.form}, CHF ${viewing.priceCHF.toFixed(2)}. ${viewing.shortDescription}`);
    if (items.length > 0) {
      const list = items.map((i) => `${i.product.name} (CHF ${i.product.priceCHF.toFixed(2)} ×${i.quantity})`).join("; ");
      parts.push(`Basket: ${items.length} item(s), subtotal CHF ${total.toFixed(2)} — ${list}`);
    } else {
      parts.push("Basket: empty");
    }
    return parts.join("\n");
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  const starters = viewing
    ? ["Is this right for my goals?", "What pairs well with this?", "Any cautions I should know?"]
    : items.length > 0
    ? ["Review what's in my basket", "Am I missing anything?", "Is this good value?"]
    : ["Help me find something for energy", "I want better sleep", "What's good for immunity?"];

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, recommendations: data.recommendations }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry — I couldn't answer just now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  if (hidden) return null;

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open the supplement adviser"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center hover:bg-emerald-700 transition-colors"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[380px] h-[min(70vh,560px)] bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
            <span className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 leading-tight">Supplement adviser</p>
              <p className="text-xs text-neutral-500 leading-tight truncate">
                {viewing ? `Looking at ${viewing.name}` : items.length > 0 ? `${items.length} item(s) in your basket` : "Ask me anything about supplements"}
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5">
                Hi! I can help with what you&apos;re looking at or what&apos;s in your basket. Ask away.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-800"}`}>
                    {m.content}
                  </div>
                </div>
                {m.recommendations && m.recommendations.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.recommendations.map((r) => (
                      <div key={r.product.id} className="flex items-center gap-2 border border-neutral-200 rounded-xl p-2">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 overflow-hidden shrink-0">
                          <ProductImg product={r.product} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-neutral-900 line-clamp-1">{r.product.name}</p>
                          <p className="text-[11px] text-neutral-500">CHF {r.product.priceCHF.toFixed(2)}</p>
                        </div>
                        <button onClick={() => addItem(r.product)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 shrink-0">Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl px-4 py-3 flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {starters.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs text-neutral-600 border border-neutral-200 hover:border-emerald-400 hover:text-neutral-900 rounded-full px-2.5 py-1 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-2.5 border-t border-neutral-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a product or your basket…"
              className="field flex-1 rounded-xl px-3 py-2.5 text-sm"
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-3.5 rounded-xl flex items-center justify-center disabled:opacity-50" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
