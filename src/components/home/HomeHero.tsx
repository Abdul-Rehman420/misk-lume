"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

export default function HomeHero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden bg-[linear-gradient(135deg,#0B0B0B_0%,#1a1510_50%,#0B0B0B_100%)]">
      <Image
        src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&q=80"
        alt="Luxury perfume bottle"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,11,11,0.9)_0%,rgba(11,11,11,0.4)_100%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[600px] px-4 sm:px-6 ml-0 md:ml-[10%]">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.1}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold"
        >
          New Collection 2026
        </motion.p>
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.25}
          className="font-display text-5xl font-medium leading-[1.1] text-text-primary md:text-6xl"
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
        >
          The Art of <em className="italic text-accent-gold">Distinction</em>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.4}
          className="mb-8 mt-6 max-w-[480px] text-lg leading-relaxed text-text-muted"
        >
          Handcrafted, oil-based fragrances distilled in small batches. Each
          bottle is a ritual — not a spray.
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.55}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/shop"
            className="inline-flex min-h-[48px] items-center justify-center rounded-sm bg-accent-gold px-10 py-4 text-base font-semibold uppercase tracking-wider text-bg-primary transition-all hover:bg-accent-gold-hover hover:shadow-gold"
          >
            Explore Collection
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-[48px] items-center justify-center rounded-sm border border-accent-gold px-10 py-4 text-base font-semibold uppercase tracking-wider text-accent-gold transition-all hover:bg-accent-gold-muted"
          >
            Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
