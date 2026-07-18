import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/supabase/queries";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const fallbackPosts: Record<string, {
  title: string; slug: string; excerpt: string; content: string;
  image_url: string; category: string; author: string; published_at: string;
}> = {
  "layering-fragrances": {
    title: "The Art of Layering Fragrances", slug: "layering-fragrances",
    excerpt: "Master the technique of combining scents to create a unique olfactory signature.",
    category: "Fragrance Tips", author: "Misk Lume", published_at: "2026-07-10",
    image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80",
    content: "Layering fragrances is an art form that allows you to create a completely unique scent profile. Start with a base fragrance — typically something warm and woody — and build upon it with complementary notes.\n\nThe key is understanding the fragrance pyramid. Top notes are your first impression, heart notes form the character, and base notes provide longevity. When layering, you want to ensure the base notes of your fragrances complement each other.\n\nBegin with lighter fragrances and build up to heavier ones. A citrus-based cologne pairs beautifully with a woody attar, creating depth while maintaining freshness throughout the day.",
  },
  "oud-liquid-gold": {
    title: "Oud: The Liquid Gold of Perfumery", slug: "oud-liquid-gold",
    excerpt: "Discover why oud has been treasured for centuries.",
    category: "Ingredients", author: "Misk Lume", published_at: "2026-06-28",
    image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1200&q=80",
    content: "Oud, often called liquid gold, is one of the most precious ingredients in perfumery. Derived from the resinous heartwood of agarwood trees, oud develops when the wood becomes infected with a particular type of mold.\n\nThe infection triggers a defensive response from the tree, producing a dark, fragrant resin. This resin, when distilled, creates oud oil — a complex compound with over 150 identified aromatic constituents.\n\nAt Misk Lume, we source our oud from sustainable farms in Assam, India, ensuring both quality and environmental responsibility.",
  },
  "attar-oils-guide": {
    title: "Your Guide to Attar Oils", slug: "attar-oils-guide",
    excerpt: "Everything you need to know about traditional attar oils.",
    category: "Education", author: "Misk Lume", published_at: "2026-06-15",
    image_url: "https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=1200&q=80",
    content: "Attar oils represent centuries of perfumery tradition from the Indian subcontinent. Unlike alcohol-based perfumes, attars are concentrated oil-based fragrances that interact uniquely with your body chemistry.\n\nTo apply attar, place a small drop on your pulse points — the wrists, behind the ears, and the base of the throat. The warmth of these areas helps diffuse the fragrance naturally throughout the day.\n\nStore your attars in a cool, dark place away from direct sunlight. When stored properly, attars can last for decades, often improving with age like fine wine.",
  },
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getBlogPostBySlug(slug);
    return {
      title: `${post.title} | Misk Lume Blog`,
      description: post.excerpt,
      openGraph: { title: post.title, description: post.excerpt, images: [{ url: post.image_url || "" }] },
    };
  } catch {
    return { title: "Blog Post | Misk Lume" };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post = fallbackPosts[slug] || null;

  try {
    const dbPost = await getBlogPostBySlug(slug);
    if (dbPost) {
      post = dbPost as typeof post;
    }
  } catch {}

  if (!post) notFound();

  return (
    <article className="min-h-screen bg-bg-primary">
      <div className="relative aspect-[21/9] w-full overflow-hidden">
        <Image src={post.image_url} alt={post.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-4 -mt-32 relative z-10 pb-20">
        <nav className="mb-8 flex items-center gap-2 text-xs text-text-dim">
          <Link href="/" className="transition-colors hover:text-accent-gold">Home</Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-accent-gold">Blog</Link>
          <span>/</span>
          <span className="text-text-muted">{post.title}</span>
        </nav>

        {post.category && (
          <span className="inline-block rounded-full border border-accent-gold/20 bg-accent-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-gold">
            {post.category}
          </span>
        )}

        <h1 className="mt-4 font-display text-4xl font-medium leading-tight text-text-primary md:text-5xl">
          {post.title}
        </h1>

        <div className="mt-6 flex items-center gap-4 text-sm text-text-muted">
          <span>{post.author || "Misk Lume"}</span>
          <span className="h-1 w-1 rounded-full bg-text-dim" />
          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}</span>
        </div>

        <div className="prose-misk mt-12 space-y-6">
          {(post.content || "").split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-text-muted">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-gold">
            ← Back to Blog
          </Link>
        </div>
      </div>
    </article>
  );
}
