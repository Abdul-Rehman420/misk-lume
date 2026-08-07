"use client";

import { useState } from "react";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function BlogNewsletter() {
  return (
    <section className="bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl font-medium text-text-primary">Stay Informed</h2>
        <p className="mt-3 text-sm text-text-muted">Get the latest fragrance guides, new arrivals, and exclusive offers delivered to your inbox.</p>
        <NewsletterForm className="mt-8" />
      </div>
    </section>
  );
}
