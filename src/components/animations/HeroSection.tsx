"use client";

import Link from "next/link";
import HeroParallax from "./HeroParallax";

export default function HeroSection() {
  return (
    <HeroParallax>
      <section className="hero-grain relative flex min-h-screen items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-bg-primary/40 to-bg-primary" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent-gold">
            New Collection 2026
          </p>
          <h1 className="font-display text-5xl font-medium leading-tight text-text-primary md:text-7xl">
            The Art of <em className="not-italic text-accent-gold">Distinction</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
            Handcrafted, oil-based fragrances distilled in small batches. Each bottle is a ritual — not a spray.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-accent-gold px-10 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all hover:bg-accent-gold-hover hover:shadow-gold"
            >
              Explore Collection
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-[48px] items-center justify-center rounded-sm border border-accent-gold px-10 text-sm font-semibold uppercase tracking-wider text-accent-gold transition-all hover:bg-accent-gold-muted"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </HeroParallax>
  );
}
