"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string; rating: number; comment: string; is_approved: boolean; created_at: string;
  products?: { name: string } | null;
  profiles?: { full_name: string } | null;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`h-4 w-4 ${filled ? "text-accent-gold" : "text-admin-text-muted/30"}`}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

const statusStyles: Record<string, string> = {
  approved: "bg-success/15 text-success",
  pending: "bg-accent-gold-muted text-accent-gold",
};

export default function ReviewsPage() {
  const supabase = createClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadReviews() {
    try {
      const { data } = await supabase.from('reviews').select('*, products(name), profiles(full_name)').order('created_at', { ascending: false });
      if (data) setReviews(data);
    } catch { setError("Failed to load reviews"); }
    setLoading(false);
  }

  async function toggleApproval(id: string, current: boolean) {
    setUpdatingId(id);
    try {
      await supabase.from('reviews').update({ is_approved: !current }).eq('id', id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: !current } : r));
    } catch { setError("Failed to update review"); }
    setUpdatingId(null);
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    setUpdatingId(id);
    try {
      await supabase.from('reviews').delete().eq('id', id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch { setError("Failed to delete review"); }
    setUpdatingId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Reviews</h1>
        <p className="text-sm text-admin-text-muted">Monitor and moderate customer reviews.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" /></div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-admin-border bg-admin-surface">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-admin-bg">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Review</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-admin-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-admin-text-muted">No reviews yet</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id} className="border-t border-admin-border transition-colors hover:bg-admin-bg/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-admin-text">{review.products?.name || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-admin-text-muted">{review.profiles?.full_name || "Anonymous"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= review.rating} />)}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-admin-text-muted"><p className="truncate">{review.comment || "—"}</p></td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${review.is_approved ? statusStyles.approved : statusStyles.pending}`}>
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleApproval(review.id, review.is_approved)} disabled={updatingId === review.id} className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${review.is_approved ? "text-success hover:bg-success/10" : "text-admin-text-muted hover:bg-admin-bg hover:text-admin-text"} disabled:opacity-50`} title={review.is_approved ? "Unapprove" : "Approve"}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                      <button onClick={() => deleteReview(review.id)} disabled={updatingId === review.id} className="flex h-8 w-8 items-center justify-center rounded-md text-admin-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50">
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
