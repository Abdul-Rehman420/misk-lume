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
  "fragrance-notes": {
    title: "Understanding Fragrance Notes: Top, Heart & Base", slug: "fragrance-notes",
    excerpt: "A beginner's guide to the architecture of perfume and how scent evolves on your skin over time.",
    category: "Ingredients", author: "Misk Lume", published_at: "2025-01-12",
    image_url: "https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=1200&q=80",
    content: "Every fragrance is built like a musical composition, with notes that unfold over time. The structure — top, heart, and base — determines how a scent greets you and how it lingers.\n\nThe top notes are your first impression, typically light and volatile, evaporating within the first fifteen minutes. Citrus, bergamot, and green accords live here, setting the opening character of the perfume.\n\nThe heart notes form the soul of the fragrance, emerging as the top notes fade. Rose, jasmine, and spices dwell here, and they are the character you will remember most clearly.\n\nFinally, the base notes anchor everything — oud, amber, musk, and sandalwood. These rich molecules last for hours and give a fragrance its depth and staying power.",
  },
  "layering-scents": {
    title: "The Art of Layering: Building Your Signature Scent", slug: "layering-scents",
    excerpt: "Master the technique of combining fragrances to create a unique olfactory identity.",
    category: "Rituals", author: "Misk Lume", published_at: "2025-01-08",
    image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80",
    content: "Layering fragrances is an art form that allows you to create a completely unique scent profile. Start with a base fragrance — typically something warm and woody — and build upon it with complementary notes.\n\nThe key is understanding the fragrance pyramid. Top notes are your first impression, heart notes form the character, and base notes provide longevity. When layering, you want to ensure the base notes of your fragrances complement each other.\n\nBegin with lighter fragrances and build up to heavier ones. A citrus-based cologne pairs beautifully with a woody attar, creating depth while maintaining freshness throughout the day.\n\nThe true joy of layering is experimentation. Spray on different combinations in the evening, test them over a full day, and you will soon discover a signature scent that belongs to no one else but you.",
  },
  "winter-fragrance": {
    title: "Choosing the Perfect Winter Fragrance", slug: "winter-fragrance",
    excerpt: "Discover rich, warming scents that complement the colder months.",
    category: "Fragrance Guides", author: "Misk Lume", published_at: "2025-01-03",
    image_url: "https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=1200&q=80",
    content: "Winter is the season of warmth, and your fragrance should match. In colder months, heavy florals and fresh aquatics can feel out of place — this is the time for rich, enveloping scents.\n\nOud, amber, and leather take center stage in winter. Their deep, resinous profiles sit close to the skin in the cold air and bloom beautifully against warm cashmere and wool.\n\nSweet and spicy accords — vanilla, tonka bean, cinnamon, and tobacco — also shine. They recall the comfort of winter evenings by the fire and give a cosy, generous impression.\n\nBecause cold air suppresses scent projection, choose a higher concentration. A parfum or a few generous sprays will carry you from morning meetings to evening gatherings without fading.",
  },
  "design-process": {
    title: "From Concept to Bottle: Our Design Process", slug: "design-process",
    excerpt: "A behind-the-scenes look at how Misk Lume creates each fragrance.",
    category: "Behind the Scenes", author: "Misk Lume", published_at: "2024-12-28",
    image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1200&q=80",
    content: "Every Misk Lume fragrance begins not in a lab, but as a story. A memory of a desert dusk, a saffron market at dawn, or the warmth of aged wood inspires the composition before a single drop is measured.\n\nOur perfumers work with rare, often wild-harvested ingredients sourced from trusted partners across the Arabian Peninsula, India, and France. Each material is evaluated for purity and character before it earns a place in our palette.\n\nThe blending process is slow and deliberate. Accords are composed, rested, and revised — sometimes for months — until the scent tells its story with clarity and depth.\n\nOnly when a composition feels truly finished is it bottled, labeled, and hand-filled in small batches. The result is a fragrance with a point of view, not a product of a production line.",
  },
  "rare-oud": {
    title: "The Rare World of Oud: Why It's Called Liquid Gold", slug: "rare-oud",
    excerpt: "Explore the centuries-old tradition of oud harvesting.",
    category: "Ingredients", author: "Misk Lume", published_at: "2024-12-20",
    image_url: "https://images.unsplash.com/photo-1615634260169-c994b9a33e3e?w=1200&q=80",
    content: "Oud, often called liquid gold, is one of the most precious ingredients in perfumery. Derived from the resinous heartwood of agarwood trees, oud develops when the wood becomes infected with a particular type of mold.\n\nThe infection triggers a defensive response from the tree, producing a dark, fragrant resin. This resin, when distilled, creates oud oil — a complex compound with over 150 identified aromatic constituents.\n\nTrue oud is vanishingly rare. Agarwood trees take decades to mature, and only a fraction ever produce resin of perfume-grade quality. This scarcity, combined with the painstaking distillation process, is why authentic oud commands such extraordinary prices.\n\nAt Misk Lume, we source our oud from sustainable farms in Assam, India, ensuring both quality and environmental responsibility.",
  },
  "history-of-oud": {
    title: "The History of Oud: From Ancient Temples to Modern Perfumery", slug: "history-of-oud",
    excerpt: "A journey through centuries of one of the world's most prized fragrance ingredients.",
    category: "Ingredients", author: "Misk Lume", published_at: "2026-07-10",
    image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&q=80",
    content: "Oud, or agarwood, has been treasured for over two millennia. Its first recorded use dates to ancient India, where it was burned in temples as an offering believed to carry prayers to the heavens.\n\nTraders carried agarwood along the Silk Road, and by the time of the Abbasid Empire, oud had become a status symbol — worn by royalty and blended into the earliest perfumes of the Arab world.\n\nIn traditional medicine and spiritual practice across Asia, oud was prized as much for its calming, grounding presence as for its fragrance. It was used in meditation, in burial rites, and in sacred ceremonies.\n\nToday, oud remains the most revered note in Middle Eastern perfumery. Modern houses distil it with contemporary techniques, but the essence is unchanged: a dark, resinous, almost smoky warmth that cannot be replicated by any synthetic.\n\nAt Misk Lume, we honour this heritage by sourcing oud from sustainable farms and distilling it in small batches — carrying an ancient tradition into the modern world.",
  },
  "oil-based-longevity": {
    title: "Why Oil-Based Perfume Lasts Longer Than Alcohol Sprays", slug: "oil-based-longevity",
    excerpt: "The science behind oil-based formulation and why concentration matters.",
    category: "Rituals", author: "Misk Lume", published_at: "2026-06-28",
    image_url: "https://images.unsplash.com/photo-1594035910387-fbd1b6c24581?w=1200&q=80",
    content: "Most commercial sprays are 80-95% alcohol. The alcohol evaporates quickly, flinging fragrance molecules into the air for a dramatic opening — and leaving the scent with little to anchor it to the skin.\n\nOil-based perfumes flip that logic. Fragrance oils sit on the skin's surface, releasing slowly and steadily. There is no alcohol to evaporate, so the concentration you apply is the concentration you keep.\n\nConcentration is the second factor. A typical eau de toilette holds 5-15% perfume oil; a parfum holds 20-30%. Our oil-based attars sit at the high end of that range, which is why a single application carries you through the day.\n\nThere is also a character difference. On warm skin, oil-based fragrance warms and blooms gradually, revealing new layers for hours rather than fading after the opening.\n\nFor skin that is dry, alcohol sprays can leave a harsh, drying effect. Oils condition the skin as they wear — a small luxury in every application.",
  },
  "signature-scent-guide": {
    title: "Building Your Signature Scent: A Guide to Fragrance Layering", slug: "signature-scent-guide",
    excerpt: "How to combine oils and build a fragrance identity that's uniquely yours.",
    category: "Fragrance Guides", author: "Misk Lume", published_at: "2026-06-15",
    image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1200&q=80",
    content: "A signature scent is more than a fragrance you like — it is an identity. The most memorable scents are built, not stumbled upon, and layering is how you build them.\n\nStart with a base oil that anchors the composition. Something warm and woody — oud, amber, or sandalwood — gives depth and longevity. This is the foundation of everything you layer above it.\n\nNext, choose a middle note that reflects how you want to be perceived. Florals for softness, spices for warmth, citrus for clarity. Test the combination on your wrist before committing.\n\nFinally, add a single top note for character — a sharp bergamot, a hint of smoke, a touch of vanilla. The goal is restraint: a signature scent should feel like one cohesive idea, not a stack of competing notes.\n\nWear your creation across a full day. If it still feels right at midnight, it may just be yours.",
  },
  "day-vs-night": {
    title: "Day vs Night: Selecting Fragrances for Every Occasion", slug: "day-vs-night",
    excerpt: "Learn the subtle differences between daytime freshness and evening intensity.",
    category: "Fragrance Guides", author: "Misk Lume", published_at: "2024-12-15",
    image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200&q=80",
    content: "Choosing a fragrance by the time of day is less about rules and more about how a scent reads in different contexts. Daytime calls for clarity and freshness; evening invites depth and drama.\n\nFor daytime, reach for bright, clean compositions — citrus, green tea, light woods, and soft florals. They feel effortless under sunlight and never overwhelm in an office or a brunch crowd.\n\nAs the sun sets, the mood shifts. Nighttime fragrances lean richer: oud, leather, patchouli, and amber unfold slowly and sit closer to the skin, drawing people in rather than announcing themselves.\n\nOccasion matters too. A crisp eau de toilette suits long days and busy schedules, while a concentrated parfum is best reserved for dinners and celebrations where you want to make an impression.",
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
      twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
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
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-text-dim">
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
