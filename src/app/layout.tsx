import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { LogoMark } from "@/components/Logo";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuppStack — Science-backed supplements, one package",
  description: "Find your perfect supplement stack with AI guidance and evidence-based products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-24 border-t border-white/10 py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-[var(--muted)]">
                <div>
                  <div className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                    <LogoMark className="w-7 h-7" />
                    Supp<span className="gradient-text">Stack</span>
                  </div>
                  <p className="leading-relaxed">Science-backed supplements, shipped as one package. No fillers, no fluff.</p>
                </div>
                <div>
                  <div className="eyebrow text-white/60 mb-3">Explore</div>
                  <ul className="space-y-2">
                    <li><a href="/products" className="hover:text-emerald-400 transition-colors">Shop All Products</a></li>
                    <li><a href="/survey" className="hover:text-emerald-400 transition-colors">Find My Stack</a></li>
                    <li><a href="/about" className="hover:text-emerald-400 transition-colors">About</a></li>
                  </ul>
                </div>
                <div>
                  <div className="eyebrow text-white/60 mb-3">Disclaimer</div>
                  <p className="leading-relaxed">These statements have not been evaluated by any medical authority. Products are not intended to diagnose, treat, cure, or prevent any disease.</p>
                </div>
              </div>
              <div className="mt-12 pt-6 border-t border-white/5 text-xs text-white/30">
                © {new Date().getFullYear()} SuppStack. Built in Switzerland.
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
