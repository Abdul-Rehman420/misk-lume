import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ui/ProductCard";
import { getBestSellerProducts } from "@/lib/supabase/queries";
import { normalizeBadge } from "@/lib/badge";

export const metadata: Metadata = {
  title: "Best Sellers | Misk Lume",
  description: "Shop Misk Lume's most-loved fragrances — the best-selling perfumes and attars our customers keep coming back to.",
};

export default async function BestSellersPage() {
  let products: {
    id: string; name: string; slug: string; price: number; sale_price?: number; gender: string;
    image_url: string; badge?: "new" | "sale" | "out-of-stock"; rating: number; review_count: number;
  }[] = [];

  try {
    const dbProducts = await getBestSellerProducts(24);
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        sale_price: p.sale_price ?? undefined,
        gender: p.gender,
        image_url: p.product_images?.find((img: { is_primary?: boolean }) => img.is_primary)?.image_url || p.image_url || "",
        badge: normalizeBadge(p.badge),
        rating: p.rating,
        review_count: p.review_count,
      }));
    }
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-dim">
        <Link href="/" className="transition-colors hover:text-accent-gold">Home</Link>
        <span>/</span>
        <Link href="/shop" className="transition-colors hover:text-accent-gold">Shop</Link>
        <span>/</span>
        <span className="text-text-primary">Best Sellers</span>
      </nav>
      <h1 className="sr-only">Best Sellers</h1>

      <div className="mt-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Most Loved</span>
        <p className="mt-2 font-display text-3xl font-medium text-text-primary md:text-4xl">Best Sellers</p>
        <p className="mt-2 text-sm text-text-muted">Our most-loved fragrances, hand-picked by the Misk Lume team.</p>
      </div>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              productId={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              salePrice={product.sale_price}
              gender={product.gender}
              imageUrl={product.image_url}
              badge={product.badge}
              rating={product.rating}
              reviewCount={product.review_count}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-md border border-border bg-bg-surface p-12 text-center">
          <p className="text-text-muted">No best sellers yet. Check back soon.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm text-accent-gold hover:text-accent-gold-hover">Browse all products</Link>
        </div>
      )}
    </div>
  );
}
