"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Copy } from "lucide-react";

const TWINT_NUMBER = process.env.NEXT_PUBLIC_TWINT_NUMBER || "+41 79 000 00 00";

function TwintContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "";
  const total = params.get("total") || "0.00";

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-2xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pay with TWINT</h1>
          <p className="text-gray-500 mt-1">Your order is reserved — send payment to confirm</p>
        </div>

        {/* Order summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Order</p>
              <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Amount</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">CHF {parseFloat(total).toFixed(2)}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <Step number={1}>
              Open the <strong>TWINT app</strong> on your phone
            </Step>
            <Step number={2}>
              <span>Send </span>
              <strong>CHF {parseFloat(total).toFixed(2)}</strong>
              <span> to:</span>
              <button
                onClick={() => copy(TWINT_NUMBER)}
                className="mt-2 flex items-center gap-2 w-full bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl px-4 py-3 text-blue-700 font-bold text-lg"
              >
                <span className="flex-1 text-left">{TWINT_NUMBER}</span>
                <Copy className="w-4 h-4 shrink-0" />
              </button>
            </Step>
            <Step number={3}>
              In the message / reference field, write:
              <button
                onClick={() => copy(orderId)}
                className="mt-2 flex items-center gap-2 w-full bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl px-4 py-3 text-gray-700 font-mono font-semibold"
              >
                <span className="flex-1 text-left">{orderId}</span>
                <Copy className="w-4 h-4 shrink-0 text-gray-400" />
              </button>
            </Step>
            <Step number={4}>
              <span>That&apos;s it! We&apos;ll confirm your order and ship it once we receive payment.</span>
            </Step>
          </div>
        </div>

        {/* Confirmation note */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            You&apos;ll receive a confirmation email once your payment is verified and your order is on its way.
          </p>
        </div>

        <div className="text-center">
          <Link href="/products" className="text-sm text-gray-400 hover:text-gray-600">
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
      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
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
