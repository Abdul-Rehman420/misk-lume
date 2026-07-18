import Link from "next/link";
import FeaturedCard from "@/components/ui/FeaturedCard";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import BlogNewsletter from "./BlogNewsletter";
import { getBlogPosts } from "@/lib/supabase/queries";

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

const fallbackPosts = [
  { title: "Understanding Fragrance Notes: Top, Heart & Base", excerpt: "A beginner's guide to the architecture of perfume and how scent evolves on your skin over time.", image_url: "/images/blog-fragrance-notes.jpg", slug: "fragrance-notes", category: "Ingredients", published_at: "2025-01-12" },
  { title: "The Art of Layering: Building Your Signature Scent", excerpt: "Master the technique of combining fragrances to create a unique olfactory identity.", image_url: "/images/blog-layering.jpg", slug: "layering-scents", category: "Rituals", published_at: "2025-01-08" },
  { title: "Choosing the Perfect Winter Fragrance", excerpt: "Discover rich, warming scents that complement the colder months.", image_url: "/images/blog-winter.jpg", slug: "winter-fragrance", category: "Fragrance Guides", published_at: "2025-01-03" },
  { title: "From Concept to Bottle: Our Design Process", excerpt: "A behind-the-scenes look at how Misk Lume creates each fragrance.", image_url: "/images/blog-design-process.jpg", slug: "design-process", category: "Behind the Scenes", published_at: "2024-12-28" },
  { title: "The Rare World of Oud: Why It's Called Liquid Gold", excerpt: "Explore the centuries-old tradition of oud harvesting.", image_url: "/images/blog-oud.jpg", slug: "rare-oud", category: "Ingredients", published_at: "2024-12-20" },
  { title: "Day vs Night: Selecting Fragrances for Every Occasion", excerpt: "Learn the subtle differences between daytime freshness and evening intensity.", image_url: "/images/blog-day-night.jpg", slug: "day-vs-night", category: "Fragrance Guides", published_at: "2024-12-15" },
];

const fallbackCategories = ["All", "Fragrance Guides", "Ingredients", "Rituals", "Behind the Scenes"];

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";

  let posts = fallbackPosts;
  let categories = fallbackCategories;

  try {
    const dbPosts = await getBlogPosts({ category: activeCategory === "All" ? undefined : activeCategory, limit: 20 });
    if (dbPosts && dbPosts.length > 0) {
      posts = dbPosts.map((p) => ({
        title: p.title,
        excerpt: p.excerpt,
        image_url: p.image_url || "/images/blog-default.jpg",
        slug: p.slug,
        category: p.category,
        published_at: p.published_at,
      }));
      const uniqueCategories = [...new Set(dbPosts.map((p) => p.category).filter(Boolean))];
      if (uniqueCategories.length > 0) categories = ["All", ...uniqueCategories];
    }
  } catch {}

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  function categoryHref(cat: string) {
    if (cat === "All") return "/blog";
    return `/blog?category=${encodeURIComponent(cat)}`;
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center justify-center bg-gradient-to-b from-bg-primary via-bg-surface to-bg-primary px-4">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">Journal</span>
          <h1 className="mt-4 font-display text-4xl font-medium text-text-primary md:text-5xl">
            The <span className="italic text-accent-gold">Misk Lume</span> Blog
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
            Stories, guides, and insights from the world of luxury fragrance.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FeaturedCard
              label="Featured Article"
              name={featuredPost.title}
              description={featuredPost.excerpt}
              price=""
              imageUrl={featuredPost.image_url}
              href={`/blog/${featuredPost.slug}`}
            >
              <div className="mt-2 flex items-center gap-4">
                {featuredPost.published_at && <span className="text-xs text-text-dim">{new Date(featuredPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              </div>
              <div className="mt-3">
                <Link href={`/blog/${featuredPost.slug}`}><Button variant="outline" size="md">Read Article</Button></Link>
              </div>
            </FeaturedCard>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="bg-bg-surface px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader label="Latest Posts" title="From the Journal" />

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={categoryHref(cat)}
                className={`rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeCategory === cat
                    ? "border-accent-gold bg-accent-gold text-bg-primary"
                    : "border-border-subtle text-text-muted hover:border-border hover:text-text-primary"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-md border border-border-subtle bg-bg-primary transition-all duration-300 hover:border-border">
                <div className="relative aspect-[16/10] bg-bg-elevated">
                  <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  {post.category && <span className="inline-block rounded-full border border-accent-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-gold">{post.category}</span>}
                  {post.published_at && <p className="mt-3 text-xs text-text-dim">{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                  <h3 className="mt-2 font-display text-lg font-medium text-text-primary transition-colors group-hover:text-accent-gold">{post.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-2">{post.excerpt}</p>
                  <span className="mt-4 inline-block text-xs font-semibold text-accent-gold transition-colors">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <BlogNewsletter />
    </main>
  );
}
