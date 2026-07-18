import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { getProducts } from "@/lib/supabase/queries";

const fallbackAttarProducts = [
  { name: "Saffron Ember Attar", slug: "saffron-ember-attar", price: 5200, gender: "Unisex", image_url: "/images/attar-saffron.jpg", badge: "new" as const, description: "A warm, smoky attar blending Persian saffron with rich amber and a whisper of leather." },
  { name: "Musk Absolute Attar", slug: "musk-absolute-attar", price: 5800, gender: "Unisex", image_url: "/images/attar-musk.jpg", description: "Pure white musk distilled to its essence — clean, soft, and deeply intimate." },
  { name: "Oud Al Misk Attar", slug: "oud-al-misk-attar", price: 7500, gender: "Unisex", image_url: "/images/attar-oud-misk.jpg", description: "Our signature blend of Cambodian oud and deer musk, aged for three years in sandalwood." },
  { name: "Cedarwood Atlas Attar", slug: "cedarwood-atlas-attar", price: 4200, gender: "Men", image_url: "/images/attar-cedar.jpg", description: "Earthy Atlas cedarwood meets vetiver and a touch of black pepper for a grounding scent." },
  { name: "Tobacco Roi Attar", slug: "tobacco-roi-attar", price: 4800, gender: "Men", image_url: "/images/attar-tobacco.jpg", description: "Rich tobacco leaf infused with honeyed dates and a smoky vanilla finish." },
  { name: "Iris Dusk Attar", slug: "iris-dusk-attar", price: 3400, sale_price: 4000, gender: "Women", image_url: "/images/attar-iris.jpg", badge: "sale" as const, description: "Delicate iris root blended with powdery violet and a hint of cold suede." },
];

const ritualSteps = [
  {
    number: "1",
    title: "Pulse Points",
    description: "Apply attar to your pulse points — wrists, behind the ears, and the base of the throat. The warmth of your blood vessels will diffuse the fragrance naturally throughout the day.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Don't Rub",
    description: "Never rub attar into your skin. Gently dab or press the applicator against the pulse point. Rubbing generates heat that breaks down the delicate fragrance molecules.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Less is More",
    description: "Pure attar oil is highly concentrated. A single drop is often enough. Start small and build up if needed — subtlety is the hallmark of a true connoisseur.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export default async function AttarPage() {
  let attarProducts = fallbackAttarProducts;

  try {
    const dbProducts = await getProducts({ category: "attar", limit: 20 });
    if (dbProducts && dbProducts.length > 0) {
      attarProducts = dbProducts.map((p) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        sale_price: p.sale_price,
        gender: p.gender,
        image_url: p.image_url || p.product_images?.[0]?.image_url || "",
        badge: p.badge,
        description: p.short_description || p.description?.slice(0, 120) || "",
      }));
    }
  } catch {}

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary px-4">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Pure Oil Fragrances</span>
          <h1 className="mt-4 font-display text-4xl font-medium text-text-primary md:text-5xl">
            The Art of <span className="italic text-accent-gold">Attar</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
            Pure, oil-based fragrances rooted in centuries of Arabian and South Asian tradition.
          </p>
        </div>
      </section>

      {/* What is Attar */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bg-elevated">
            <img src="/images/attar-heritage.jpg" alt="Traditional attar making" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Heritage</span>
            <h2 className="font-display text-3xl font-medium text-text-primary">What is <span className="italic text-accent-gold">Attar</span>?</h2>
            <p className="text-sm leading-relaxed text-text-muted">
              Attar (also known as ittar) is a pure, oil-based perfume concentrate that has been crafted for over a thousand years across the Arabian Peninsula, Persia, and the Indian subcontinent. Unlike modern alcohol-based perfumes, attar is distilled from natural ingredients — flowers, herbs, resins, and woods — using traditional methods passed down through generations of master distillers.
            </p>
            <p className="text-sm leading-relaxed text-text-muted">
              The word &quot;attar&quot; derives from the Persian word for &quot;essence.&quot; Each bottle captures the purest expression of its source material, whether it is the delicate petals of a Damask rose, the precious heart of oud wood, or the earthy richness of vetiver root.
            </p>
            <p className="text-sm leading-relaxed text-text-muted">
              Today, attar holds a revered place in both traditional Middle Eastern culture and the modern luxury fragrance world. Its concentration means a single application can last for hours, and its alcohol-free formula makes it gentle on the skin — a timeless choice for those who appreciate depth, purity, and artistry in their scent.
            </p>
          </div>
        </div>
      </section>

      {/* Attar Products */}
      <section className="bg-bg-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="Our Attars" title="Pure Oil Collection" />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {attarProducts.map((attar) => (
              <div key={attar.slug} className="flex flex-col">
                <ProductCard
                  name={attar.name}
                  slug={attar.slug}
                  price={attar.price}
                  salePrice={attar.sale_price}
                  gender={attar.gender}
                  imageUrl={attar.image_url}
                  badge={attar.badge}
                />
                {attar.description && <p className="mt-3 px-1 text-xs leading-relaxed text-text-dim">{attar.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Apply Attar */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader label="Ritual" title="How to Apply Attar" />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {ritualSteps.map((step) => (
              <div key={step.number} className="rounded-md border border-border bg-bg-surface p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated text-accent-gold">
                  {step.icon}
                </div>
                <h3 className="mt-5 font-display text-lg font-medium text-text-primary">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
