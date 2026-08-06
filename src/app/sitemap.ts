import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://misklume.com";
  const staticPages = ["", "/shop", "/shop/best-sellers", "/collections", "/attar", "/blog", "/about", "/contact", "/shipping", "/returns", "/privacy", "/terms", "/faq", "/gift-sets", "/sustainability"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    const supabase = await createClient();
    const [productsRes, blogRes, collectionsRes] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("is_active", true),
      supabase.from("blog_posts").select("slug, updated_at").eq("is_published", true),
      supabase.from("collections").select("slug, updated_at").eq("is_active", true),
    ]);

    const products = (productsRes.data || []).map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const posts = (blogRes.data || []).map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const collections = (collectionsRes.data || []).map((c) => ({
      url: `${base}/collections/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...products, ...posts, ...collections];
  } catch {
    return staticPages;
  }
}
