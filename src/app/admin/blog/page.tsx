"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BlogPost {
  id: string; title: string; slug: string; category: string; excerpt?: string;
  content?: string; is_published: boolean; published_at?: string; created_at: string;
}

const statusStyles: Record<string, string> = {
  Published: "bg-success/15 text-success",
  Draft: "bg-gray-200 text-gray-600",
};

const emptyForm = { title: "", slug: "", category: "Fragrance Guides", content: "", excerpt: "", is_published: false };

export default function BlogPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadPosts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPosts() {
    try {
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (data) setPosts(data);
    } catch { setError("Failed to load blog posts"); }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    setDeletingId(id);
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch { setError("Failed to delete post"); }
    setDeletingId(null);
  }

  async function togglePublish(id: string, current: boolean) {
    try {
      const update = current ? { is_published: false } : { is_published: true, published_at: new Date().toISOString() };
      await supabase.from('blog_posts').update(update).eq('id', id);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, is_published: !current, published_at: !current ? new Date().toISOString() : undefined } : p));
    } catch { setError("Failed to update post"); }
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title, slug: post.slug, category: post.category || "Fragrance Guides",
      content: post.content || "", excerpt: post.excerpt || "", is_published: post.is_published,
    });
    setShowModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      if (editingId) {
        const existing = posts.find(p => p.id === editingId);
        const { error: err } = await supabase.from('blog_posts').update({
          title: form.title, slug, category: form.category, content: form.content,
          excerpt: form.excerpt, is_published: form.is_published,
          published_at: form.is_published ? (existing?.published_at || new Date().toISOString()) : existing?.published_at ?? null,
        }).eq('id', editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('blog_posts').insert({
          title: form.title, slug, category: form.category, content: form.content,
          excerpt: form.excerpt, is_published: form.is_published,
          published_at: form.is_published ? new Date().toISOString() : null,
        });
        if (err) throw err;
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadPosts();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save post");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Blog Posts</h1>
          <p className="text-sm text-admin-text-muted">Manage your blog content and articles.</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover">New Post</button>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-300">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Published</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-admin-text-muted">No blog posts yet</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                  <td className="px-4 py-3 text-sm font-medium text-admin-text">{post.title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{post.category || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${post.is_published ? statusStyles.Published : statusStyles.Draft}`}>
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(post)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text" title="Edit post">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                      </button>
                      <button onClick={() => togglePublish(post.id, post.is_published)} disabled={deletingId === post.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text disabled:opacity-50" title={post.is_published ? "Unpublish" : "Publish"}>
                        {post.is_published ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                      <button onClick={() => handleDelete(post.id)} disabled={deletingId === post.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" role="dialog" aria-modal="true" aria-label="New blog post">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-admin-border bg-admin-surface p-6">
            <h2 className="mb-6 text-lg font-semibold text-admin-text">{editingId ? "Edit Blog Post" : "New Blog Post"}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-admin-text">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" placeholder="auto-generated" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-admin-text">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold">
                    <option>Fragrance Guides</option><option>Ingredients</option><option>Rituals</option><option>Behind the Scenes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Excerpt</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="w-full resize-none rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-admin-text">Content (HTML)</label>
                <textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full resize-none rounded-md border border-admin-border bg-admin-bg px-4 py-2 text-sm text-admin-text outline-none focus:border-accent-gold" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="publish" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded border-admin-border" />
                <label htmlFor="publish" className="text-sm text-admin-text">Publish immediately</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-md border border-admin-border px-4 py-2 text-sm text-admin-text transition-colors hover:bg-admin-bg">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="rounded-md bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary transition-colors hover:bg-accent-gold-hover disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
