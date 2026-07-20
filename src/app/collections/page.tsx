import FeaturedCard from "@/components/ui/FeaturedCard";
import { getCollections } from "@/lib/supabase/queries";

const fallbackCollections = [
  {
    label: "Signature Collection",
    name: "The Noir Trio",
    description: "Three of our most iconic fragrances — Noir Oud, Noir Saffron, and Noir Musk — presented together in an exclusive gift box.",
    price: 9800,
    original_price: 12300,
    image_url: "/images/collection-noir-trio.jpg",
    slug: "noir-trio",
    reverse: false,
    tags: ["Noir Oud EDP", "Noir Saffron Parfum", "Noir Musk EDT"],
  },
  {
    label: "Floral Edit",
    name: "Rose Garden Set",
    description: "A curated trio of our finest rose-based fragrances. From the dewy freshness of Rose Dawn to the deep richness of Velvet Rose.",
    price: 8500,
    original_price: 10700,
    image_url: "/images/collection-rose.jpg",
    slug: "rose-garden",
    reverse: true,
    tags: ["Rose Dawn EDT", "Velvet Rose Parfum", "Rose Attar"],
  },
  {
    label: "Explorer Set",
    name: "The Discovery Kit",
    description: "New to Misk Lume? This kit includes six 2ml samples of our best-selling fragrances so you can find your signature scent.",
    price: 3500,
    image_url: "/images/collection-discovery.jpg",
    slug: "discovery-kit",
    reverse: false,
    tags: ["6 × 2ml Samples", "Variety Selection", "Travel Friendly"],
  },
  {
    label: "Gifting",
    name: "The Luxe Gift Box",
    description: "The ultimate gifting experience. A hand-crafted wooden box containing a full-size fragrance, a travel spray, and a scented candle.",
    price: 6500,
    image_url: "/images/collection-gift.jpg",
    slug: "luxe-gift",
    reverse: true,
    tags: ["Full-Size Fragrance", "Travel Spray", "Scented Candle"],
  },
];

export default async function CollectionsPage() {
  let collections = fallbackCollections;

  try {
    const dbCollections = await getCollections();
    if (dbCollections && dbCollections.length > 0) {
      collections = dbCollections.map((c, i) => ({
        label: c.description ? "Curated Set" : "Collection",
        name: c.name,
        description: c.description || "",
        price: c.price,
        original_price: c.original_price,
        image_url: c.image_url || fallbackCollections[i % fallbackCollections.length].image_url,
        slug: c.slug,
        reverse: i % 2 !== 0,
        tags: c.collection_products?.map((cp: { products?: { name?: string } }) => cp.products?.name || "").filter(Boolean) || [],
      }));
    }
  } catch {}

  return (
    <div className="min-h-screen bg-bg-primary">
      <section className="relative flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary px-4">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Curated Sets</span>
          <h1 className="mt-4 font-display text-4xl font-medium text-text-primary md:text-5xl">
            Our <span className="italic text-accent-gold">Collections</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
            Thoughtfully curated fragrance sets, designed to gift or to discover your next signature scent.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex flex-col gap-16">
          {collections.map((collection) => (
            <FeaturedCard
              key={collection.slug}
              label={collection.label}
              name={collection.name}
              description={collection.description}
              price={`PKR ${(collection.price || 0).toLocaleString()}`}
              originalPrice={collection.original_price ? `PKR ${collection.original_price.toLocaleString()}` : undefined}
              imageUrl={collection.image_url}
              href={`/collections/${collection.slug}`}
              reverse={collection.reverse}
            >
              {collection.tags && collection.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {collection.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border-subtle px-3 py-1 text-[10px] text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </FeaturedCard>
          ))}
        </div>
      </section>
    </div>
  );
}
