"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <select
      className="rounded-sm border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
      defaultValue={currentSort || ""}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">Featured</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
      <option value="newest">Newest</option>
    </select>
  );
}
