"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  gender: string;
  image_url: string;
  rating?: number;
  review_count?: number;
  categories?: { name: string; slug: string };
}

interface WishlistItem {
  id: string;
  products: WishlistProduct;
}

export default function WishlistPage() {
  const supabase = createClient();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("wishlist")
        .select("id, products(id, name, slug, price, sale_price, gender, image_url, rating, review_count, categories(name, slug))")
        .eq("user_id", user.id);
      if (data) setItems(data as unknown as WishlistItem[]);
      setLoading(false);
    }
    loadWishlist();
  }, [supabase]);

  async function removeItem(id: string) {
    await supabase.from("wishlist").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-medium text-text-primary">My Wishlist</h1>
        <p className="mt-2 text-sm text-text-muted">Your saved fragrances, all in one place.</p>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-md border border-border bg-bg-surface">
                <div className="aspect-square bg-bg-elevated" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-bg-elevated" />
                  <div className="h-3 w-1/2 rounded bg-bg-elevated" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-md border border-border bg-bg-surface p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-12 w-12 text-text-dim">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="mt-4 text-text-muted">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-text-dim">Browse our collection and save your favorites.</p>
            <Link href="/shop" className="mt-6 inline-block">
              <Button variant="primary">Browse Collection</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <ProductCard
                  productId={item.products.id}
                  name={item.products.name}
                  slug={item.products.slug}
                  price={item.products.price}
                  salePrice={item.products.sale_price}
                  gender={item.products.gender}
                  imageUrl={item.products.image_url}
                  rating={item.products.rating}
                  reviewCount={item.products.review_count}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-primary/80 text-text-dim opacity-0 backdrop-blur-sm transition-all duration-200 hover:border-red-500 hover:text-red-500 group-hover:opacity-100"
                  aria-label="Remove from wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
