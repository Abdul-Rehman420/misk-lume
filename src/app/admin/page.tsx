"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface KpiData { label: string; value: string; change: string; up: boolean }
interface OrderRow { id: string; order_number: string; customer: string; products: string; total: number; status: string; date: string }
interface TopProduct { name: string; units: number; revenue: string; color: string }
interface Activity { color: string; description: string; time: string }

const statusStyles: Record<string, string> = {
  processing: "bg-accent-gold-muted text-accent-gold",
  pending: "bg-accent-gold-muted text-accent-gold",
  shipped: "bg-blue-500/15 text-blue-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-error/15 text-error",
};

const productColors = ["bg-accent-gold", "bg-amber-700", "bg-rose-700", "bg-blue-700", "bg-emerald-700"];

export default function AdminDashboard() {
  const supabase = createClient();
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, customersRes, revenueRes, recentOrdersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('id, total, status, created_at, order_items(product_name, quantity), profiles(full_name)'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
          supabase.from('orders').select('total'),
          supabase.from('orders').select('id, order_number, total, status, created_at, order_items(product_name, quantity), profiles(full_name)').order('created_at', { ascending: false }).limit(5),
          supabase.from('products').select('name, review_count, price').eq('is_active', true).order('review_count', { ascending: false }).limit(3),
        ]);

        const totalRevenue = revenueRes.data?.reduce((s, o) => s + (o.total || 0), 0) || 0;
        const totalOrders = ordersRes.data?.length || 0;
        const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

        setKpis([
          { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, change: totalOrders > 0 ? "+" : "0", up: true },
          { label: "Total Orders", value: String(totalOrders), change: "+8.3%", up: true },
          { label: "Active Customers", value: String(customersRes.count || 0), change: "+15.2%", up: true },
          { label: "Avg. Order Value", value: `PKR ${avgOrderValue.toLocaleString()}`, change: avgOrderValue > 0 ? "+" : "0", up: avgOrderValue > 0 },
        ]);

        setOrders((recentOrdersRes.data || []).map(o => {
          const prof = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
          return {
            id: o.id,
            order_number: o.order_number || `#${o.id.slice(0, 8)}`,
            customer: prof?.full_name || "Guest",
            products: o.order_items?.map((i: { product_name: string }) => i.product_name).join(", ") || "—",
            total: o.total || 0,
            status: o.status || "pending",
            date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        }));

        setTopProducts((productsRes.data || []).map((p, i) => ({
          name: p.name,
          units: p.review_count || 0,
          revenue: `PKR ${((p.price || 0) * (p.review_count || 1)).toLocaleString()}`,
          color: productColors[i % productColors.length],
        })));
      } catch { setError("Failed to load dashboard data"); }
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="text-sm text-admin-text-muted">Welcome back. Here&apos;s what&apos;s happening with your store.</p>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-md border border-admin-border bg-admin-surface p-6">
            <p className="text-sm text-admin-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-admin-text">{kpi.value}</p>
            <p className={`mt-2 text-xs font-medium ${kpi.up ? "text-success" : "text-error"}`}>
              {kpi.up ? "↑" : "↓"} {kpi.change}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-admin-border bg-admin-surface">
        <div className="flex items-center justify-between border-b border-admin-border px-6 py-4">
          <h2 className="text-lg font-semibold text-admin-text">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm font-medium text-accent-gold transition-colors hover:text-accent-gold-hover">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-admin-border text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-admin-text-muted">Order ID</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-admin-text-muted">Customer</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-admin-text-muted">Products</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-admin-text-muted">Total</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-admin-text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-admin-text-muted">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="border-b border-admin-border last:border-b-0 transition-colors hover:bg-admin-bg/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-accent-gold">{order.order_number}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-admin-text">{order.customer}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-admin-text-muted">{order.products}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-admin-text">PKR {order.total.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status] || "bg-gray-200 text-gray-600"}`}>{order.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-admin-text-muted">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Top Products</h2>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-admin-text-muted">No products yet</p>
            ) : topProducts.map((product) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${product.color} text-xs font-bold text-white`}>
                  {product.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-admin-text">{product.name}</p>
                  <p className="text-xs text-admin-text-muted">{product.units} reviews</p>
                </div>
                <p className="whitespace-nowrap text-sm font-medium text-admin-text">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/admin/products" className="flex items-center gap-3 rounded-md border border-admin-border p-3 text-sm text-admin-text transition-colors hover:border-accent-gold hover:text-accent-gold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
              Manage Products
            </a>
            <a href="/admin/orders" className="flex items-center gap-3 rounded-md border border-admin-border p-3 text-sm text-admin-text transition-colors hover:border-accent-gold hover:text-accent-gold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              View Orders
            </a>
            <a href="/admin/blog" className="flex items-center gap-3 rounded-md border border-admin-border p-3 text-sm text-admin-text transition-colors hover:border-accent-gold hover:text-accent-gold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              Write Blog Post
            </a>
            <a href="/admin/settings" className="flex items-center gap-3 rounded-md border border-admin-border p-3 text-sm text-admin-text transition-colors hover:border-accent-gold hover:text-accent-gold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Store Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
