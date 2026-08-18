import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story | Misk Lume",
  description:
    "Discover the Misk Lume philosophy — handcrafted, oil-based fragrances distilled in small batches for those who treat scent as ritual.",
};

export default function AboutPage() {
  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
      <section className="flex min-h-[40vh] flex-col items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary px-6 text-center">
        <p className="font-body text-sm uppercase tracking-[0.3em] text-text-dim">
          The Philosophy
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Our{" "}
          <span className="italic text-accent-gold">Story</span>
        </h1>
      </section>

      <section className="mx-auto max-w-4xl space-y-20 px-6 py-20">
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
            The Conviction
          </h2>
          <p className="leading-relaxed text-text-muted">
            Misk Lume was founded on a single conviction: that perfume should be
            more than a product — it should be a ritual. In a world saturated
            with mass-produced fragrances diluted to meet margins, we chose a
            different path.
          </p>
          <p className="leading-relaxed text-text-muted">
            We believe scent is the most intimate form of self-expression. It
            lingers in rooms after you leave, evokes memories you thought were
            forgotten, and announces your presence before you speak. Such a
            medium deserves reverence, not compromise.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
            Our Mission
          </h2>
          <p className="leading-relaxed text-text-muted">
            Misk Lume crafts handcrafted, oil-based fragrances distilled in
            small batches. Each scent is composed from the finest ingredients,
            blended with patience, and bottled with intention.
          </p>
          <p className="leading-relaxed text-text-muted">
            We do not chase trends. We do not cut corners. Every fragrance
            carries the weight of hours spent perfecting a single note, the
            confidence of unwavering standards, and the quiet luxury of
            knowing what you wear was made with care.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
            Our Values
          </h2>
          <p className="leading-relaxed text-text-muted">
            Three principles guide every decision we make at Misk Lume. They
            are not aspirations — they are non-negotiables.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <ValuePillar
            icon={<DropletIcon />}
            title="100% Pure Oil"
            description="Every fragrance is built on pure oil bases. No fillers, no synthetics masking the composition. What you wear is what was crafted."
          />
          <ValuePillar
            icon={<ConcentrationIcon />}
            title="High Concentration"
            description="Our formulas use the highest concentration of perfume oil allowed, ensuring longevity that extends from morning to well past midnight."
          />
          <ValuePillar
            icon={<RitualIcon />}
            title="Small Batch Ritual"
            description="Each batch is intentionally limited. This isn't scarcity for the sake of exclusivity — it's precision that mass production cannot replicate."
          />
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
            Get in Touch
          </h2>
          <p className="leading-relaxed text-text-muted">
            Whether you have a question, a collaboration idea, or simply want
            to share your experience with Misk Lume, we would love to hear
            from you.
          </p>
          <div className="flex flex-col gap-2 text-text-muted">
            <span>
              Email:{" "}
              <a
                href="mailto:misklume@gmail.com"
                className="text-accent-gold underline underline-offset-4 transition-colors hover:text-text-primary"
              >
                misklume@gmail.com
              </a>
            </span>
            <span>
              Phone:{" "}
              <span className="text-text-primary">+92 325 8685580</span>
            </span>
            <span>
              Address:{" "}
              <span className="text-text-primary">Karachi, Pakistan</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValuePillar({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center text-accent-gold">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl text-text-primary">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        {description}
      </p>
    </div>
  );
}

function DropletIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-10"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
    </svg>
  );
}

function ConcentrationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-10"
    >
      <path d="M12 2v6" />
      <path d="M8 6l4 4 4-4" />
      <circle cx="12" cy="14" r="6" />
      <path d="M9 14a3 3 0 0 0 6 0" />
    </svg>
  );
}

function RitualIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-10 w-10"
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
