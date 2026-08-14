import { cloudinaryUrl } from "@/lib/images";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Misk Lume",
    url: "https://misklume.com",
    logo: cloudinaryUrl("https://images.unsplash.com/photo-1615634260169-c994b9a33e3e", 1200),
    description: "Luxury perfumes and attars crafted with rare ingredients from around the world.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-325-8685580",
      contactType: "customer service",
      email: "misklume@gmail.com",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
    sameAs: [
      "https://www.facebook.com/share/1EZZNbC8hm/",
      "https://www.instagram.com/misklume",
      "https://www.tiktok.com/@misk.lume",
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ProductJsonLd({ product }: {
  product: { name: string; description: string; image: string; price: number; currency?: string; sku?: string; brand?: string; availability?: string; rating?: number; reviewCount?: number };
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "Misk Lume" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "PKR",
      availability: product.availability || "https://schema.org/InStock",
    },
    ...(product.rating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FaqJsonLd({ questions }: { questions: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
