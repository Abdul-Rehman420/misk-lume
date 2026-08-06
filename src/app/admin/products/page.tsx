"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToCloudinary } from "@/lib/images";

interface Product {
  id: string; name: string; slug: string; price: number; is_active: boolean;
  categories?: { name: string } | null; stock_quantity?: number; category_id?: string;
  description?: string; gender?: string;
  product_images?: { id: string; image_url: string; is_primary: boolean }[];
}

const emptyForm = { name: "", slug: "", price: "", gender: "unisex", category_id: "", stock: "10", is_active: true, description: "", image_url: "" };

const statusStyles: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Draft: "bg-gray-200 text-gray-600",
};

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { loadProducts(); loadCategories(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProducts() {
    try {
      const { data } = await supabase.from('products').select('*, categories(name), product_images(image_url, is_primary)').order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch { setError("Failed to load products"); }
    setLoading(false);
  }

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    if (data) setCategories(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { setError("Failed to delete product"); }
    setDeleting(null);
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id);
    try {
      await supabase.from('products').update({ is_active: !current }).eq('id', id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    } catch { setError("Failed to update product"); }
    setToggling(null);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm(f => ({ ...f, image_url: url }));
    } catch {
      setError("Image upload failed. Make sure Cloudinary upload preset is configured.");
    }
    setUploading(false);
  }

  function startEdit(p: Product) {
    const img = p.product_images?.find(i => i.is_primary)?.image_url || p.product_images?.[0]?.image_url || "";
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, price: String(p.price), gender: p.gender || "unisex",
      category_id: p.category_id || "", stock: String(p.stock_quantity ?? 0),
      is_active: p.is_active, description: p.description || "", image_url: img,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const payload = {
        name: form.name, slug, price: parseFloat(form.price) || 0,
        gender: form.gender, category_id: form.category_id || null,
        stock_quantity: parseInt(form.stock) || 0, is_active: form.is_active,
        description: form.description,
      };

      let productId: string | null = editingId;

      if (editingId) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', editingId);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.from('products').insert(payload).select().single();
        if (err) throw err;
        productId = data.id;
      }

      if (productId && form.image_url) {
        const existing = products.find(p => p.id === productId)?.product_images || [];
        const primary = existing.find(i => i.is_primary) || existing[0];
        if (primary) {
          await supabase.from('product_images').update({ image_url: form.image_url }).eq('id', primary.id);
        } else {
          await supabase.from('product_images').insert({ product_id: productId, image_url: form.image_url, is_primary: true, sort_order: 0 });
        }
        await supabase.from('products').update({ image_url: form.image_url }).eq('id', productId);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadProducts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save product");
    }
    setSaving(false);
  }

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== "All" && p.categories?.name !== categoryFilter) return false;
    if (statusFilter === "Active" && !p.is_active) return false;
    if (statusFilter === "Draft" && p.is_active) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-admin-text">Products</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-admin-text-muted">{filtered.length} products</span>
          <button onClick={openAdd} className="rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover">Add Product</button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-muted"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-surface py-2 pl-10 pr-4 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-md border border-admin-border bg-admin-surface px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-md border border-admin-border bg-admin-surface px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold">
          <option>All Status</option><option>Active</option><option>Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-admin-text-muted">No products found</td></tr>
              ) : filtered.map((product) => {
                const img = product.product_images?.find(i => i.is_primary)?.image_url || product.product_images?.[0]?.image_url;
                return (
                  <tr key={product.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                    <td className="px-4 py-3">
                      {img ? (
                        <Image src={img} alt={product.name} width={40} height={40} className="h-10 w-10 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-gold/20 text-xs font-bold text-accent-gold">{product.name.charAt(0)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-admin-text">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-admin-text-muted">{product.categories?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-admin-text">PKR {product.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${product.is_active ? statusStyles.Active : statusStyles.Draft}`}>
                        {product.is_active ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`/product/${product.slug}`} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </a>
                        <button onClick={() => startEdit(product)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text" title="Edit product">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                        </button>
                        <button onClick={() => toggleActive(product.id, product.is_active)} disabled={toggling === product.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text disabled:opacity-50" title={product.is_active ? "Deactivate" : "Activate"} aria-label={product.is_active ? `Deactivate ${product.name}` : `Activate ${product.name}`}>
                          {product.is_active ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                        <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50" aria-label={`Delete ${product.name}`}>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" role="dialog" aria-modal="true" aria-label="Add product">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-admin-border bg-admin-surface p-6">
            <h2 className="mb-6 text-lg font-semibold text-admin-text">{editingId ? "Edit Product" : "Add Product"}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-admin-text">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" placeholder="auto-generated" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-admin-text">Price (PKR)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-admin-text">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold">
                    <option value="unisex">Unisex</option><option value="men">Men</option><option value="women">Women</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-admin-text">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Category</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Image</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text transition-colors hover:border-accent-gold disabled:cursor-not-allowed disabled:opacity-50">
                    {uploading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        Choose from device
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={uploading} />
                  </label>
                  {form.image_url && !uploading && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="text-xs text-admin-text-muted transition-colors hover:text-error">Remove</button>
                  )}
                </div>
                {form.image_url && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={form.image_url} alt="Preview" className="h-20 w-20 flex-shrink-0 rounded-md border border-admin-border object-cover" />
                    <span className="truncate text-xs text-admin-text-muted">{form.image_url}</span>
                  </div>
                )}
                <p className="mt-2 text-xs text-admin-text-muted">Uploaded images are stored on Cloudinary. Or paste a URL instead:</p>
                <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="mt-2 w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full resize-none rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded border-admin-border" />
                <label htmlFor="is_active" className="text-sm text-admin-text">Active</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-md border border-admin-border px-4 py-2 text-sm text-admin-text transition-colors hover:bg-admin-bg">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name} className="rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
