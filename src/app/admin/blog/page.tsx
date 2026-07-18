"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BlogPost {
  id: string; title: string; slug: string; category: string;
  is_published: boolean; published_at?: string; created_at: string;
}

const statusStyles: Record<string, string> = {
  Published: "bg-success/15 text-success",
  Draft: "bg-gray-200 text-gray-600",
};

export default function BlogPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Blog Posts</h1>
          <p className="text-sm text-admin-text-muted">Manage your blog content and articles.</p>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">{error}</div>
        )}
      </div>

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
                      <button onClick={() => togglePublish(post.id, post.is_published)} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-admin-bg hover:text-admin-text" title={post.is_published ? "Unpublish" : "Publish"}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
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
    </div>
  );
}
