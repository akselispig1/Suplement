"use client";
import Link from "next/link";
import { ShoppingCart, Leaf, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
          <Leaf className="w-6 h-6" />
          SuppStack
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/products" className="hover:text-green-700 transition-colors">Shop</Link>
          <Link href="/survey" className="hover:text-green-700 transition-colors">Find My Stack</Link>
          <Link href="/about" className="hover:text-green-700 transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-700 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-3 text-sm font-medium text-gray-700">
          <Link href="/products" className="block hover:text-green-700" onClick={() => setOpen(false)}>Shop All</Link>
          <Link href="/survey" className="block hover:text-green-700" onClick={() => setOpen(false)}>Find My Stack</Link>
          <Link href="/about" className="block hover:text-green-700" onClick={() => setOpen(false)}>About</Link>
        </div>
      )}
    </header>
  );
}
