import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import ReviewCard from "@/components/ui/ReviewCard";
import Button from "@/components/ui/Button";
import ProductActions from "@/components/product/ProductActions";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/supabase/queries";
import { ProductJsonLd } from "@/components/ui/JsonLd";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const fallbackProduct: Record<string, {
  id: string; name: string; slug: string; gender: string; price: number; sale_price?: number;
  sku: string; rating: number; review_count: number; badge?: string; description: string;
  short_description: string; image_url: string; stock_quantity: number;
  categories: { name: string; slug: string };
  product_images: { image_url: string; is_primary: boolean }[];
  product_sizes: { size_ml: number; price: number; sale_price?: number; stock_quantity: number; is_active: boolean }[];
  fragrance_notes: { note_type: string; name: string; description: string }[];
}> = {
  "noir-oud": {
    id: "1", name: "Noir Oud", slug: "noir-oud", gender: "Unisex", price: 4500, sku: "ML-NO-001", rating: 5, review_count: 47,
    image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80",
    short_description: "A deep, intoxicating blend of rare oud wood and smoky black pepper, grounded by warm amber and sandalwood.",
    description: "Noir Oud is a masterful composition that draws from the ancient art of oud distillation. Sourced from the finest agarwood forests of Assam, each drop carries the depth of centuries-old tradition reimagined for the modern connoisseur.\n\nThe opening is bold — a cascade of crushed black pepper intertwined with sun-drenched bergamot. As the scent settles, a heart of aged oud and earthy vetiver emerges.\n\nThe dry-down is where Noir Oud truly reveals its soul. A velvety blanket of amber and creamy sandalwood lingers on the skin for hours.",
    stock_quantity: 8, categories: { name: "Unisex", slug: "unisex" },
    product_images: [
      { image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80", is_primary: true },
      { image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80", is_primary: false },
      { image_url: "https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=800&q=80", is_primary: false },
      { image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80", is_primary: false },
    ],
    product_sizes: [
      { size_ml: 6, price: 2500, stock_quantity: 20, is_active: true },
      { size_ml: 12, price: 4500, stock_quantity: 8, is_active: true },
      { size_ml: 25, price: 7500, stock_quantity: 3, is_active: true },
    ],
    fragrance_notes: [
      { note_type: "top", name: "Black Pepper & Bergamot", description: "A sharp, energizing opening that awakens the senses with warm spice and bright citrus zest." },
      { note_type: "middle", name: "Oud & Vetiver", description: "The intoxicating heart of aged agarwood and smoky vetiver forms the soul of this composition." },
      { note_type: "base", name: "Amber & Sandalwood", description: "A warm, enveloping base that lingers for hours — rich amber softened by creamy sandalwood." },
    ],
  },
  "velvet-rose": {
    id: "2", name: "Velvet Rose", slug: "velvet-rose", gender: "Women", price: 3800, sale_price: 3200, sku: "ML-VR-002", rating: 4.8, review_count: 32, badge: "new",
    image_url: "https://images.unsplash.com/photo-1541643600914-78b084683641?w=800&q=80",
    short_description: "An opulent rose attar blended with dark berries and a whisper of oud, designed for the modern woman who embraces elegance.",
    description: "Velvet Rose captures the essence of Damascena roses at dawn, when their petals are still heavy with morning dew.\n\nThe opening is a lush burst of Turkish rose and wild berries. As it evolves, a heart of velvety rose absolute deepens, enriched by subtle oud undertones.\n\nThe base of vanilla, musk, and soft sandalwood provides a warm, sensual foundation.",
    stock_quantity: 15, categories: { name: "Women", slug: "women" },
    product_images: [
      { image_url: "https://images.unsplash.com/photo-1541643600914-78b084683641?w=800&q=80", is_primary: true },
      { image_url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80", is_primary: false },
    ],
    product_sizes: [
      { size_ml: 6, price: 1800, stock_quantity: 25, is_active: true },
      { size_ml: 12, price: 3200, stock_quantity: 15, is_active: true },
      { size_ml: 25, price: 5500, stock_quantity: 5, is_active: true },
    ],
    fragrance_notes: [
      { note_type: "top", name: "Rose & Wild Berries", description: "Fresh Damascena rose petals meet a burst of wild berries for a vibrant opening." },
      { note_type: "middle", name: "Oud & Geranium", description: "Rose absolute intertwines with geranium and a touch of oud." },
      { note_type: "base", name: "Vanilla & Musk", description: "Warm vanilla and soft musk create a sensual, lingering finish." },
    ],
  },
};

const fallbackRelated = [
  { name: "Oud Royale", slug: "oud-royale", price: 5200, sale_price: undefined, gender: "Men", image_url: "https://images.unsplash.com/photo-1594035910387-fbd19f49d066?w=400&q=80", badge: "new" as const, rating: 4.9, review_count: 23, categories: { name: "Men", slug: "men" } },
  { name: "Saffron Bloom", slug: "saffron-bloom", price: 4100, sale_price: undefined, gender: "Unisex", image_url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80", rating: 4.7, review_count: 18, categories: { name: "Unisex", slug: "unisex" } },
  { name: "Velvet Rose", slug: "velvet-rose", price: 3200, sale_price: undefined, gender: "Women", image_url: "https://images.unsplash.com/photo-1541643600914-78b084683641?w=400&q=80", badge: "new" as const, rating: 4.8, review_count: 32, categories: { name: "Women", slug: "women" } },
  { name: "Amber Noir", slug: "amber-noir", price: 3600, sale_price: undefined, gender: "Unisex", image_url: "https://images.unsplash.com/photo-1615634260169-c994b9a33e3e?w=400&q=80", rating: 4.6, review_count: 15, categories: { name: "Unisex", slug: "unisex" } },
];

const fallbackReviews = [
  { rating: 5, text: "Absolutely mesmerizing. The oud is deep and authentic — not synthetic at all. Lasts a full 12 hours on my skin.", author: "Ahmed K.", date: "March 2026" },
  { rating: 5, text: "I have been collecting attars for over a decade, and Noir Oud is easily in my top 3.", author: "Fatima R.", date: "February 2026" },
];

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

  let product = fallbackProduct[slug] || null;
  let reviews = fallbackReviews;
  let relatedProducts = fallbackRelated;

  try {
    const dbProduct = await getProductBySlug(slug);
    if (dbProduct) {
      product = dbProduct as typeof product;
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
          name: p.name,
          slug: p.slug,
          price: p.price,
          sale_price: p.sale_price,
          gender: p.gender,
          image_url: p.image_url || "",
          badge: p.badge,
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

  function StarIcon({ filled }: { filled: boolean }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`h-4 w-4 ${filled ? "text-accent-gold" : "text-text-dim"}`}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }

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
      <div className="min-h-screen bg-bg-primary">
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

      <section className="border-t border-border bg-bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Testimonials</span>
              <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">Customer Reviews</h2>
            </div>
            <Button variant="outline" className="mt-4 sm:mt-0">Write a Review</Button>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <span className="font-display text-6xl font-medium text-text-primary">{product.rating || 0}</span>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? "text-accent-gold" : "text-text-dim"}`}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-sm text-text-muted">{product.review_count || 0} reviews</p>
              <div className="mt-8 w-full max-w-xs space-y-2">
                {(() => {
                  const total = reviews.length || 1;
                  const dist = [5, 4, 3, 2, 1].map((stars) => ({
                    stars,
                    pct: Math.round((reviews.filter((r) => r.rating === stars).length / total) * 100),
                  }));
                  return dist.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3">
                      <span className="w-3 text-right text-xs text-text-dim">{row.stars}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-accent-gold"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated"><div className="h-full rounded-full bg-accent-gold" style={{ width: `${row.pct}%` }} /></div>
                      <span className="w-8 text-right text-xs text-text-dim">{row.pct}%</span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              {reviews.map((review, i) => (
                <ReviewCard key={i} rating={review.rating} text={review.text} author={review.author} date={review.date} />
              ))}
            </div>
          </div>
        </div>
      </section>

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
    </div>
    </>
  );
}
