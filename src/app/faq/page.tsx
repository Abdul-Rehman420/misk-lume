import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import { FaqJsonLd } from "@/components/ui/JsonLd";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "FAQ | Misk Lume",
  description:
    "Find answers to frequently asked questions about Misk Lume fragrances, orders, payments, and returns.",
};

const faqData = {
  Products: [
    {
      question: "What makes Misk Lume fragrances different?",
      answer:
        "Every Misk Lume fragrance is oil-based, handcrafted, and distilled in small batches. We use 100% pure perfume oil with no fillers, ensuring a high concentration that delivers exceptional longevity and depth.",
    },
    {
      question: "Are your fragrances oil-based or alcohol-based?",
      answer:
        "All Misk Lume fragrances are oil-based. Oil-based formulas sit closer to the skin, evolve more naturally with your body chemistry, and last significantly longer than alcohol-based alternatives.",
    },
    {
      question: "How long does each fragrance last?",
      answer:
        "Due to our high concentration of pure perfume oil, Misk Lume fragrances typically last 8–12 hours on skin. On clothing, the scent can linger for several days.",
    },
    {
      question: "Are your products cruelty-free?",
      answer:
        "Yes. Misk Lume is committed to ethical production. None of our products are tested on animals, and we source ingredients responsibly.",
    },
    {
      question: "Can I layer different Misk Lume fragrances?",
      answer:
        "Absolutely. Our fragrances are designed to complement each other. Experiment with layering to create your own signature scent profile.",
    },
  ],
  "Orders & Shipping": [
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery takes 4–5 business days within Pakistan. Remote areas may require an additional 1–2 business days.",
    },
    {
      question: "Is there a shipping fee?",
      answer:
        `A flat rate of PKR ${SHIPPING_COST} applies to all orders. Orders above PKR ${FREE_SHIPPING_THRESHOLD.toLocaleString()} qualify for free shipping.`,
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently, Misk Lume ships within Pakistan only. We are working on expanding our reach and will update our community when international shipping becomes available.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is dispatched, you will receive a PostEx tracking number via SMS and email. You can use this to monitor your delivery in real time.",
    },
    {
      question: "Can I modify my order after placing it?",
      answer:
        "Order modifications may be possible if the order has not yet been processed. Contact us at misklume@gmail.com with your order number as soon as possible.",
    },
  ],
  Payments: [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit and debit cards, as well as cash on delivery (COD) for orders within Pakistan.",
    },
    {
      question: "Is my payment information secure?",
      answer:
        "Yes. All transactions are processed through encrypted, PCI-compliant payment gateways. We never store your card details on our servers.",
    },
    {
      question: "Do you offer installment plans?",
      answer:
        "Currently, we do not offer installment or buy-now-pay-later options. We are evaluating this for future availability.",
    },
  ],
  "Returns & Exchanges": [
    {
      question: "Can I return a product if I don't like the scent?",
      answer:
        "We accept returns within 14 days of delivery for unopened products in their original packaging. Opened products cannot be returned unless they are defective.",
    },
    {
      question: "How do I initiate a return?",
      answer:
        "Email returns@misklume.com with your order number and reason for the return. Our team will provide instructions within 24 hours.",
    },
    {
      question: "How long does a refund take?",
      answer:
        "Refunds are processed within 5–7 business days after we receive and inspect the returned item. The refund is credited to your original payment method.",
    },
    {
      question: "Can I exchange for a different fragrance?",
      answer:
        "Exchanges are available for the same product if it arrives damaged or defective. For fragrance swaps, we recommend reaching out to discuss your options with our team.",
    },
  ],
} as const;

type Category = keyof typeof faqData;

export default function FaqPage() {
  const categories = Object.keys(faqData) as Category[];

  const allQuestions = Object.values(faqData).flat();

  return (
    <>
      <FaqJsonLd questions={allQuestions} />
      <div className="min-h-svh bg-bg-primary text-text-primary">
      <section className="flex min-h-[30vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary">
        <h1 className="font-display text-4xl tracking-wide md:text-5xl lg:text-6xl">
          Frequently Asked Questions
        </h1>
      </section>

      <section className="mx-auto max-w-3xl space-y-16 px-6 py-20">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="font-display text-2xl text-accent-gold md:text-3xl">
              {category}
            </h2>
            <div className="mt-6 divide-y divide-border-subtle rounded-lg border border-border-subtle bg-bg-surface">
              {faqData[category].map((item, i) => (
                <FaqAccordion
                  key={i}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-10 text-center">
          <h3 className="font-display text-xl text-text-primary">
            Still Have Questions?
          </h3>
          <p className="mt-2 text-text-muted">
            We are here to help. Reach out and we will get back to you promptly.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-lg bg-accent-gold px-8 py-3 font-body text-sm font-medium uppercase tracking-[0.15em] text-bg-primary transition-colors hover:bg-accent-gold/90"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
