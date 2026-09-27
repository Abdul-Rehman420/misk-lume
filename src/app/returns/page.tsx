import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | Misk Lume",
  description:
    "Understand Misk Lume's return policy, including return windows, conditions, and refund timelines.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
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
            "Go ahead — open it and wear it. You have 2–3 days to try your fragrance, and if you don't love it, send it back.",
            "Items should be returned in reasonable condition. Proof of purchase — your order confirmation or receipt — is required for all returns.",
          ]}
        />

        <ContentBlock
          title="How to Initiate a Return"
          paragraphs={[
            "Email us at misklume@gmail.com with your order number and reason for the return.",
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
          title="Non-Returnable Items"
          paragraphs={[
            "If you've used a fragrance beyond the 2–3 day trial window, we're unable to accept the return.",
            "This policy helps us maintain the quality and hygiene standards of every Misk Lume fragrance while still giving you time to truly experience it.",
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
