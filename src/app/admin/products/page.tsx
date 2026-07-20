"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string; name: string; slug: string; price: number; is_active: boolean;
  categories?: { name: string } | null; stock_quantity?: number;
  product_images?: { image_url: string; is_primary: boolean }[];
}

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadProducts() {
    try {
      const { data } = await supabase.from('products').select('*, categories(name), product_images(image_url, is_primary)').order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch { setError("Failed to load products"); }
    setLoading(false);
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
        <span className="text-sm text-admin-text-muted">{filtered.length} products</span>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-text-muted"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-md border border-admin-border bg-admin-surface py-2 pl-10 pr-4 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-md border border-admin-border bg-admin-surface px-4 py-2 text-sm text-admin-text outline-none transition-colors focus:border-accent-gold">
          <option>All Categories</option>
          <option>Oud</option><option>Attar</option><option>Musks</option><option>Floral</option><option>Amber</option>
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
                        <button onClick={() => handleDelete(product.id)} disabled={deleting === product.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50">
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
