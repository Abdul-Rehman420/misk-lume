"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToCloudinary } from "@/lib/images";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  is_active: boolean;
  sort_order: number;
  product_ids: string[];
  product_tags: string[];
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: string;
  original_price: string;
  sort_order: string;
  is_active: boolean;
  product_ids: string[];
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  price: "",
  original_price: "",
  sort_order: "0",
  is_active: true,
  product_ids: [],
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CollectionsAdminPage() {
  const supabase = createClient();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadCollections() {
    const { data, error: err } = await supabase
      .from('collections')
      .select('*, collection_products(product_id, products(name))')
      .order('sort_order', { ascending: true });
    if (err) throw err;
    if (!data) return;
    setCollections(data.map((c) => {
      const rows = (c.collection_products || []) as { product_id: string; products?: { name: string } | null }[];
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        image_url: c.image_url ?? null,
        price: c.price ?? null,
        original_price: c.original_price ?? null,
        is_active: c.is_active,
        sort_order: c.sort_order ?? 0,
        product_ids: rows.map((r) => r.product_id),
        product_tags: rows.map((r) => r.products?.name ?? "").filter(Boolean),
      };
    }));
  }

  async function loadProducts() {
    const { data, error: err } = await supabase
      .from('products')
      .select('id, name, slug, is_active')
      .order('name', { ascending: true });
    if (err) throw err;
    if (data) setProducts(data);
  }

  useEffect(() => {
    (async () => {
      try {
        const [cols, prods] = await Promise.all([loadCollections(), loadProducts()]);
        void cols; void prods;
      } catch {
        setError("Failed to load collections");
      }
      setLoading(false);
    })();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setProductSearch("");
    setError(null);
    setShowForm(true);
  }

  function startEdit(c: Collection) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image_url: c.image_url ?? "",
      price: c.price == null ? "" : String(c.price),
      original_price: c.original_price == null ? "" : String(c.original_price),
      sort_order: String(c.sort_order ?? 0),
      is_active: c.is_active,
      product_ids: c.product_ids,
    });
    setProductSearch("");
    setError(null);
    setShowForm(true);
  }

  function toggleProduct(id: string) {
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter((pid) => pid !== id)
        : [...f.product_ids, id],
    }));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file, "misk-lume/collections");
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      setError("Image upload failed. Make sure Cloudinary upload preset is configured.");
    }
    setUploading(false);
  }

  async function handleSave() {
    const name = form.name.trim();
    if (!name) { setError("Collection name is required"); return; }
    if (name.length > 100) { setError("Collection name must be 100 characters or fewer"); return; }
    if (form.description.length > 2000) { setError("Description must be 2000 characters or fewer"); return; }

    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      setError("Slug may only contain lowercase letters, numbers, and dashes (e.g. rose-garden)");
      return;
    }
    if (slug.length > 100) { setError("Slug must be 100 characters or fewer"); return; }

    if (form.image_url && !isValidUrl(form.image_url)) {
      setError("Image URL must be a valid https:// link");
      return;
    }

    let price: number | null = null;
    if (form.price.trim()) {
      price = Number(form.price);
      if (!Number.isInteger(price) || price < 0) { setError("Price must be a whole number of 0 or more"); return; }
    }
    let originalPrice: number | null = null;
    if (form.original_price.trim()) {
      originalPrice = Number(form.original_price);
      if (!Number.isInteger(originalPrice) || originalPrice < 0) { setError("Original price must be a whole number of 0 or more"); return; }
    }
    if (price != null && originalPrice != null && originalPrice < price) {
      setError("Original price cannot be less than the current price");
      return;
    }

    const sortOrder = Number(form.sort_order);
    if (!Number.isInteger(sortOrder)) { setError("Sort order must be a whole number"); return; }

    // Defense in depth: only accept product ids that came from the DB.
    const validProductIds = new Set(products.map((p) => p.id));
    const selectedIds = Array.from(new Set(form.product_ids)).filter((id) => validProductIds.has(id));

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        slug,
        description: form.description.trim() || null,
        image_url: form.image_url || null,
        price,
        original_price: originalPrice,
        is_active: form.is_active,
        sort_order: sortOrder,
      };

      let collectionId: string | null = editingId;

      if (editingId) {
        const { error: err } = await supabase.from('collections').update(payload).eq('id', editingId);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.from('collections').insert(payload).select('id').single();
        if (err) throw err;
        collectionId = data?.id ?? null;
      }

      if (collectionId) {
        const { error: delErr } = await supabase.from('collection_products').delete().eq('collection_id', collectionId);
        if (delErr) throw delErr;

        if (selectedIds.length > 0) {
          const rows = selectedIds.map((product_id) => ({ collection_id: collectionId, product_id }));
          const { error: insErr } = await supabase.from('collection_products').insert(rows);
          if (insErr) throw insErr;
        }
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadCollections();
    } catch (e: unknown) {
      const supErr = e as { code?: string; message?: string };
      if (supErr?.code === "23505") {
        setError(`A collection with the slug "${slug}" already exists`);
      } else {
        setError(supErr?.message || "Failed to save collection");
      }
    }
    setSaving(false);
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id);
    setError(null);
    try {
      const { error: err } = await supabase.from('collections').update({ is_active: !current }).eq('id', id);
      if (err) throw err;
      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c)));
    } catch {
      setError("Failed to update collection");
    }
    setToggling(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete collection "${name}"? Its product links will also be removed.`)) return;
    setError(null);
    try {
      const { error: err } = await supabase.from('collections').delete().eq('id', id);
      if (err) throw err;
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete collection");
    }
  }

  const filteredProducts = products.filter((p) =>
    !productSearch.trim() || p.name.toLowerCase().includes(productSearch.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Collections</h1>
          <p className="text-sm text-admin-text-muted">Curated product sets shown on the storefront. Only admins can edit.</p>
        </div>

        {error && (
          <div className="flex max-w-md items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
          </div>
        )}

        <button onClick={() => showForm ? setShowForm(false) : openCreate()} className="flex items-center gap-2 rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          {showForm ? "Cancel" : "Create Collection"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-md border border-admin-border bg-admin-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-admin-text">{editingId ? "Edit Collection" : "New Collection"}</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rose Garden Set" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated from name" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Price (PKR)</label>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Optional" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Original Price (PKR)</label>
              <input type="number" value={form.original_price} onChange={e => setForm(p => ({ ...p, original_price: e.target.value }))} placeholder="Optional — for sale styling" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-admin-text">Status</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-admin-border bg-admin-bg px-3 py-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded-sm border border-border-subtle bg-bg-elevated accent-accent-gold" />
                <span className="text-sm text-admin-text">{form.is_active ? "Active" : "Inactive"}</span>
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-admin-text">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Short description shown on the collections page" className="w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-admin-text">Image</label>
              <div className="flex flex-wrap items-center gap-3">
                <input type="text" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://… (or upload below)" className="min-w-[240px] flex-1 rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-admin-border px-4 py-2 text-sm font-medium text-admin-text transition-colors hover:border-accent-gold hover:text-accent-gold">
                  {uploading ? "Uploading…" : "Upload Image"}
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-sm font-medium text-admin-text">
                Products ({form.product_ids.length} selected)
              </label>
              <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search products…" className="mb-2 w-full rounded-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
              <div className="max-h-52 overflow-y-auto rounded-md border border-admin-border bg-admin-bg">
                {filteredProducts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-admin-text-muted">No products match your search</p>
                ) : (
                  filteredProducts.map((p) => (
                    <label key={p.id} className="flex cursor-pointer items-center gap-3 border-b border-admin-border px-3 py-2 last:border-b-0 hover:bg-admin-surface">
                      <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} className="h-4 w-4 rounded-sm border border-border-subtle accent-accent-gold" />
                      <span className="flex-1 text-sm text-admin-text">{p.name}</span>
                      {!p.is_active && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">Inactive</span>}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || uploading} className="mt-4 rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Update Collection" : "Create Collection"}
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
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-admin-text-muted">No collections yet</td></tr>
              ) : collections.map((c) => (
                <tr key={c.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                  <td className="px-4 py-3 text-sm font-medium text-admin-text">{c.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">/collections/{c.slug}</td>
                  <td className="px-4 py-3 text-sm text-admin-text-muted">{c.product_tags.length > 0 ? c.product_tags.join(", ") : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">
                    {c.price == null ? "—" : `PKR ${c.price.toLocaleString()}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? "bg-success/15 text-success" : "bg-gray-200 text-gray-600"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(c)} aria-label={`Edit ${c.name}`} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text" title="Edit collection">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                      </button>
                      <button onClick={() => toggleActive(c.id, c.is_active)} disabled={toggling === c.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text disabled:opacity-50" title={c.is_active ? "Deactivate" : "Activate"} aria-label={c.is_active ? `Deactivate ${c.name}` : `Activate ${c.name}`}>
                        {c.is_active ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error" aria-label={`Delete ${c.name}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
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
