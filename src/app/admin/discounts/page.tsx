"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Discount {
  id: string; code: string; discount_type: string; discount_value: number;
  min_order: number; max_uses: number; used_count: number;
  is_active: boolean; expires_at?: string; created_at: string;
}

const statusStyles: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Expired: "bg-gray-200 text-gray-600",
};

export default function DiscountsPage() {
  const supabase = createClient();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 10, min_order: 0, max_uses: 100, expires_at: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDiscounts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadDiscounts() {
    try {
      const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
      if (data) setDiscounts(data);
    } catch { setError("Failed to load discounts"); }
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from('discount_codes').insert({
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order: form.min_order,
        max_uses: form.max_uses,
        expires_at: form.expires_at || null,
      }).select().single();
      if (!error && data) {
        setDiscounts(prev => [data, ...prev]);
        setShowForm(false);
        setForm({ code: "", discount_type: "percentage", discount_value: 10, min_order: 0, max_uses: 100, expires_at: "" });
      }
    } catch { setError("Failed to create discount"); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this discount?")) return;
    try {
      await supabase.from('discount_codes').delete().eq('id', id);
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch { setError("Failed to delete discount"); }
  }

  function isExpired(d: Discount) {
    return d.expires_at && new Date(d.expires_at) < new Date();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Discount Codes</h1>
          <p className="text-sm text-admin-text-muted">Create and manage promotional discount codes.</p>
        </div>

        {error && (
          <div className="flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
          </div>
        )}
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {showForm ? "Cancel" : "Create Discount"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">New Discount</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Code</label>
              <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. SUMMER20" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Type</label>
              <select value={form.discount_type} onChange={e => setForm(p => ({ ...p, discount_type: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (PKR)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Value</label>
              <input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: Number(e.target.value) }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Min Order (PKR)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: Number(e.target.value) }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: Number(e.target.value) }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Expires</label>
              <input type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
          </div>
          <button onClick={handleCreate} disabled={saving || !form.code.trim()} className="mt-4 rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover disabled:opacity-50">
            {saving ? "Creating..." : "Create Discount"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-admin-text-muted">No discount codes yet</td></tr>
              ) : discounts.map((d) => {
                const expired = isExpired(d);
                return (
                  <tr key={d.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-accent-gold">{d.code}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{d.discount_type === "percentage" ? "Percentage" : "Fixed"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">{d.discount_type === "percentage" ? `${d.discount_value}%` : `PKR ${d.discount_value.toLocaleString()}`}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text">{d.used_count}/{d.max_uses}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${expired ? statusStyles.Expired : statusStyles.Active}`}>
                        {expired ? "Expired" : "Active"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{d.expires_at ? new Date(d.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button onClick={() => handleDelete(d.id)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
