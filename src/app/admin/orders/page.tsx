"use client";
import { useEffect, useState } from "react";
import { Order, Product } from "@/types/product";
import { Truck, RefreshCw, CheckCircle, Clock, ExternalLink } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  async function fetchOrders() {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/products"),
      ]);
      if (!ordersRes.ok) throw new Error("Unauthorized");
      const data = await ordersRes.json();
      setOrders(data.orders.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      if (productsRes.ok) {
        const pd = await productsRes.json();
        const map: Record<string, Product> = {};
        (pd.products ?? []).forEach((p: Product) => { map[p.id] = p; });
        setProductMap(map);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Order["status"]) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchOrders();
  }

  useEffect(() => { fetchOrders(); }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    all: orders.length,
    awaiting_payment: orders.filter((o) => o.status === "awaiting_payment").length,
    to_ship: orders.filter((o) => o.status === "to_ship").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) return <div className="p-10 text-center text-white/40">Loading orders…</div>;
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-white/50 text-sm mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 px-4 py-2 border border-white/10 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "awaiting_payment", "to_ship", "shipped", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-gray-900 text-white" : "bg-white/[0.03] border border-white/10 backdrop-blur text-white/50 border border-white/10 hover:border-white/20"
            }`}
          >
            {s === "all" ? "All" : s === "awaiting_payment" ? "Awaiting Payment" : s === "to_ship" ? "To Ship" : s === "shipped" ? "Shipped" : "Cancelled"}
            <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* TWINT reminder */}
      {counts.awaiting_payment > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">{counts.awaiting_payment} order{counts.awaiting_payment !== 1 ? "s" : ""} waiting for TWINT payment</p>
            <p className="text-xs text-blue-600 mt-0.5">Check your TWINT app, then mark as paid to start fulfillment.</p>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/40">No orders</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white/[0.03] border border-white/10 backdrop-blur rounded-2xl border border-white/10 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-white font-mono text-sm">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-white/60">{order.customerName} · {order.customerEmail}</p>
                  <p className="text-xs text-white/40 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">CHF {order.totalCHF.toFixed(2)}</p>
                  <p className="text-xs text-white/40">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Shipping address */}
              <div className="mt-4 bg-white/[0.03] border border-white/10 backdrop-blur/5 rounded-xl p-3 text-sm text-white/60">
                <p className="font-medium text-white/80 mb-1">Ship to:</p>
                <p>{order.shippingAddress.line1}</p>
                <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}, {order.shippingAddress.country}</p>
              </div>

              {/* Items */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Packing list — order each item from its supplier</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-xs">
                      <th className="text-left font-medium py-1">Product</th>
                      <th className="text-left font-medium py-1">Supplier</th>
                      <th className="text-center font-medium py-1 w-12">Qty</th>
                      <th className="text-right font-medium py-1 w-24">Your cost</th>
                      <th className="text-right font-medium py-1 w-20">Buy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => {
                      const p = productMap[item.productId];
                      const lineCost = (p?.supplierCostCHF ?? 0) * item.quantity;
                      return (
                        <tr key={i} className="border-t border-white/5">
                          <td className="py-1.5 text-white/80">{item.productName} <span className="text-white/30">×{item.quantity}</span></td>
                          <td className="py-1.5 text-white/50">{p?.brandLabel ?? "—"}</td>
                          <td className="py-1.5 text-center text-white/50">{item.quantity}</td>
                          <td className="py-1.5 text-right text-white/60">{p?.supplierCostCHF ? `CHF ${lineCost.toFixed(2)}` : "—"}</td>
                          <td className="py-1.5 text-right">
                            {p?.supplierUrl ? (
                              <a href={p.supplierUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium">
                                Order <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : <span className="text-white/20">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Profit summary */}
                {(() => {
                  const cost = order.items.reduce((s, it) => s + (productMap[it.productId]?.supplierCostCHF ?? 0) * it.quantity, 0);
                  const shipping = order.shippingCHF ?? 0;
                  const revenue = order.totalCHF;
                  const profit = revenue - cost - shipping;
                  const known = order.items.every((it) => productMap[it.productId]?.supplierCostCHF != null);
                  return (
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2">
                      <span className="text-white/50">Customer paid: <span className="text-white/80 font-semibold">CHF {revenue.toFixed(2)}</span></span>
                      <span className="text-white/50">Your supplier cost: <span className="text-white/80">CHF {cost.toFixed(2)}</span></span>
                      {shipping > 0 && <span className="text-white/50">Shipping charged: <span className="text-white/80">CHF {shipping.toFixed(2)}</span></span>}
                      <span className="text-white/50">Est. profit: <span className={profit >= 0 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>CHF {profit.toFixed(2)}</span>{!known && <span className="text-white/30"> (partial)</span>}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2 justify-end flex-wrap">
                {order.status === "awaiting_payment" && (
                  <button
                    onClick={() => updateStatus(order.id, "to_ship")}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as Paid
                  </button>
                )}
                {order.status === "to_ship" && (
                  <button
                    onClick={() => updateStatus(order.id, "shipped")}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Truck className="w-4 h-4" /> Mark as Shipped
                  </button>
                )}
                {(order.status === "awaiting_payment" || order.status === "to_ship") && (
                  <button
                    onClick={() => updateStatus(order.id, "cancelled")}
                    className="flex items-center gap-2 bg-white/[0.03] border border-white/10 backdrop-blur text-white/50 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], { label: string; className: string }> = {
    awaiting_payment: { label: "Awaiting Payment", className: "bg-blue-100 text-blue-800" },
    to_ship: { label: "To Ship", className: "bg-amber-100 text-amber-800" },
    shipped: { label: "Shipped", className: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelled", className: "bg-white/[0.03] border border-white/10 backdrop-blur/10 text-white/60" },
  };
  const { label, className } = map[status];
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>{label}</span>;
}
