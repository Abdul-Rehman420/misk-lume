import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
import ShopSidebar from "./ShopSidebar";
import SortSelect from "./SortSelect";
import { getShopProducts, getShopProductsCount } from "@/lib/supabase/queries";

interface ShopPageProps {
  searchParams: Promise<{ gender?: string; category?: string; search?: string; sort?: string; page?: string; sizes?: string; minPrice?: string; maxPrice?: string }>;
}

const fallbackProducts = [
  { name: "Noir Oud", slug: "noir-oud", price: 4500, gender: "Men", image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80", badge: "new" as const, rating: 5, review_count: 128 },
  { name: "Velvet Rose", slug: "velvet-rose", price: 3800, gender: "Women", image_url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500&q=80", rating: 4, review_count: 94 },
  { name: "Amber Savage", slug: "amber-savage", price: 3200, sale_price: 4000, gender: "Unisex", image_url: "https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=500&q=80", badge: "sale" as const, rating: 4, review_count: 76 },
  { name: "Saffron Ember", slug: "saffron-ember", price: 5200, gender: "Men", image_url: "https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=500&q=80", rating: 5, review_count: 63 },
  { name: "Cedarwood Atlas", slug: "cedarwood-atlas", price: 2800, gender: "Men", image_url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80", rating: 4, review_count: 51 },
  { name: "Iris Dusk", slug: "iris-dusk", price: 4200, gender: "Women", image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80", rating: 5, review_count: 87 },
  { name: "Tobacco Roi", slug: "tobacco-roi", price: 3500, gender: "Men", image_url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500&q=80", rating: 4, review_count: 42 },
  { name: "Musk Absolute", slug: "musk-absolute", price: 3000, gender: "Unisex", image_url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=500&q=80", rating: 4, review_count: 68 },
  { name: "Jasmine Noir", slug: "jasmine-noir", price: 4800, gender: "Women", image_url: "https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=500&q=80", badge: "new" as const, rating: 5, review_count: 35 },
];

const ITEMS_PER_PAGE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const gender = params.gender || undefined;
  const category = params.category || undefined;
  const search = params.search || undefined;
  const sort = params.sort || undefined;
  const page = parseInt(params.page || "1", 10);
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sizes = params.sizes?.split(",").filter(Boolean) || [];
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let products = fallbackProducts;
  let totalCount = fallbackProducts.length;

  try {
    const [dbProducts, count] = await Promise.all([
      getShopProducts({ gender, category, search, minPrice, maxPrice, sort, limit: ITEMS_PER_PAGE, offset }),
      getShopProductsCount({ gender, category, search, minPrice, maxPrice, sizes: sizes.length > 0 ? sizes : undefined }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      let mapped = dbProducts.map((p) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        sale_price: p.sale_price,
        gender: p.gender,
        image_url: p.product_images?.find((img: { is_primary?: boolean }) => img.is_primary)?.image_url || p.image_url || "",
        badge: p.badge,
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

  let sortedProducts = [...products];
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

      {activeFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {gender && gender.split(",").map(g => (
            <span key={g} className="inline-flex items-center gap-1 rounded-full border border-accent-gold/30 bg-accent-gold/5 px-3 py-1 text-xs text-accent-gold">
              {g} <Link href={buildFilterUrl({ gender: gender.split(",").filter(x => x !== g).join(",") || undefined })} className="ml-1">&times;</Link>
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
              <p className="text-text-muted">No products match your filters</p>
              <Link href="/shop" className="mt-4 inline-block text-sm text-accent-gold hover:text-accent-gold-hover">Clear all filters</Link>
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
