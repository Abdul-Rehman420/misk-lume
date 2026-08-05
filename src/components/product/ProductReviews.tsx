"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ReviewCard from "@/components/ui/ReviewCard";
import Button from "@/components/ui/Button";

interface ProductReview {
  rating: number;
  text: string;
  author: string;
  date: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  productRating: number;
  reviewCount: number;
  initialReviews: ProductReview[];
}

export default function ProductReviews({
  productId,
  productName,
  productRating,
  reviewCount,
  initialReviews,
}: ProductReviewsProps) {
  const supabase = createClient();
  const [reviews] = useState(initialReviews);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      setAuthChecked(true);
    })();
  }, [supabase]);

  function handleWriteClick() {
    if (!userId) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setError("");
    setSubmitted(false);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!userId) return;
    if (rating < 1) { setError("Please select a star rating."); return; }
    if (!comment.trim()) { setError("Please write your review."); return; }
    setSubmitting(true);
    setError("");
    try {
      const { error: err } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: userId,
        rating,
        text: comment.trim(),
      });
      if (err) throw err;
      setSubmitted(true);
      setRating(0);
      setComment("");
      setShowForm(false);
    } catch {
      setError("Failed to submit your review. Please try again.");
    }
    setSubmitting(false);
  }

  const total = reviews.length;
  const dist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    pct: total ? Math.round((reviews.filter((r) => r.rating === stars).length / total) * 100) : 0,
  }));

  return (
    <section className="border-t border-border bg-bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Testimonials</span>
            <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">Customer Reviews</h2>
          </div>
          {!showForm && (
            <Button variant="outline" className="mt-4 sm:mt-0" onClick={handleWriteClick}>
              {authChecked && !userId ? "Log in to Review" : "Write a Review"}
            </Button>
          )}
        </div>

        {submitted && (
          <div className="mb-8 rounded-md border border-success/20 bg-success/10 p-4 text-sm text-success">
            Thank you! Your review has been submitted and is awaiting approval.
          </div>
        )}

        {showForm && (
          <div className="mb-10 rounded-md border border-border bg-bg-surface p-6">
            <h3 className="mb-4 font-display text-lg text-text-primary">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-sm text-text-muted">Your rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setRating(s)} aria-label={`${s} star${s > 1 ? "s" : ""}`} className="transition-transform hover:scale-110">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`h-6 w-6 ${s <= rating ? "text-accent-gold" : "text-text-dim"}`}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-muted" htmlFor="review-text">Your review</label>
                <textarea id="review-text" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={`Share your experience with ${productName}...`} className="w-full resize-none rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold" />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
                <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="text-sm text-text-muted transition-colors hover:text-text-primary">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <span className="font-display text-6xl font-medium text-text-primary">{productRating || 0}</span>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < Math.round(productRating || 0) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`h-5 w-5 ${i < Math.round(productRating || 0) ? "text-accent-gold" : "text-text-dim"}`}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className="mt-2 text-sm text-text-muted">{reviewCount || 0} reviews</p>
            <div className="mt-8 w-full max-w-xs space-y-2">
              {dist.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-3 text-right text-xs text-text-dim">{row.stars}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-accent-gold"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated"><div className="h-full rounded-full bg-accent-gold" style={{ width: `${row.pct}%` }} /></div>
                  <span className="w-8 text-right text-xs text-text-dim">{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {reviews.length === 0 ? (
              <p className="text-sm text-text-muted">No reviews yet. Be the first to share your experience.</p>
            ) : (
              reviews.map((review, i) => (
                <ReviewCard key={i} rating={review.rating} text={review.text} author={review.author} date={review.date} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
