import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import { getCollectionBySlug } from "@/lib/supabase/queries";
import type { Metadata } from "next";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

interface CollectionDetail {
  name: string; slug: string; description: string; image_url: string;
  products: { id: string; name: string; slug: string; price: number; image_url: string; gender: string; rating: number; review_count: number; categories: { name: string; slug: string } }[];
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await getCollectionBySlug(slug);
    return {
      title: `${collection?.name || "Collection"} | Misk Lume`,
      description: collection?.description,
    };
  } catch {
    return { title: "Collection | Misk Lume" };
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  let collection: CollectionDetail | null = null;

  try {
    const dbCollection = await getCollectionBySlug(slug);
    if (dbCollection) {
      collection = {
        name: dbCollection.name,
        slug: dbCollection.slug,
        description: dbCollection.description || "",
        image_url: dbCollection.image_url || "",
        products: (dbCollection.collection_products || [])
          .filter((cp: { products?: { name: string; slug: string; price: number } }) => cp.products)
          .map((cp: { products: { id: string; name: string; slug: string; price: number; image_url?: string; gender?: string; rating?: number; review_count?: number; categories?: { name: string; slug: string } } }) => ({
            id: cp.products.id,
            name: cp.products.name,
            slug: cp.products.slug,
            price: cp.products.price,
            image_url: cp.products.image_url || "",
            gender: cp.products.gender || "",
            rating: cp.products.rating || 0,
            review_count: cp.products.review_count || 0,
            categories: cp.products.categories || { name: "", slug: "" },
          })),
      };
    }
  } catch {}

  if (!collection) notFound();

  return (
    <div className="min-h-svh bg-bg-primary">
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <Image src={collection.image_url} alt={collection.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 -mt-32 relative z-10 pb-20">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-text-dim">
          <Link href="/" className="transition-colors hover:text-accent-gold">Home</Link>
          <span>/</span>
          <Link href="/collections" className="transition-colors hover:text-accent-gold">Collections</Link>
          <span>/</span>
          <span className="text-text-muted">{collection.name}</span>
        </nav>

        <h1 className="font-display text-4xl font-medium text-text-primary md:text-5xl">
          {collection.name}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">
          {collection.description}
        </p>

        {collection.products.length > 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {collection.products.map((product) => (
              <ProductCard
                key={product.slug}
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                gender={product.gender}
                imageUrl={product.image_url}
                rating={product.rating}
                reviewCount={product.review_count}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-md border border-border bg-bg-surface p-12 text-center">
            <p className="text-text-muted">This collection is being curated. Check back soon.</p>
            <div className="mt-4">
              <Link href="/shop"><Button variant="outline">Browse All Products</Button></Link>
            </div>
          </div>
        )}

        <div className="mt-16 border-t border-border pt-8">
          <Link href="/collections" className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-gold">
            ← Back to Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
