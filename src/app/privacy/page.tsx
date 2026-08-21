import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Misk Lume",
  description:
    "Learn how Misk Lume collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-svh bg-bg-primary text-text-primary">
      <section className="flex min-h-[30vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary">
        <h1 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Privacy Policy
        </h1>
      </section>

      <section className="mx-auto max-w-4xl space-y-16 px-6 py-20">
        <p className="text-sm text-text-dim">
          Effective Date: January 1, 2025
        </p>

        <ContentBlock
          title="Information We Collect"
          paragraphs={[
            "When you visit Misk Lume, we may collect personal information you voluntarily provide, including your name, email address, phone number, and shipping address when placing an order.",
            "We also automatically collect certain technical data, such as your IP address, browser type, device information, and browsing behavior through cookies and similar technologies.",
          ]}
        />

        <ContentBlock
          title="How We Use Your Information"
          paragraphs={[
            "We use your personal information to process and fulfill orders, communicate order updates, and provide customer support.",
            "Technical data helps us analyze website performance, improve user experience, and tailor our marketing efforts to better serve you.",
          ]}
        />

        <ContentBlock
          title="Third-Party Sharing"
          paragraphs={[
            "We share your information with trusted third-party service providers who assist in operating our website, processing payments, and delivering orders.",
            "These providers are contractually obligated to protect your data and use it solely for the services they provide to us.",
            "We do not sell, rent, or trade your personal information to unrelated third parties for their marketing purposes.",
          ]}
        />

        <ContentBlock
          title="Data Security"
          paragraphs={[
            "We implement industry-standard security measures, including SSL encryption, to protect your personal information during transmission and storage.",
            "While we take every reasonable precaution, no method of electronic transmission or storage is completely secure. We cannot guarantee absolute data security.",
          ]}
        />

        <ContentBlock
          title="Your Rights"
          paragraphs={[
            "You have the right to access and correct your personal information held by us.",
            "To exercise these rights, please contact us at misklume@gmail.com. We will respond to your request within a reasonable timeframe.",
            "You may also request a copy of all personal data we hold about you in a structured, commonly used format.",
          ]}
        />

        <ContentBlock
          title="Policy Updates"
          paragraphs={[
            "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.",
            "The updated policy will be posted on this page with a revised effective date. We encourage you to review this policy periodically.",
          ]}
        />

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-8">
          <h3 className="font-display text-xl text-accent-gold">
            Questions About Your Privacy?
          </h3>
          <p className="mt-3 text-text-muted">
            Contact us at{" "}
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
