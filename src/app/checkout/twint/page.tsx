"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Copy } from "lucide-react";

const TWINT_NUMBER = process.env.NEXT_PUBLIC_TWINT_NUMBER || "+41 77 464 77 58";

function TwintContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const total = params.get("total") || "0.00";
  const name = params.get("name") || "";

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_5%,transparent_70%)]" />
      <div className="glow glow-cyan glow-pulse w-96 h-96 -top-32 left-1/2 -translate-x-1/2" />
      <div className="relative max-w-md w-full fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_30px_-4px_rgba(16,185,129,0.8)]">
            <span className="text-[#04120f] font-black text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Pay with TWINT</h1>
          <p className="text-[var(--muted)] mt-1">Your order is reserved — send payment to confirm</p>
        </div>

        {/* Order summary card */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <div>
              <p className="eyebrow text-white/40 mb-1">Order</p>
              <p className="font-mono font-bold text-white text-sm">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="eyebrow text-white/40 mb-1">Amount</p>
              <p className="text-2xl font-black gradient-text">CHF {parseFloat(total).toFixed(2)}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-5">
            <Step number={1}>
              Open the <strong className="text-white">TWINT app</strong> on your phone
            </Step>
            <Step number={2}>
              <span>Send </span>
              <strong className="text-white">CHF {parseFloat(total).toFixed(2)}</strong>
              <span> to this number:</span>
              <button
                onClick={() => copy(TWINT_NUMBER)}
                className="mt-2 flex items-center gap-2 w-full glass glass-hover rounded-xl px-4 py-3 text-emerald-300 font-bold text-lg"
              >
                <span className="flex-1 text-left">{TWINT_NUMBER}</span>
                <Copy className="w-4 h-4 shrink-0" />
              </button>
            </Step>
            <Step number={3}>
              In the message / reference field, write <strong className="text-white">your name</strong> so we can match your payment:
              <button
                onClick={() => copy(name)}
                className="mt-2 flex items-center gap-2 w-full glass glass-hover rounded-xl px-4 py-3 text-white font-semibold"
              >
                <span className="flex-1 text-left">{name || "Your full name"}</span>
                <Copy className="w-4 h-4 shrink-0 text-white/40" />
              </button>
            </Step>
            <Step number={4}>
              <span>That&apos;s it! We&apos;ll confirm your order and ship it once we receive payment.</span>
            </Step>
          </div>
        </div>

        {/* Confirmation note */}
        <div className="glass rounded-2xl p-4 flex gap-3 mb-6 !border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-200/90">
            You&apos;ll receive a confirmation email once your payment is verified and your order is on its way.
          </p>
        </div>

        <div className="text-center">
          <Link href="/products" className="text-sm text-[var(--muted)] hover:text-white transition-colors">
            Continue shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-[#04120f] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div className="text-sm text-[var(--muted)] leading-relaxed">{children}</div>
    </div>
  );
}

export default function TwintPage() {
  return (
    <Suspense>
      <TwintContent />
    </Suspense>
  );
}
