"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const genders = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
] as const;
const sizes = ["6ml", "12ml", "25ml"] as const;

export default function ShopSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedGenders = (searchParams.get("gender")?.toLowerCase().split(",").filter(Boolean)) || [];
  const selectedSizes = searchParams.get("sizes")?.split(",").filter(Boolean) || [];
  const minPrice = Number(searchParams.get("minPrice") || "1000");
  const maxPrice = Number(searchParams.get("maxPrice") || "10000");

  function updateParams(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
  }

  function toggleMultiParam(key: string, current: string[], item: string) {
    const next = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    updateParams(key, next.length > 0 ? next.join(",") : null);
  }

  return (
    <aside className="sticky top-24 hidden h-fit self-start space-y-8 lg:block">
      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-text-primary">Gender</legend>
        <div className="mt-4 space-y-3">
          {genders.map((g) => (
            <label key={g.value} className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={selectedGenders.includes(g.value)} onChange={() => toggleMultiParam("gender", selectedGenders, g.value)} className="h-4 w-4 rounded-sm border border-border-subtle bg-bg-elevated accent-accent-gold" />
              <span className="text-sm text-text-muted">{g.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">Price Range</h3>
        <p className="mt-4 text-sm text-text-muted">PKR {minPrice.toLocaleString()} — PKR {maxPrice.toLocaleString()}</p>
        <div className="relative mt-3 h-1 rounded-full bg-bg-elevated">
          <div className="absolute h-full rounded-full bg-accent-gold/40" style={{ left: "0%", width: `${((maxPrice - 1000) / 9000) * 100}%` }} />
        </div>
        <div className="mt-4 flex gap-3">
          <div className="w-full">
            <label htmlFor="price-min" className="sr-only">Minimum price</label>
            <input id="price-min" type="number" value={minPrice} onChange={e => { const v = Number(e.target.value); if (v >= 0) updateParams("minPrice", String(v)); }} className="w-full rounded-sm border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none" placeholder="Min" />
          </div>
          <div className="w-full">
            <label htmlFor="price-max" className="sr-only">Maximum price</label>
            <input id="price-max" type="number" value={maxPrice} onChange={e => { const v = Number(e.target.value); if (v >= 0) updateParams("maxPrice", String(v)); }} className="w-full rounded-sm border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none" placeholder="Max" />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold uppercase tracking-wider text-text-primary">Size</legend>
        <div className="mt-4 space-y-3">
          {sizes.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={selectedSizes.includes(s)} onChange={() => toggleMultiParam("sizes", selectedSizes, s)} className="h-4 w-4 rounded-sm border border-border-subtle bg-bg-elevated accent-accent-gold" />
              <span className="text-sm text-text-muted">{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {(selectedGenders.length > 0 || selectedSizes.length > 0 || minPrice !== 1000 || maxPrice !== 10000) && (
        <button onClick={() => router.push("/shop")} className="w-full rounded-sm border border-border py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent-gold hover:text-accent-gold">
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
