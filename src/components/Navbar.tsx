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
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Logo />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted)]">
          <Link href="/products" className="hover:text-neutral-900 transition-colors">Shop</Link>
          <Link href="/survey" className="hover:text-neutral-900 transition-colors">Find My Stack</Link>
          <Link href="/about" className="hover:text-neutral-900 transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 text-[var(--muted)] hover:text-neutral-900 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-[#04140e] text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-[var(--muted)] hover:text-neutral-900" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-200 bg-white/90 px-4 py-4 space-y-3 text-sm font-medium text-[var(--muted)]">
          <Link href="/products" className="block hover:text-neutral-900" onClick={() => setOpen(false)}>Shop All</Link>
          <Link href="/survey" className="block hover:text-neutral-900" onClick={() => setOpen(false)}>Find My Stack</Link>
          <Link href="/about" className="block hover:text-neutral-900" onClick={() => setOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
}
