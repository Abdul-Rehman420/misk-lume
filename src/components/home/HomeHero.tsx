"use client";

import Link from "next/link";
import Image from "next/image";
import HeroParallax from "@/components/animations/HeroParallax";

export default function HomeHero() {
  return (
    <HeroParallax>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80" alt="Luxury perfume bottle" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-overlay hero-grain" />
        <div className="relative z-10 flex max-w-3xl flex-col items-center px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-gold">New Collection 2026</span>
          <h1 className="mt-6 font-display font-medium text-text-primary" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            The Art of Distinction
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-muted">
            Handcrafted fragrances born from rare ingredients and obsessive attention to detail. Each scent tells a story of heritage and modern elegance.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/shop" className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-accent-gold px-10 text-sm font-semibold uppercase tracking-wider text-bg-primary transition-all hover:bg-accent-gold-hover hover:shadow-gold">
              Explore Collection
            </Link>
            <Link href="/about" className="inline-flex min-h-[48px] items-center justify-center rounded-sm border border-accent-gold px-10 text-sm font-semibold uppercase tracking-wider text-accent-gold transition-all hover:bg-accent-gold-muted">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </HeroParallax>
  );
}
