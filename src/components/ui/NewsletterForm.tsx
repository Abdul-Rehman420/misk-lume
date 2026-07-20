"use client";

import { useState } from "react";

export default function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-green-500">Thanks for subscribing! Check your inbox.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
        placeholder="Enter your email"
        required
        maxLength={254}
        aria-describedby={status === "error" ? "newsletter-error" : undefined}
        className="flex-1 rounded-sm border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-dim transition-colors focus:border-accent-gold focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-accent-gold px-8 py-3 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all duration-200 hover:bg-accent-gold-hover hover:shadow-gold disabled:opacity-50"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p id="newsletter-error" role="alert" className="mt-2 text-xs text-red-500">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
