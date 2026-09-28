"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

type Msg = {
  role: "user" | "assistant";
  content: string;
  recommendations?: { product: Product; reason: string }[];
};

const STARTERS = [
  "I want more energy and better focus at work",
  "Help me sleep better and feel less stressed",
  "I'm vegan and train 4x a week — what should I take?",
  "Something for healthy skin, hair and nails",
];

export default function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your supplement adviser. Tell me what you'd like to improve — your goals, how you train or eat, your age or budget — and I'll suggest a few things that actually fit. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    setError(null);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, recommendations: data.recommendations },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-3xl overflow-hidden flex flex-col" style={{ height: "min(70vh, 640px)" }}>
      {/* header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10">
        <span className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Supplement adviser</p>
          <p className="text-xs text-[var(--muted)] leading-tight">Chat about your goals — recommendations appear inline</p>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-500 text-[#04140e] font-medium"
                    : "bg-white/[0.05] border border-white/10 text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
            {m.recommendations && m.recommendations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {m.recommendations.map((r) => (
                  <ProductCard key={r.product.id} product={r.product} reason={r.reason} />
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div ref={endRef} />
      </div>

      {/* starters */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs text-white/70 border border-white/10 hover:border-emerald-500/40 hover:text-white rounded-full px-3 py-1.5 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="p-3 border-t border-white/10 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          className="field flex-1 rounded-xl px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-4 rounded-xl flex items-center justify-center disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
