import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Misk Lume",
  description:
    "Get in touch with Misk Lume for inquiries, order support, wholesale opportunities, or press collaborations.",
};

export default function ContactPage() {
  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
      <section className="flex min-h-[30vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary">
        <h1 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Get in Touch
        </h1>
      </section>

      <section className="mx-auto max-w-6xl space-y-20 px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
              Send Us a Message
            </h2>
            <p className="mt-3 text-text-muted">
              We aim to respond to all inquiries within 24 hours.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
              Contact Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard
                label="Email"
                value="misklume@gmail.com"
                href="mailto:misklume@gmail.com"
              />
              <InfoCard label="Phone" value="+92 325 8685580" href="tel:+923258685580" />
              <InfoCard
                label="Address"
                value="Karachi, Pakistan"
              />
              <InfoCard label="Hours" value="Mon – Sat, 10am – 6pm" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-text-dim">
        {label}
      </p>
      <p className="mt-2 text-text-primary">{value}</p>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="transition-colors hover:border-accent-gold/40"
      >
        {content}
      </a>
    );
  }

  return content;
}
