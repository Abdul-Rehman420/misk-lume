import HomeHero from "@/components/home/HomeHero";
import HomeContent from "@/components/home/HomeContent";
import { getFeaturedProducts, getCategories, getBlogPosts } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { normalizeBadge } from "@/lib/badge";

const fallbackCategories = [
  { name: "Men", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80", href: "/shop?gender=men", count: "24 Fragrances" },
  { name: "Women", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80", href: "/shop?gender=women", count: "31 Fragrances" },
  { name: "Unisex", image: "https://images.unsplash.com/photo-1594035910387-fbd1b6c24581?w=600&q=80", href: "/shop?gender=unisex", count: "18 Fragrances" },
  { name: "Attar", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80", href: "/attar", count: "12 Oils" },
];

const fallbackBlogPosts = [
  { title: "The History of Oud: From Ancient Temples to Modern Perfumery", excerpt: "A journey through centuries of one of the world's most prized fragrance ingredients...", image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80", slug: "history-of-oud", published_at: "2026-07-10" },
  { title: "Why Oil-Based Perfume Lasts Longer Than Alcohol Sprays", excerpt: "The science behind oil-based formulation and why concentration matters...", image_url: "https://images.unsplash.com/photo-1594035910387-fbd1b6c24581?w=600&q=80", slug: "oil-based-longevity", published_at: "2026-06-28" },
  { title: "Building Your Signature Scent: A Guide to Fragrance Layering", excerpt: "How to combine oils and build a fragrance identity that's uniquely yours...", image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&q=80", slug: "signature-scent-guide", published_at: "2026-06-15" },
];

function formatCategoryHref(cat: { name: string; slug?: string }) {
  const name = cat.name.toLowerCase();
  if (name === "attar") return "/attar";
  return `/shop?gender=${cat.slug || name}`;
}

export default async function Home() {
  let categories = fallbackCategories;
  let featuredProducts: {
    id: string; name: string; slug: string; price: number; sale_price?: number; gender: string;
    image_url: string; badge?: "new" | "sale" | "out-of-stock"; rating: number; review_count: number;
    categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  }[] = [];
  let blogPosts = fallbackBlogPosts;
  let reviews: { rating: number; text: string; author: string; date: string }[] = [];

  const [dbCategories, featured, posts, dbReviews] = await Promise.allSettled([
    getCategories(),
    getFeaturedProducts(4),
    getBlogPosts({ limit: 3 }),
    (async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from('reviews')
        .select('rating, text, created_at, profiles(full_name)')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3);
      return data;
    })(),
  ]);

  if (dbCategories.status === "fulfilled" && dbCategories.value && dbCategories.value.length > 0) {
    categories = dbCategories.value.map((c) => {
      const productCount = (c.products as { count?: number }[] | null)?.[0]?.count ?? 0;
      const countLabel = c.name.toLowerCase() === "attar" ? "Oils" : "Fragrances";
      return {
        name: c.name,
        image: c.image_url || fallbackCategories.find((f) => f.name.toLowerCase() === c.name.toLowerCase())?.image || "",
        href: formatCategoryHref(c),
        count: productCount > 0 ? `${productCount} ${countLabel}` : "",
      };
    });
  }

  if (featured.status === "fulfilled" && featured.value && featured.value.length > 0) {
    featuredProducts = featured.value.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      sale_price: p.sale_price ?? undefined,
      gender: p.gender,
      image_url: p.image_url || "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80",
      badge: normalizeBadge(p.badge),
      rating: p.rating,
      review_count: p.review_count,
      categories: p.categories,
    }));
  }

  if (posts.status === "fulfilled" && posts.value && posts.value.length > 0) {
    blogPosts = posts.value.map((p) => ({
      title: p.title,
      excerpt: p.excerpt,
      image_url: p.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
      slug: p.slug,
      published_at: p.published_at,
    }));
  }

  if (dbReviews.status === "fulfilled" && dbReviews.value && dbReviews.value.length > 0) {
    reviews = dbReviews.value.map((r) => ({
      rating: r.rating,
      text: r.text,
      author: (r.profiles as { full_name?: string } | null)?.full_name || "Anonymous",
      date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    }));
  }

  return (
    <>
      <HomeHero />
      <HomeContent categories={categories} featuredProducts={featuredProducts} reviews={reviews} blogPosts={blogPosts} />
    </>
  );
}
