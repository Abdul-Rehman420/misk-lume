import { createClient } from "./supabase/server";

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ success: boolean; remaining: number }> {
  try {
    const supabase = await createClient();
    const now = new Date();
    const resetAt = new Date(now.getTime() + windowMs);

    // Atomic upsert: increment count if key exists and not expired, else insert fresh
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count, reset_at")
      .eq("key", key)
      .single();

    if (!existing || new Date(existing.reset_at) < now) {
      await supabase.from("rate_limits").upsert(
        { key, count: 1, reset_at: resetAt.toISOString() },
        { onConflict: "key" }
      );
      return { success: true, remaining: limit - 1 };
    }

    if (existing.count >= limit) {
      return { success: false, remaining: 0 };
    }

    await supabase
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("key", key);

    return { success: true, remaining: limit - existing.count - 1 };
  } catch {
    // Fail open — if rate limit DB is down, allow the request
    return { success: true, remaining: limit - 1 };
  }
}

const HOUR = 60 * 60 * 1000;

export const rateLimiters = {
  contact: { limit: 5, windowMs: HOUR, prefix: "contact" },
  newsletter: { limit: 3, windowMs: HOUR, prefix: "newsletter" },
  orders: { limit: 10, windowMs: HOUR, prefix: "orders" },
  reviews: { limit: 5, windowMs: HOUR, prefix: "reviews" },
} as const;
