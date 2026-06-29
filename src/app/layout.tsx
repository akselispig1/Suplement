import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuppStack — Science-backed supplements, one package",
  description: "Find your perfect supplement stack with AI guidance and evidence-based products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900 antialiased`}>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-20 border-t border-gray-100 bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
                <div>
                  <div className="font-bold text-gray-900 text-base mb-2">SuppStack</div>
                  <p>Science-backed supplements, shipped as one package. No fillers, no fluff.</p>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Quick Links</div>
                  <ul className="space-y-1">
                    <li><a href="/products" className="hover:text-green-700">Shop All Products</a></li>
                    <li><a href="/survey" className="hover:text-green-700">Find My Stack</a></li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-gray-700 mb-2">Disclaimer</div>
                  <p>These statements have not been evaluated by the FDA. Products are not intended to diagnose, treat, cure, or prevent any disease.</p>
                </div>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
