"use client";
import { useEffect, useState } from "react";
import { Order } from "@/types/product";
import { Package, Truck, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setOrders(data.orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function markShipped(id: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "shipped" }),
    });
    if (res.ok) fetchOrders();
  }

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading orders…</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-4 py-2 border border-gray-200 rounded-xl bg-white">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No orders yet</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900 font-mono text-sm">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600">{order.customerName} · {order.customerEmail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">CHF {order.totalCHF.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Shipping address */}
              <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">Ship to:</p>
                <p>{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
                <p>{order.shippingAddress.city}{order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}, {order.shippingAddress.country}</p>
              </div>

              {/* Items */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Packing List</p>
                <table className="w-full text-sm">
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="py-1.5 text-gray-700">{item.productName}</td>
                        <td className="py-1.5 text-center text-gray-500 w-16">×{item.quantity}</td>
                        <td className="py-1.5 text-right text-gray-700 w-24">CHF {(item.priceCHF * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {order.status === "to_ship" && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => markShipped(order.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Truck className="w-4 h-4" /> Mark as Shipped
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    to_ship: { label: "To Ship", className: "bg-amber-100 text-amber-800" },
    shipped: { label: "Shipped", className: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
  };
  const { label, className } = map[status];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>{label}</span>;
}
