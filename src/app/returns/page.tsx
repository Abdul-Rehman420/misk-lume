import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | Misk Lume",
  description:
    "Understand Misk Lume's return policy, including return windows, conditions, refund timelines, and exchange options.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <section className="flex min-h-[30vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary">
        <h1 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Return Policy
        </h1>
      </section>

      <section className="mx-auto max-w-4xl space-y-16 px-6 py-20">
        <ContentBlock
          title="Return Window"
          paragraphs={[
            "You may initiate a return within 14 days of receiving your order.",
            "Returns requested after this window cannot be accommodated, so we encourage you to inspect your purchase promptly.",
          ]}
        />

        <ContentBlock
          title="Conditions for Returns"
          paragraphs={[
            "Items must be unopened and unused, with all original packaging and seals intact.",
            "Proof of purchase — your order confirmation or receipt — is required for all returns.",
          ]}
        />

        <ContentBlock
          title="How to Initiate a Return"
          paragraphs={[
            "Email us at returns@misklume.com with your order number and reason for the return.",
            "Our team will review your request and provide return instructions, including the shipping address and any applicable guidelines.",
          ]}
        />

        <ContentBlock
          title="Refund Timeline"
          paragraphs={[
            "Refunds are processed within 5–7 business days after we receive and inspect the returned item.",
            "The refund will be credited to your original payment method. Bank processing times may vary.",
          ]}
        />

        <ContentBlock
          title="Exchanges"
          paragraphs={[
            "Exchanges are available if you wish to receive a different size of the same product.",
            "Contact us with your order number and the desired size, and we will arrange the exchange for you.",
          ]}
        />

        <ContentBlock
          title="Non-Returnable Items"
          paragraphs={[
            "Opened or used products cannot be returned unless they are defective or damaged upon arrival.",
            "This policy ensures the integrity and hygiene standards we uphold for all Misk Lume fragrances.",
          ]}
        />

        <ContentBlock
          title="Damaged or Wrong Items"
          paragraphs={[
            "If you receive a damaged item or the wrong product, please contact us within 48 hours of delivery.",
            "We will arrange a free replacement at no additional cost to you. Please include photos of any damage when reaching out.",
          ]}
        />
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
