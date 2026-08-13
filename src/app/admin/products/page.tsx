"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToCloudinary } from "@/lib/images";

interface Product {
  id: string; name: string; slug: string; price: number; is_active: boolean;
  categories?: { name: string } | null; stock_quantity?: number; category_id?: string;
  description?: string; gender?: string; is_bestseller?: boolean; sort_order?: number;
  product_images?: { id: string; image_url: string; is_primary: boolean }[];
}

const emptyForm = { name: "", slug: "", price: "", gender: "unisex", category_id: "", stock: "10", is_active: true, is_bestseller: false, sort_order: "0", description: "", image_url: "", imageRemoved: false };

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
  const [bestSellerToggling, setBestSellerToggling] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
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
      const { data, error } = await supabase.from('products').select('*, categories(name), product_images(image_url, is_primary)').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setProducts(data);
    } catch { setError("Failed to load products"); }
    setLoading(false);
  }

  async function loadCategories() {
    const { data, error } = await supabase.from('categories').select('id, name').order('name');
    if (error) { setError("Failed to load categories"); return; }
    if (data) setCategories(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { setError("Failed to delete product"); }
    setDeleting(null);
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id);
    try {
      const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    } catch { setError("Failed to update product"); }
    setToggling(null);
  }

  async function toggleBestSeller(id: string, current: boolean) {
    setBestSellerToggling(id);
    try {
      const { error } = await supabase.from('products').update({ is_bestseller: !current }).eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_bestseller: !current } : p));
    } catch { setError("Failed to update product"); }
    setBestSellerToggling(null);
  }

  async function moveProduct(id: string, direction: -1 | 1) {
    const sorted = [...products].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const from = sorted.findIndex(p => p.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= sorted.length) return;
    setMovingId(id);
    try {
      const reordered = [...sorted];
      [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
      for (let i = 0; i < reordered.length; i++) {
        if ((reordered[i].sort_order ?? 0) !== i + 1) {
          const { error } = await supabase.from('products').update({ sort_order: i + 1 }).eq('id', reordered[i].id);
          if (error) throw error;
        }
      }
      setProducts(reordered.map((p, i) => ({ ...p, sort_order: i + 1 })));
    } catch { setError("Failed to reorder product"); }
    setMovingId(null);
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
      is_active: p.is_active, is_bestseller: p.is_bestseller ?? false,
      sort_order: String(p.sort_order ?? 0), description: p.description || "", image_url: img, imageRemoved: false,
    });
    setShowModal(true);
  }

  async function handleSave() {
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be a number greater than 0");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock cannot be negative");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const payload = {
        name: form.name, slug, price,
        gender: form.gender, category_id: form.category_id || null,
        stock_quantity: stock, is_active: form.is_active,
        is_bestseller: form.is_bestseller, sort_order: parseInt(form.sort_order) || 0,
        description: form.description,
      };

      let productId: string | null = editingId;

      if (editingId) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', editingId);
        if (err) throw err;
      } else {
        const { data: maxRow } = await supabase.from('products').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
        payload.sort_order = (maxRow?.sort_order ?? 0) + 1;
        const { data, error: err } = await supabase.from('products').insert(payload).select().single();
        if (err) throw err;
        productId = data.id;
      }

      if (productId && form.image_url) {
        const existing = products.find(p => p.id === productId)?.product_images || [];
        const primary = existing.find(i => i.is_primary) || existing[0];
        if (primary) {
          const { error } = await supabase.from('product_images').update({ image_url: form.image_url }).eq('id', primary.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('product_images').insert({ product_id: productId, image_url: form.image_url, is_primary: true, sort_order: 0 });
          if (error) throw error;
        }
        const { error: prodErr } = await supabase.from('products').update({ image_url: form.image_url }).eq('id', productId);
        if (prodErr) throw prodErr;
      } else if (productId && form.imageRemoved) {
        const { error: delErr } = await supabase.from('product_images').delete().eq('product_id', productId);
        if (delErr) throw delErr;
        const { error: prodErr } = await supabase.from('products').update({ image_url: null }).eq('id', productId);
        if (prodErr) throw prodErr;
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
          <button onClick={openAdd} className="rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover" suppressHydrationWarning>Add Product</button>
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
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-surface py-2 pl-10 pr-4 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" suppressHydrationWarning />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-md border border-admin-border bg-admin-surface px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" suppressHydrationWarning>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-md border border-admin-border bg-admin-surface px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" suppressHydrationWarning>
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
                        <a href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </a>
                        <button onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text" title="Edit product">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                        </button>
                        <button onClick={() => toggleBestSeller(product.id, product.is_bestseller ?? false)} disabled={bestSellerToggling === product.id} className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-50 ${product.is_bestseller ? "text-accent-gold hover:bg-accent-gold/10" : "text-admin-text-muted hover:bg-admin-bg hover:text-admin-text"}`} title={product.is_bestseller ? "Remove from Best Sellers" : "Add to Best Sellers"} aria-label={product.is_bestseller ? `Remove ${product.name} from Best Sellers` : `Add ${product.name} to Best Sellers`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={product.is_bestseller ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" className="h-4 w-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        </button>
                        <button onClick={() => moveProduct(product.id, -1)} disabled={movingId !== null} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text disabled:opacity-50" title="Move up" aria-label={`Move ${product.name} up`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="18 15 12 9 6 15" /></svg>
                        </button>
                        <button onClick={() => moveProduct(product.id, 1)} disabled={movingId !== null} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text disabled:opacity-50" title="Move down" aria-label={`Move ${product.name} down`}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="6 9 12 15 18 9" /></svg>
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
                <label className="mb-1 block text-sm font-medium text-admin-text">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
                <p className="mt-1 text-xs text-admin-text-muted">Lower numbers appear first in the shop. Use the up/down arrows on the list to reorder.</p>
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
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "", imageRemoved: true }))} className="text-xs text-admin-text-muted transition-colors hover:text-error">Remove</button>
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
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded border-admin-border" />
                  <label htmlFor="is_active" className="text-sm text-admin-text">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_bestseller" checked={form.is_bestseller} onChange={e => setForm(f => ({ ...f, is_bestseller: e.target.checked }))} className="rounded border-admin-border" />
                  <label htmlFor="is_bestseller" className="text-sm text-admin-text">Best Seller</label>
                </div>
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
