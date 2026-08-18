import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | Misk Lume",
  description:
    "Learn about Misk Lume's shipping coverage, delivery timelines, and tracking options across Pakistan.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
      <section className="flex min-h-[30vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary">
        <h1 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Shipping Policy
        </h1>
      </section>

      <section className="mx-auto max-w-4xl space-y-16 px-6 py-20">
        <ContentBlock
          title="Shipping Coverage"
          paragraphs={[
            "Misk Lume ships exclusively within Pakistan, delivering our luxury fragrances to your doorstep with care.",
            "A flat rate of PKR 200 applies to all orders. Orders above PKR 8,000 enjoy complimentary shipping — our way of thanking you for choosing Misk Lume.",
          ]}
        />

        <ContentBlock
          title="Delivery Timeline"
          paragraphs={[
            "Standard delivery takes 5–6 business days from the date of order confirmation.",
            "All shipments are handled by PostEx, a trusted logistics partner, ensuring your package arrives safely and on time.",
          ]}
        />

        <ContentBlock
          title="Order Processing"
          paragraphs={[
            "Orders are processed within 1–2 business days of placement. You will receive an SMS and email confirmation once your order has been dispatched.",
            "Processing times may be slightly extended during promotional periods or holidays. We appreciate your patience.",
          ]}
        />

        <ContentBlock
          title="Tracking Your Order"
          paragraphs={[
            "A PostEx tracking number is sent to you via SMS and email once your order is on its way.",
            "Use the tracking number on the PostEx website or app to monitor your delivery in real time.",
          ]}
        />

        <ContentBlock
          title="Restricted Areas"
          paragraphs={[
            "Deliveries to remote or hard-to-reach areas may require an additional 1–2 business days.",
            "If you experience a delay beyond the estimated timeline, please reach out to our support team for assistance.",
          ]}
        />

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-8">
          <h3 className="font-display text-xl text-accent-gold">
            Need Help?
          </h3>
          <p className="mt-3 text-text-muted">
            For shipping inquiries, contact us at{" "}
            <a
              href="mailto:misklume@gmail.com"
              className="text-accent-gold underline underline-offset-4 transition-colors hover:text-text-primary"
            >
              misklume@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

function ContentBlock({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i} className="leading-relaxed text-text-muted">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
