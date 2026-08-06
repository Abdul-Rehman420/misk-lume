"use client";

import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import SectionReveal from "@/components/animations/SectionReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren from "@/components/animations/StaggerChildren";
import NewsletterForm from "@/components/ui/NewsletterForm";

interface Category {
  name: string;
  image: string;
  href: string;
  count: string;
}

interface BestSeller {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number | undefined;
  gender: string;
  image_url: string;
  badge?: "new" | "sale" | "out-of-stock" | undefined;
  rating: number;
  review_count: number;
}

interface Review {
  rating: number;
  text: string;
  author: string;
  date: string;
}

interface BlogPost {
  title: string;
  excerpt: string;
  image_url: string;
  slug: string;
  published_at: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function HomeContent({
  categories,
  bestSellers,
  reviews,
  blogPosts,
}: {
  categories: Category[];
  bestSellers: BestSeller[];
  reviews: Review[];
  blogPosts: BlogPost[];
}) {
  return (
    <>
      {/* Categories */}
      <SectionReveal className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeader label="Collections" title="Shop by Category" />
        <StaggerChildren className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group relative block aspect-[3/4] overflow-hidden rounded-md bg-bg-elevated">
              <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="font-display text-xl font-medium text-text-primary">{cat.name}</h3>
                {cat.count && <p className="mt-1 text-sm text-text-muted">{cat.count}</p>}
              </div>
            </Link>
          ))}
        </StaggerChildren>
      </SectionReveal>

      {/* Best Sellers */}
      <SectionReveal className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Most Loved" title="Best Sellers" />
          {bestSellers.length > 0 ? (
            <StaggerChildren className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {bestSellers.map((product) => (
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
            </StaggerChildren>
          ) : (
            <p className="mt-12 text-center text-sm text-text-muted">No best sellers yet. New fragrances will appear here.</p>
          )}
          <div className="mt-12 flex justify-center">
            <Link href="/shop">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </SectionReveal>

      {/* Discount Banner */}
      <ScrollReveal>
        <section className="relative overflow-hidden border-y border-border bg-[linear-gradient(135deg,#1a1510_0%,#0B0B0B_100%)] px-4 py-20 text-center">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(201,162,75,0.08)_0%,transparent_70%)]" />
          <div className="relative mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-medium text-text-primary md:text-4xl">
              First Order? <span className="text-accent-gold">15% Off</span>
            </h2>
            <p className="mt-4 text-sm text-text-muted">
              Use code <strong className="font-semibold tracking-wider text-accent-gold">RITUAL15</strong> at checkout. New members only.
            </p>
            <Link href="/shop" className="mt-8 inline-block">
              <Button variant="primary" size="lg">Shop Now</Button>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <ScrollReveal direction="left">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-bg-elevated">
              <Image src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80" alt="Misk Lume craftsmanship" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="flex flex-col gap-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Our Story</span>
              <h2 className="font-display text-3xl font-medium text-text-primary">
                Born from <em className="italic text-accent-gold">Obsession</em>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-text-muted">
                Misk Lume was founded on a single conviction: perfume should be a ritual, not a reflex. Every fragrance in our collection is handcrafted in small batches, using pure oil-based formulations that respect both the art of perfumery and the skin it graces.
              </p>
              <p className="max-w-md text-sm leading-relaxed text-text-muted">
                We source rare ingredients from oud forests to rose fields, distilling them with patience and precision. No shortcuts. No synthetics masking inferior base notes. Just honest, concentrated fragrance.
              </p>
              <div className="mt-2">
                <Link href="/about">
                  <Button variant="outline">Read More</Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <SectionReveal className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader label="The Difference" title="Why Choose Misk Lume" />
          <StaggerChildren className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-6 h-12 w-12 text-accent-gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-full w-full">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-medium text-text-primary">100% Pure Oil</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">Every fragrance is formulated with pure essential oils and absolutes. No alcohol base, no filler, no compromise on concentration or longevity.</p>
            </div>
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-6 h-12 w-12 text-accent-gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-full w-full">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-medium text-text-primary">High Concentration</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">Our oil-based perfumes carry 3-5x the concentration of typical alcohol-based sprays. A single application carries you through the entire day.</p>
            </div>
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="mb-6 h-12 w-12 text-accent-gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-full w-full">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-medium text-text-primary">Small Batch Ritual</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">Each batch is limited and numbered. When it&apos;s gone, we move to the next season&apos;s distillation. Exclusivity isn&apos;t a marketing tactic &mdash; it&apos;s our process.</p>
            </div>
          </StaggerChildren>
        </div>
      </SectionReveal>

      {/* Reviews */}
      <ScrollReveal>
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <SectionHeader label="Testimonials" title="What They Say" />
          {reviews.length === 0 ? (
            <p className="mt-12 text-center text-sm text-text-muted">No reviews yet. Shop our fragrances and be the first to share your experience.</p>
          ) : (
            <StaggerChildren className="mt-12 grid gap-6 md:grid-cols-3">
              {reviews.map((review, i) => (
                <div key={i} className="rounded-md border border-border-subtle bg-bg-surface p-8">
                  <div className="mb-4 flex gap-0.5 text-accent-gold">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <StarIcon key={s} />
                    ))}
                  </div>
                  <p className="mb-6 text-sm italic leading-relaxed text-text-muted">&ldquo;{review.text}&rdquo;</p>
                  <p className="text-sm font-semibold text-text-primary">{review.author}</p>
                  <p className="mt-1 text-xs text-text-dim">{review.date}</p>
                </div>
              ))}
            </StaggerChildren>
          )}
        </section>
      </ScrollReveal>

      {/* Blog Teaser */}
      <SectionReveal className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Journal" title="From the Blog" />
          <StaggerChildren className="mt-12 grid gap-6 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-md border border-border-subtle bg-bg-surface transition-all duration-300 hover:border-border">
                <div className="relative aspect-[16/9] overflow-hidden bg-bg-elevated">
                  <Image src={post.image_url} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  {post.published_at && <p className="mb-2 text-xs text-text-dim">{formatDate(post.published_at)}</p>}
                  <h3 className="font-display text-lg font-medium leading-tight text-text-primary transition-colors group-hover:text-accent-gold">{post.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent-gold">Read More →</span>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </SectionReveal>

      {/* Newsletter */}
      <ScrollReveal>
        <section className="bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">The Ritual</span>
            <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">Stay Informed</h2>
            <p className="mt-3 text-sm text-text-muted">Get the latest fragrance guides, new arrivals, and exclusive offers delivered to your inbox.</p>
            <NewsletterForm className="mt-8 flex flex-col gap-3 sm:flex-row" />
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
