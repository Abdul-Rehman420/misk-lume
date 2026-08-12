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
              <InfoCard label="Phone" value="+92 300 1234567" href="tel:+923001234567" />
              <InfoCard
                label="Address"
                value="Karachi, Pakistan"
              />
              <InfoCard label="Hours" value="Mon – Sat, 10am – 6pm" />
            </div>

            <div className="mt-8">
              <h3 className="font-display text-lg text-text-primary">
                Follow Us
              </h3>
              <div className="mt-4 flex gap-4">
                <SocialLink href="#" label="Instagram">
                  <InstagramIcon />
                </SocialLink>
                <SocialLink href="#" label="Facebook">
                  <FacebookIcon />
                </SocialLink>
                <SocialLink href="#" label="Twitter">
                  <TwitterIcon />
                </SocialLink>
              </div>
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

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-muted transition-colors hover:border-accent-gold/40 hover:text-accent-gold"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 4l11.733 16H20L8.267 4z" />
      <path d="M4 20l6.768-6.768" />
      <path d="M20 4l-6.768 6.768" />
    </svg>
  );
}
