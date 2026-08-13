"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("store_settings").select("*");
      if (error) { setError("Failed to load settings"); setLoading(false); return; }
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => { map[r.key] = r.value; });
        setSettings(map);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key, value, updated_at: new Date().toISOString(),
      }));
      const { error: err } = await supabase.from("store_settings").upsert(updates, { onConflict: "key" });
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings");
    }
    setSaving(false);
  }

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Settings</h1>
        <p className="text-sm text-admin-text-muted">Configure your store settings and preferences.</p>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-500">Settings saved successfully.</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Store Name</label>
              <input type="text" value={settings.store_name || ""} onChange={(e) => update("store_name", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Description</label>
              <textarea rows={3} value={settings.store_description || ""} onChange={(e) => update("store_description", e.target.value)} className="w-full resize-none rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Contact Email</label>
              <input type="email" value={settings.contact_email || ""} onChange={(e) => update("contact_email", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Phone</label>
              <input type="tel" value={settings.contact_phone || ""} onChange={(e) => update("contact_phone", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Shipping</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Default Shipping Rate (PKR)</label>
              <input type="text" value={settings.shipping_rate || "200"} onChange={(e) => update("shipping_rate", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Free Shipping Threshold (PKR)</label>
              <input type="text" value={settings.free_shipping_threshold || "8000"} onChange={(e) => update("free_shipping_threshold", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Estimated Delivery</label>
              <input type="text" value={settings.delivery_estimate || "4-5 business days"} onChange={(e) => update("delivery_estimate", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">Payment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Bank Name</label>
              <input type="text" value={settings.bank_name || ""} onChange={(e) => update("bank_name", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Account Title</label>
              <input type="text" value={settings.account_title || ""} onChange={(e) => update("account_title", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Account Number</label>
              <input type="text" value={settings.account_number || ""} onChange={(e) => update("account_number", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">IBAN</label>
              <input type="text" value={settings.iban || ""} onChange={(e) => update("iban", e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="rounded-md bg-accent-gold px-6 py-2.5 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
