"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string; order_number: string; total: number; status: string; created_at: string;
  order_items: { product_name: string; quantity: number }[];
  profiles: { full_name: string } | null;
}

const statusStyles: Record<string, string> = {
  processing: "bg-accent-gold-muted text-accent-gold",
  pending: "bg-accent-gold-muted text-accent-gold",
  shipped: "bg-blue-500/15 text-blue-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-error/15 text-error",
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadOrders() {
    try {
      const { data } = await supabase.from('orders').select('*, order_items(product_name, quantity), profiles(full_name)').order('created_at', { ascending: false });
      if (data) setOrders(data);
    } catch { setError("Failed to load orders"); }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      await supabase.from('orders').update({ status }).eq('id', id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch { setError("Failed to update status"); }
    setUpdatingId(null);
  }

  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const kpis = [
    { label: "Total Orders", value: String(orders.length) },
    { label: "Processing", value: String(statusCounts.processing || statusCounts.pending || 0) },
    { label: "Shipped", value: String(statusCounts.shipped || 0) },
    { label: "Delivered", value: String(statusCounts.delivered || 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Orders</h1>
        <p className="text-sm text-admin-text-muted">Manage and fulfill customer orders.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-md border border-admin-border bg-admin-surface p-6">
            <p className="text-sm text-admin-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-admin-text">{kpi.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-admin-text-muted">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-accent-gold">{order.order_number || `#${order.id.slice(0, 8)}`}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text">{(Array.isArray(order.profiles) ? order.profiles[0] : order.profiles)?.full_name || "Guest"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{order.order_items?.map(i => i.product_name).join(", ") || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">PKR {(order.total || 0).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status] || "bg-gray-200 text-gray-600"}`}>{order.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} disabled={updatingId === order.id} className="rounded-md border border-admin-border bg-admin-surface px-2 py-1 text-xs text-admin-text outline-none focus:border-accent-gold disabled:opacity-50">
                      {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
