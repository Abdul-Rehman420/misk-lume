"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Discount {
  id: string; code: string; type: string; value: number;
  min_order: number; usage_limit: number | null; used_count: number;
  is_active: boolean; expires_at?: string; created_at: string;
}

const statusStyles: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Inactive: "bg-gray-200 text-gray-600",
  Expired: "bg-gray-200 text-gray-600",
};

export default function DiscountsPage() {
  const supabase = createClient();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", type: "percentage", value: 10, min_order: 0, usage_limit: "", expires_at: "" });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadDiscounts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadDiscounts() {
    try {
      const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
      if (data) setDiscounts(data);
    } catch { setError("Failed to load discounts"); }
    setLoading(false);
  }

  const emptyForm = { code: "", type: "percentage", value: 10, min_order: 0, usage_limit: "", expires_at: "" };

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(d: Discount) {
    setEditingId(d.id);
    setForm({
      code: d.code, type: d.type, value: d.value, min_order: d.min_order,
      usage_limit: d.usage_limit == null ? "" : String(d.usage_limit),
      expires_at: d.expires_at ? d.expires_at.slice(0, 10) : "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.code.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        type: form.type,
        value: form.value,
        min_order: form.min_order,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      };

      if (editingId) {
        const { error } = await supabase.from('discount_codes').update(payload).eq('id', editingId);
        if (error) throw error;
        setDiscounts(prev => prev.map(d => d.id === editingId ? {
          ...d, code: payload.code, type: payload.type, value: payload.value,
          min_order: payload.min_order, usage_limit: payload.usage_limit,
          expires_at: payload.expires_at || undefined,
        } : d));
      } else {
        const { data, error } = await supabase.from('discount_codes').insert(payload).select().single();
        if (error) throw error;
        if (data) setDiscounts(prev => [data, ...prev]);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save discount");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id);
    try {
      await supabase.from('discount_codes').update({ is_active: !current }).eq('id', id);
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, is_active: !current } : d));
    } catch { setError("Failed to update discount"); }
    setToggling(null);
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
        <button onClick={() => showForm ? setShowForm(false) : openCreate()} className="flex items-center gap-2 rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {showForm ? "Cancel" : "Create Discount"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">{editingId ? "Edit Discount" : "New Discount"}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Code</label>
              <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. SUMMER20" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (PKR)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Value</label>
              <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Min Order (PKR)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(p => ({ ...p, min_order: Number(e.target.value) }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Usage Limit</label>
              <input type="number" value={form.usage_limit} onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))} placeholder="Blank = unlimited" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Expires</label>
              <input type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || !form.code.trim()} className="mt-4 rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Update Discount" : "Create Discount"}
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
                const status = !d.is_active ? "Inactive" : expired ? "Expired" : "Active";
                return (
                  <tr key={d.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-accent-gold">{d.code}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{d.type === "percentage" ? "Percentage" : "Fixed"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">{d.type === "percentage" ? `${d.value}%` : `PKR ${d.value.toLocaleString()}`}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text">{d.used_count}/{d.usage_limit ?? "∞"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{d.expires_at ? new Date(d.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(d)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text" title="Edit discount">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                        </button>
                        <button onClick={() => toggleActive(d.id, d.is_active)} disabled={toggling === d.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text disabled:opacity-50" title={d.is_active ? "Deactivate" : "Activate"}>
                          {d.is_active ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
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
