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
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Order confirmed!</h1>
      <p className="text-gray-500 mb-2">Thank you for your order. You&apos;ll receive a confirmation email shortly.</p>
      <p className="text-gray-500 mb-8 flex items-center justify-center gap-2">
        <Package className="w-4 h-4 text-green-600" />
        Everything will ship in one package.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
          Back to Home
        </Link>
        <Link href="/products" className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Keep Shopping
        </Link>
      </div>
    </div>
  );
}
