"use client";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Logo from "./Logo";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0c10]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Logo />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted)]">
          <Link href="/products" className="hover:text-white transition-colors">Shop</Link>
          <Link href="/survey" className="hover:text-white transition-colors">Find My Stack</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 text-[var(--muted)] hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-[#04140e] text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-[var(--muted)] hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0c10]/95 px-4 py-4 space-y-3 text-sm font-medium text-[var(--muted)]">
          <Link href="/products" className="block hover:text-white" onClick={() => setOpen(false)}>Shop All</Link>
          <Link href="/survey" className="block hover:text-white" onClick={() => setOpen(false)}>Find My Stack</Link>
          <Link href="/about" className="block hover:text-white" onClick={() => setOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
}
