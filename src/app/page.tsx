import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/components/ui/ProductCard";
import FeaturedCard from "@/components/ui/FeaturedCard";
import ReviewCard from "@/components/ui/ReviewCard";
import Button from "@/components/ui/Button";
import NewsletterForm from "@/components/ui/NewsletterForm";
import HomeHero from "@/components/home/HomeHero";
import SectionReveal from "@/components/animations/SectionReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerChildren from "@/components/animations/StaggerChildren";
import { getFeaturedProducts, getCategories, getBlogPosts } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

const fallbackCategories = [
  { name: "Men", image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80", href: "/shop?gender=men", count: "24 Fragrances" },
  { name: "Women", image: "https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=600&q=80", href: "/shop?gender=women", count: "31 Fragrances" },
  { name: "Unisex", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80", href: "/shop?gender=unisex", count: "18 Fragrances" },
  { name: "Attar", image: "https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=600&q=80", href: "/attar", count: "12 Oils" },
];

const fallbackFeatured = [
  { name: "Noir Oud", slug: "noir-oud", price: 4500, gender: "Men", image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80", badge: "new" as const, rating: 5, review_count: 128, categories: { name: "Men", slug: "men" } },
  { name: "Velvet Rose", slug: "velvet-rose", price: 3800, gender: "Women", image_url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500&q=80", rating: 4, review_count: 94, categories: { name: "Women", slug: "women" } },
  { name: "Amber Savage", slug: "amber-savage", price: 3200, sale_price: 4000, gender: "Unisex", image_url: "https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=500&q=80", badge: "sale" as const, rating: 4, review_count: 76, categories: { name: "Unisex", slug: "unisex" } },
  { name: "Saffron Ember", slug: "saffron-ember", price: 5200, gender: "Men", image_url: "https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=500&q=80", rating: 5, review_count: 63, categories: { name: "Men", slug: "men" } },
];

const fallbackReviews = [
  { rating: 5, text: "Noir Oud is unlike anything I've ever experienced. The longevity is incredible — 12 hours and still getting compliments. Worth every rupee.", author: "Ahmed R.", date: "June 2026" },
  { rating: 5, text: "Velvet Rose has become my signature scent. The rose and oud blend is perfectly balanced. My husband bought this for me and I'm obsessed.", author: "Fatima K.", date: "May 2026" },
  { rating: 4, text: "The packaging alone feels luxurious. Saffron Ember is bold, warm, and sophisticated. Misk Lume has set a new standard for Pakistani perfumery.", author: "Bilal M.", date: "April 2026" },
];

const fallbackBlogPosts = [
  { title: "The Art of Layering Fragrances", excerpt: "Master the technique of combining scents to create a unique olfactory signature that's entirely your own.", image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80", slug: "layering-fragrances", published_at: "2026-07-10" },
  { title: "Oud: The Liquid Gold of Perfumery", excerpt: "Discover why oud has been treasured for centuries and what makes our sourcing process different.", image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&q=80", slug: "oud-liquid-gold", published_at: "2026-06-28" },
  { title: "Your Guide to Attar Oils", excerpt: "Everything you need to know about traditional attar oils, from application techniques to storage.", image_url: "https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=600&q=80", slug: "attar-oils-guide", published_at: "2026-06-15" },
];

function formatCategoryHref(cat: { name: string; slug?: string }) {
  const name = cat.name.toLowerCase();
  if (name === "attar") return "/attar";
  return `/shop?gender=${cat.slug || name}`;
}

export default async function Home() {
  let categories = fallbackCategories;
  let featuredProducts = fallbackFeatured;
  let blogPosts = fallbackBlogPosts;
  let reviews = fallbackReviews;

  try {
    const dbCategories = await getCategories();
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories.map((c) => ({
        name: c.name,
        image: c.image_url || fallbackCategories.find((f) => f.name.toLowerCase() === c.name.toLowerCase())?.image || "",
        href: formatCategoryHref(c),
        count: `${c.name}`,
      }));
    }
  } catch {}

  try {
    const featured = await getFeaturedProducts(4);
    if (featured && featured.length > 0) {
      featuredProducts = featured.map((p) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        sale_price: p.sale_price,
        gender: p.gender,
        image_url: p.image_url || "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80",
        badge: p.badge,
        rating: p.rating,
        review_count: p.review_count,
        categories: p.categories,
      }));
    }
  } catch {}

  try {
    const posts = await getBlogPosts({ limit: 3 });
    if (posts && posts.length > 0) {
      blogPosts = posts.map((p) => ({
        title: p.title,
        excerpt: p.excerpt,
        image_url: p.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
        slug: p.slug,
        published_at: p.published_at,
      }));
    }
  } catch {}

  try {
    const supabase = await createClient();
    const { data: dbReviews } = await supabase
      .from('reviews')
      .select('rating, text, profiles(full_name)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (dbReviews && dbReviews.length > 0) {
      reviews = dbReviews.map((r) => ({
        rating: r.rating,
        text: r.text,
        author: (r.profiles as { full_name?: string } | null)?.full_name || "Anonymous",
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      }));
    }
  } catch {}

  return (
    <>
      {/* Hero */}
      <HomeHero />

      {/* Categories */}
      <SectionReveal className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader label="Shop by Category" title="Find Your Scent" />
        <StaggerChildren className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group relative aspect-square overflow-hidden rounded-md">
              <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-display text-xl font-medium text-text-primary">{cat.name}</h3>
                {cat.count && <p className="mt-1 text-xs text-text-muted">{cat.count}</p>}
              </div>
            </Link>
          ))}
        </StaggerChildren>
      </SectionReveal>

      {/* Featured Products */}
      <SectionReveal className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader label="Featured" title="Signature Collection" />
          <StaggerChildren className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.slug}
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
          <div className="mt-12 flex justify-center">
            <Link href="/shop"><Button variant="outline">View All Products</Button></Link>
          </div>
        </div>
      </SectionReveal>

      {/* Best Sellers */}
      <ScrollReveal>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeader label="Best Sellers" title="Loved by Many" />
          <div className="mt-12 flex flex-col gap-12">
            <FeaturedCard label="#1 Best Seller" name="Noir Oud" description="Our iconic signature — a rich blend of aged oud, smoky vetiver, and warm amber. A fragrance that commands attention and leaves an unforgettable trail." price="PKR 4,500" imageUrl="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80" href="/product/noir-oud" />
            <FeaturedCard label="Editor's Pick" name="Velvet Rose" description="A luminous fusion of Damask rose, pink pepper, and creamy sandalwood. Elegant, feminine, and utterly intoxicating." price="PKR 3,800" imageUrl="https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80" href="/product/velvet-rose" reverse />
          </div>
        </section>
      </ScrollReveal>

      {/* Discount Banner */}
      <ScrollReveal direction="left">
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-md border border-accent-gold/20 bg-accent-gold/5 px-8 py-10 text-center">
            <h2 className="font-display text-2xl font-medium text-text-primary">First Order? <span className="text-accent-gold">15% Off</span></h2>
            <p className="mt-3 text-sm text-text-muted">Use code <span className="font-semibold tracking-wider text-accent-gold">RITUAL15</span> at checkout</p>
          </div>
        </section>
      </ScrollReveal>

      {/* About */}
      <ScrollReveal direction="right">
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-md bg-bg-elevated">
              <Image src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80" alt="Misk Lume craftsmanship" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Our Story</span>
              <h2 className="font-display text-3xl font-medium text-text-primary">Born from <span className="italic text-accent-gold">Obsession</span></h2>
              <p className="max-w-md text-sm leading-relaxed text-text-muted">Misk Lume was born from a singular vision — to create fragrances that transcend the ordinary. Every bottle is a testament to our relentless pursuit of perfection.</p>
              <p className="max-w-md text-sm leading-relaxed text-text-muted">We source the finest ingredients from across the globe, blending tradition with innovation to craft scents that resonate on an emotional level.</p>
              <div className="mt-4"><Link href="/about"><Button variant="outline">Read More</Button></Link></div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Why Choose Us */}
      <SectionReveal className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader label="Quality Promise" title="Why Choose Us" />
          <StaggerChildren className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-gold/20 bg-accent-gold/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3 className="mt-5 font-display text-lg font-medium text-text-primary">100% Pure Oil</h3>
              <p className="mt-2 max-w-xs text-sm text-text-muted">Every fragrance is crafted with pure essential oils, free from synthetic fillers and compromises.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-gold/20 bg-accent-gold/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent-gold"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M2 12h20" /><path d="M2 7V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2" /></svg>
              </div>
              <h3 className="mt-5 font-display text-lg font-medium text-text-primary">High Concentration</h3>
              <p className="mt-2 max-w-xs text-sm text-text-muted">With up to 40% concentration, our fragrances deliver depth and longevity that outlast the ordinary.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-gold/20 bg-accent-gold/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent-gold"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <h3 className="mt-5 font-display text-lg font-medium text-text-primary">Small Batch Ritual</h3>
              <p className="mt-2 max-w-xs text-sm text-text-muted">Each batch is carefully curated in limited quantities, ensuring unmatched quality and exclusivity.</p>
            </div>
          </StaggerChildren>
        </div>
      </SectionReveal>

      {/* Reviews */}
      <ScrollReveal>
        <section className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeader label="Testimonials" title="What Our Clients Say" />
          <StaggerChildren className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((review, i) => (
              <ReviewCard key={i} rating={review.rating} text={review.text} author={review.author} date={review.date} />
            ))}
          </StaggerChildren>
        </section>
      </ScrollReveal>

      {/* Blog Teaser */}
      <SectionReveal className="bg-bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader label="Journal" title="From Our Blog" />
          <StaggerChildren className="mt-12 grid gap-6 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group rounded-md border border-border-subtle bg-bg-surface overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={post.image_url} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <span className="text-xs text-text-dim">{post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</span>
                  <h3 className="mt-2 font-display text-lg font-medium text-text-primary transition-colors group-hover:text-accent-gold">{post.title}</h3>
                  <p className="mt-2 text-sm text-text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-block text-sm font-medium text-accent-gold">Read More →</span>
                </div>
              </Link>
            ))}
          </StaggerChildren>
        </div>
      </SectionReveal>

      {/* Newsletter */}
      <ScrollReveal direction="up">
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-surface to-bg-primary" />
          <div className="relative mx-auto max-w-xl px-6 text-center">
            <SectionHeader label="Newsletter" title="Stay Informed" />
            <p className="mt-6 text-sm text-text-muted">Be the first to know about new releases, exclusive offers, and the stories behind our craft.</p>
            <NewsletterForm className="mt-8 flex gap-3" />
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
