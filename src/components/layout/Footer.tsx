import Link from "next/link";

const shopLinks = [
  { label: "All Perfumes", href: "/shop" },
  { label: "Best Sellers", href: "/shop/best-sellers" },
  { label: "New Arrivals", href: "/shop/new-arrivals" },
  { label: "Attar Collection", href: "/attar" },
  { label: "Gift Sets", href: "/gift-sets" },
];

const companyLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Contact Us", href: "/contact" },
];

const policyLinks = [
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Return Policy", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-primary">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-text-muted transition-colors hover:text-accent-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-0">
              <span className="font-display text-2xl font-semibold text-text-primary">
                Misk
              </span>
              <span className="font-display text-2xl font-semibold text-accent-gold">
                Lume
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
              Luxurious fragrances crafted with rare ingredients from around the
              world. Each scent tells a story of elegance and timeless beauty.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all hover:border-accent-gold hover:text-accent-gold"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all hover:border-accent-gold hover:text-accent-gold"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-text-muted transition-all hover:border-accent-gold hover:text-accent-gold"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <FooterLinkGroup title="Shop" links={shopLinks} />

          {/* Company */}
          <FooterLinkGroup title="Company" links={companyLinks} />

          {/* Policies */}
          <FooterLinkGroup title="Policies" links={policyLinks} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-text-dim">
            &copy; {new Date().getFullYear()} Misk Lume. All rights reserved.
          </p>
          <p className="text-xs text-text-dim">
            Crafted with care in Pakistan.
          </p>
        </div>
      </div>
    </footer>
  );
}
