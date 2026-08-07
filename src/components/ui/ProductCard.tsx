"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/context/WishlistContext";

interface ProductCardProps {
  productId?: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  gender: string;
  imageUrl: string;
  badge?: "new" | "sale" | "out-of-stock";
  rating?: number;
  reviewCount?: number;
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const badgeConfig = {
  new: { label: "New", className: "bg-accent-gold text-bg-primary" },
  sale: { label: "Sale", className: "bg-error text-text-primary" },
  "out-of-stock": {
    label: "Out of Stock",
    className: "bg-bg-elevated text-text-muted",
  },
};

export default function ProductCard({
  productId,
  name,
  slug,
  price,
  salePrice,
  gender,
  imageUrl,
  badge,
  rating,
  reviewCount,
}: ProductCardProps) {
  const { isSaved, toggle, isBusy } = useWishlist();
  const saved = productId ? isSaved(productId) : false;
  const busy = productId ? isBusy(productId) : false;

  return (
    <Link
      href={`/product/${slug}`}
      className="group relative block rounded-md border border-border-subtle bg-bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-md bg-bg-elevated">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge */}
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeConfig[badge].className}`}
          >
            {badgeConfig[badge].label}
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={`${saved ? "Remove" : "Add"} ${name} ${saved ? "from" : "to"} wishlist`}
          title={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          disabled={busy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (productId) toggle(productId);
          }}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border bg-bg-primary/60 text-text-primary opacity-0 backdrop-blur-sm transition-all duration-300 hover:border-accent-gold hover:text-accent-gold group-hover:opacity-100 ${
            saved ? "border-accent-gold text-accent-gold opacity-100" : "border-border-subtle"
          }`}
        >
          <HeartIcon className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>

        {/* Hover glass overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary/30 to-transparent opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-gold">
          {gender}
        </p>
        <h3 className="mt-1 font-display text-base font-medium text-text-primary transition-colors group-hover:text-accent-gold">
          {name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-accent-gold">
            PKR {(salePrice ?? price).toLocaleString()}
          </span>
          {salePrice && (
            <span className="text-xs text-text-dim line-through">
              PKR {price.toLocaleString()}
            </span>
          )}
        </div>
        {rating !== undefined && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={i < Math.round(rating) ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className={`h-3 w-3 ${i < Math.round(rating) ? "text-accent-gold" : "text-text-dim"}`}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            {reviewCount !== undefined && (
              <span className="text-[11px] text-text-dim">({reviewCount})</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
