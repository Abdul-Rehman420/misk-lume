import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Misk Lume",
  description:
    "Review the terms and conditions governing your use of the Misk Lume website and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <section className="flex min-h-[30vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary">
        <h1 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Terms of Service
        </h1>
      </section>

      <section className="mx-auto max-w-4xl space-y-16 px-6 py-20">
        <p className="text-sm text-text-dim">
          Effective Date: January 1, 2025
        </p>

        <ContentBlock
          title="Acceptance of Terms"
          paragraphs={[
            "By accessing or using the Misk Lume website, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using our website.",
            "We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the updated terms.",
          ]}
        />

        <ContentBlock
          title="Account Terms"
          paragraphs={[
            "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
            "You must be at least 18 years of age to create an account and place orders on Misk Lume.",
            "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.",
          ]}
        />

        <ContentBlock
          title="Ordering & Payment"
          paragraphs={[
            "All orders are subject to availability. We reserve the right to cancel or limit quantities at our discretion.",
            "Prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless otherwise stated.",
            "Payment must be completed in full before an order is processed. We accept major credit/debit cards and cash on delivery.",
          ]}
        />

        <ContentBlock
          title="Shipping & Delivery"
          paragraphs={[
            "Shipping terms are governed by our Shipping Policy, which is incorporated into these terms by reference.",
            "Misk Lume is not liable for delays caused by circumstances beyond our control, including natural disasters, strikes, or carrier disruptions.",
          ]}
        />

        <ContentBlock
          title="Intellectual Property"
          paragraphs={[
            "All content on this website — including text, images, logos, graphics, and designs — is the intellectual property of Misk Lume and is protected by applicable copyright and trademark laws.",
            "You may not reproduce, distribute, or create derivative works from any content on this website without prior written consent from Misk Lume.",
          ]}
        />

        <ContentBlock
          title="Product Descriptions"
          paragraphs={[
            "We strive to provide accurate descriptions and images of our products. However, slight variations in color or appearance may occur due to display settings.",
            "Fragrance notes and profiles are provided as general descriptions and may vary slightly between batches due to the artisanal nature of our production process.",
          ]}
        />

        <ContentBlock
          title="Limitation of Liability"
          paragraphs={[
            "Misk Lume shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products.",
            "Our total liability for any claim related to a product shall not exceed the purchase price of that product.",
          ]}
        />

        <ContentBlock
          title="Governing Law"
          paragraphs={[
            "These terms are governed by and construed in accordance with the laws of Pakistan.",
            "Any disputes arising from these terms shall be resolved in the courts of Karachi, Pakistan.",
          ]}
        />

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-8">
          <h3 className="font-display text-xl text-accent-gold">
            Questions?
          </h3>
          <p className="mt-3 text-text-muted">
            Contact us at{" "}
            <a
              href="mailto:info@misklume.com"
              className="text-accent-gold underline underline-offset-4 transition-colors hover:text-text-primary"
            >
              info@misklume.com
            </a>
          </p>
        </div>
      </section>
    </main>
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
