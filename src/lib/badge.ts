export type ProductBadge = "new" | "sale" | "out-of-stock";

export function normalizeBadge(value: string | null | undefined): ProductBadge | undefined {
  if (!value) return undefined;
  if (value === "new" || value === "sale" || value === "out-of-stock") return value;
  if (value === "out_of_stock") return "out-of-stock";
  return undefined;
}
