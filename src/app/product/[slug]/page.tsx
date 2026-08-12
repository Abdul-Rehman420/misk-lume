import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import ProductActions from "@/components/product/ProductActions";
import ProductReviews from "@/components/product/ProductReviews";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/supabase/queries";
import { ProductJsonLd } from "@/components/ui/JsonLd";
import { normalizeBadge } from "@/lib/badge";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface ProductDetail {
  id: string; name: string; slug: string; gender: string; price: number; sale_price?: number;
  sku: string; rating: number; review_count: number; badge?: string; description: string;
  short_description: string; image_url: string; stock_quantity: number;
  categories: { name: string; slug: string };
  product_images: { image_url: string; is_primary: boolean }[];
  product_sizes: { size_ml: number; price: number; sale_price?: number; stock_quantity: number; is_active: boolean }[];
  fragrance_notes: { note_type: string; name: string; description: string }[];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.name} | Misk Lume`,
      description: product.short_description || product.description?.slice(0, 160),
      openGraph: { title: product.name, description: product.short_description, images: [{ url: product.image_url }] },
    };
  } catch {
    return { title: "Product | Misk Lume" };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: ProductDetail | null = null;
  let reviews: { rating: number; text: string; author: string; date: string }[] = [];
  let relatedProducts: {
    id: string; name: string; slug: string; price: number; sale_price?: number; gender: string;
    image_url: string; badge?: "new" | "sale" | "out-of-stock"; rating: number; review_count: number;
    categories: { name: string; slug: string };
  }[] = [];

  try {
    const dbProduct = await getProductBySlug(slug);
    if (dbProduct) {
      product = dbProduct as ProductDetail;
      const dbReviews = await getProductReviews(dbProduct.id);
      if (dbReviews && dbReviews.length > 0) {
        reviews = dbReviews.map((r) => ({
          rating: r.rating,
          text: r.text,
          author: (r.profiles as { full_name?: string } | null)?.full_name || "Anonymous",
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        }));
      }
      const dbRelated = await getRelatedProducts(dbProduct.id);
      if (dbRelated && dbRelated.length > 0) {
        relatedProducts = dbRelated.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          sale_price: p.sale_price,
          gender: p.gender,
          image_url: p.image_url || "",
          badge: normalizeBadge(p.badge),
          rating: p.rating,
          review_count: p.review_count,
          categories: p.categories,
        }));
      }
    }
  } catch {}

  if (!product) notFound();

  const allImages = product.product_images?.length > 0 ? product.product_images : [{ image_url: product.image_url, is_primary: true }];
  const notes = { top: product.fragrance_notes?.find((n) => n.note_type === "top"), middle: product.fragrance_notes?.find((n) => n.note_type === "middle"), base: product.fragrance_notes?.find((n) => n.note_type === "base") };
  const activeSizes = product.product_sizes?.filter((s) => s.is_active) || [];

  return (
    <>
      <ProductJsonLd product={{
        name: product.name,
        description: product.short_description || product.description?.slice(0, 160) || "",
        image: product.image_url,
        price: product.sale_price || product.price,
        sku: product.sku,
        rating: product.rating,
        reviewCount: product.review_count,
        availability: product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      }} />
      <div className="min-h-svh bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-dim">
          <Link href="/" className="transition-colors hover:text-accent-gold">Home</Link>
          <span>/</span>
          <Link href="/shop" className="transition-colors hover:text-accent-gold">Shop</Link>
          <span>/</span>
          <span className="text-text-muted">{product.gender}</span>
          <span>/</span>
          <span className="text-text-primary">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <ProductActions
            productId={product.id}
            name={product.name}
            slug={product.slug}
            gender={product.gender}
            price={product.price}
            salePrice={product.sale_price}
            imageUrl={product.image_url}
            images={allImages}
            sizes={activeSizes}
            stockQuantity={product.stock_quantity || 0}
          />
        </div>
      </section>

      {notes.top && notes.middle && notes.base && (
        <section className="border-y border-border bg-bg-surface/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Scent Profile</span>
              <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">Fragrance Notes</h2>
              <div className="mx-auto mt-4 h-px w-[60px] bg-accent-gold" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {([
                { key: "top" as const, label: "Top Notes" },
                { key: "middle" as const, label: "Middle Notes" },
                { key: "base" as const, label: "Base Notes" },
              ]).map(({ key, label }) => (
                <div key={key} className="border-t-2 border-accent-gold pt-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">{label}</span>
                  <h3 className="mt-3 font-display text-xl text-text-primary">{notes[key]!.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">{notes[key]!.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 font-display text-2xl font-medium text-text-primary">Description</h2>
        <div className="max-w-3xl space-y-6">
          {(product.description || "").split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-text-muted">{paragraph}</p>
          ))}
        </div>
      </section>

      <ProductReviews
        productId={product.id}
        productName={product.name}
        productRating={product.rating}
        reviewCount={product.review_count}
        initialReviews={reviews}
      />

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">You May Also Like</span>
            <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">Related Products</h2>
            <div className="mx-auto mt-4 h-px w-[60px] bg-accent-gold" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.slug}
                productId={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                salePrice={p.sale_price}
                gender={p.gender}
                imageUrl={p.image_url}
                badge={p.badge}
                rating={p.rating}
                reviewCount={p.review_count}
              />
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
