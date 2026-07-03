"use client";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { CheckCircle, Package } from "lucide-react";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-24 text-center overflow-hidden">
      <div className="glow glow-emerald glow-pulse w-96 h-96 -top-20 left-1/2 -translate-x-1/2 opacity-30" />
      <div className="relative fade-up">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_40px_-4px_rgba(16,185,129,0.8)]">
          <CheckCircle className="w-10 h-10 text-[#04120f]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Order confirmed!</h1>
        <p className="text-[var(--muted)] mb-2">Thank you for your order. You&apos;ll receive a confirmation email shortly.</p>
        <p className="text-[var(--muted)] mb-8 flex items-center justify-center gap-2">
          <Package className="w-4 h-4 text-emerald-400" />
          Everything will ship in one package.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3 rounded-xl">
            Back to Home
          </Link>
          <Link href="/products" className="btn-ghost px-6 py-3 rounded-xl font-semibold">
            Keep Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
