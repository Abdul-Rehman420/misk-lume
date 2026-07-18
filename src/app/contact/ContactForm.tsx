"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to send message");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-accent-gold/30 bg-bg-surface p-8 text-center">
        <h3 className="font-display text-xl text-accent-gold">Thank You</h3>
        <p className="mt-2 text-text-muted">
          Your message has been sent. We will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">{error}</div>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-text-dim">Name</label>
        <input type="text" id="name" name="name" required className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary placeholder:text-text-dim focus:border-accent-gold/50 focus:outline-none" placeholder="Your name" />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-text-dim">Email</label>
        <input type="email" id="email" name="email" required className="w-full rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary placeholder:text-text-dim focus:border-accent-gold/50 focus:outline-none" placeholder="your@email.com" />
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-text-dim">Subject</label>
        <select id="subject" name="subject" required className="w-full appearance-none rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary focus:border-accent-gold/50 focus:outline-none">
          <option value="">Select a subject</option>
          <option value="general">General Inquiry</option>
          <option value="order">Order Support</option>
          <option value="wholesale">Wholesale</option>
          <option value="press">Press</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-text-dim">Message</label>
        <textarea id="message" name="message" required rows={5} className="w-full resize-none rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-text-primary placeholder:text-text-dim focus:border-accent-gold/50 focus:outline-none" placeholder="How can we help?" />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-accent-gold px-6 py-3 font-body text-sm font-medium uppercase tracking-[0.15em] text-bg-primary transition-colors hover:bg-accent-gold/90 disabled:opacity-50">
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
