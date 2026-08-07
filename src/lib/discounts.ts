import { createClient } from "./supabase/server";

export interface DiscountResult {
  amount: number;
  valid: boolean;
  reason?: string;
}

export async function getDiscountAmount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string,
  subtotal: number
): Promise<DiscountResult> {
  const normalized = code.trim().toUpperCase();

  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (!discount) {
    return { amount: 0, valid: false, reason: "Invalid discount code" };
  }

  if (discount.expires_at && new Date(discount.expires_at) <= new Date()) {
    return { amount: 0, valid: false, reason: "This code has expired" };
  }

  if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
    return { amount: 0, valid: false, reason: "This code has reached its usage limit" };
  }

  const minOrder = discount.min_order || 0;
  if (subtotal < minOrder) {
    return { amount: 0, valid: false, reason: `Minimum order of PKR ${minOrder.toLocaleString()} required` };
  }

  const amount =
    discount.type === "percentage"
      ? Math.round(subtotal * (discount.value / 100))
      : discount.value;

  return { amount, valid: true };
}
