"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string; full_name: string; email: string; phone?: string;
  created_at: string; order_count: number; total_spent: number;
}

export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers() {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
      if (!profiles || profiles.length === 0) { setLoading(false); return; }

      const ids = profiles.map(p => p.id);
      const { data: orders } = await supabase.from('orders').select('user_id, total').in('user_id', ids);

      setCustomers(profiles.map(p => {
        const co = orders?.filter(o => o.user_id === p.id) || [];
        return { ...p, order_count: co.length, total_spent: co.reduce((s, o) => s + (o.total || 0), 0) };
      }));
    } catch { setError("Failed to load customers"); }
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(() => { loadCustomers(); }, 0);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Customers</h1>
        <p className="text-sm text-admin-text-muted">View and manage your customer base.</p>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
        </div>
      )}

      <div className="relative max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-muted"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-surface py-2 pl-10 pr-4 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-admin-text-muted">No customers found</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">{c.full_name || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{c.email || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{c.phone || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text">{c.order_count}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">PKR {c.total_spent.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
