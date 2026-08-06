import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ui/ProductCard";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
import ShopSidebar from "./ShopSidebar";
import SortSelect from "./SortSelect";
import { getShopProducts, getShopProductsCount } from "@/lib/supabase/queries";
import { normalizeBadge } from "@/lib/badge";

export const metadata: Metadata = {
  title: "Shop All Fragrances | Misk Lume",
  description: "Browse the full Misk Lume collection of luxury perfumes, attars, and oils. Free shipping on orders over PKR 8,000.",
};

interface ShopPageProps {
  searchParams: Promise<{ gender?: string; category?: string; search?: string; sort?: string; page?: string; sizes?: string; minPrice?: string; maxPrice?: string }>;
}

const ITEMS_PER_PAGE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const gender = params.gender ? params.gender.toLowerCase() : undefined;
  const category = params.category || undefined;
  const search = params.search || undefined;
  const sort = params.sort || undefined;
  const page = parseInt(params.page || "1", 10);
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sizes = params.sizes?.split(",").filter(Boolean) || [];
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let products: {
    id: string; name: string; slug: string; price: number; sale_price?: number; gender: string;
    image_url: string; badge?: "new" | "sale" | "out-of-stock"; rating: number; review_count: number;
    sizes?: { size_ml: number; price: number }[];
  }[] = [];
  let totalCount = 0;

  try {
    const [dbProducts, count] = await Promise.all([
      getShopProducts({ gender, category, search, minPrice, maxPrice, sort, limit: ITEMS_PER_PAGE, offset }),
      getShopProductsCount({ gender, category, search, minPrice, maxPrice, sizes: sizes.length > 0 ? sizes : undefined }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      let mapped = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        sale_price: p.sale_price,
        gender: p.gender,
        image_url: p.product_images?.find((img: { is_primary?: boolean }) => img.is_primary)?.image_url || p.image_url || "",
        badge: normalizeBadge(p.badge),
        rating: p.rating,
        review_count: p.review_count,
        sizes: p.product_sizes?.map((s: { size_ml: number; price: number }) => ({ size_ml: s.size_ml, price: s.price })) || [],
      }));

      if (sizes.length > 0) {
        mapped = mapped.filter(p => p.sizes.some((s: { size_ml: number; price: number }) => sizes.includes(`${s.size_ml}ml`)));
      }

      products = mapped;
    }
    totalCount = count;
  } catch {}

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const sortedProducts = [...products];
  if (sort === "price_asc") sortedProducts.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") sortedProducts.sort((a, b) => b.price - a.price);
  else if (sort === "rating") sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (gender) sp.set("gender", gender);
    if (category) sp.set("category", category);
    if (search) sp.set("search", search);
    if (sort) sp.set("sort", sort);
    if (minPrice) sp.set("minPrice", String(minPrice));
    if (maxPrice) sp.set("maxPrice", String(maxPrice));
    if (sizes.length > 0) sp.set("sizes", sizes.join(","));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  }

  const activeFilters = (gender || category || search || minPrice || maxPrice || sizes.length > 0);

  function buildFilterUrl(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const keys = { gender, category, search, sort, minPrice: minPrice ? String(minPrice) : undefined, maxPrice: maxPrice ? String(maxPrice) : undefined, sizes: sizes.length > 0 ? sizes.join(",") : undefined, ...overrides };
    for (const [k, v] of Object.entries(keys)) { if (v) sp.set(k, v); }
    const qs = sp.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-dim">
        <Link href="/" className="transition-colors hover:text-accent-gold">Home</Link>
        <span>/</span>
        <span className="text-text-primary">All Products</span>
      </nav>
      <h1 className="sr-only">Shop All Fragrances</h1>

      {activeFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {gender && gender.split(",").map(g => (
            <span key={g} className="inline-flex items-center gap-1 rounded-full border border-accent-gold/30 bg-accent-gold/5 px-3 py-1 text-xs text-accent-gold">
              {g.charAt(0).toUpperCase() + g.slice(1)} <Link href={buildFilterUrl({ gender: gender.split(",").filter(x => x !== g).join(",") || undefined })} className="ml-1">&times;</Link>
            </span>
          ))}
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent-gold/30 bg-accent-gold/5 px-3 py-1 text-xs text-accent-gold">
              {category} <Link href={buildFilterUrl({ category: undefined })} className="ml-1">&times;</Link>
            </span>
          )}
          {sizes.length > 0 && sizes.map(s => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full border border-accent-gold/30 bg-accent-gold/5 px-3 py-1 text-xs text-accent-gold">
              {s} <Link href={buildFilterUrl({ sizes: sizes.filter(x => x !== s).join(",") || undefined })} className="ml-1">&times;</Link>
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="hidden lg:block w-[280px] animate-pulse bg-bg-surface rounded-md h-96" />}>
          <ShopSidebar />
        </Suspense>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing <span className="font-medium text-text-primary">{totalCount > 0 ? `${offset + 1}–${Math.min(offset + ITEMS_PER_PAGE, totalCount)}` : "0"}</span> of <span className="font-medium text-text-primary">{totalCount}</span> products
            </p>
            <Suspense fallback={null}>
              <SortSelect currentSort={sort} />
            </Suspense>
          </div>

          <ShopProductGrid className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
            {sortedProducts.map((product) => (
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
          </ShopProductGrid>

          {sortedProducts.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-text-muted">{activeFilters ? "No products match your filters" : "No products yet. Check back soon."}</p>
              {activeFilters && (
                <Link href="/shop" className="mt-4 inline-block text-sm text-accent-gold hover:text-accent-gold-hover">Clear all filters</Link>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={buildPageUrl(p)} className={`flex h-10 w-10 items-center justify-center rounded-sm text-sm font-medium transition-colors ${p === page ? "bg-accent-gold text-bg-primary" : "border border-border-subtle text-text-muted hover:border-accent-gold hover:text-accent-gold"}`}>
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
