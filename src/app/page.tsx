import HomeHero from "@/components/home/HomeHero";
import HomeContent from "@/components/home/HomeContent";
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
        sale_price: p.sale_price ?? undefined,
        gender: p.gender,
        image_url: p.image_url || "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80",
        badge: p.badge ?? undefined,
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
      <HomeHero />
      <HomeContent categories={categories} featuredProducts={featuredProducts} reviews={reviews} blogPosts={blogPosts} />
    </>
  );
}
