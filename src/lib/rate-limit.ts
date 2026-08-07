import { createClient } from "./supabase/server";

interface RateLimitRow {
  success: boolean;
  remaining: number;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ success: boolean; remaining: number }> {
  try {
    const supabase = await createClient();

    // Atomic increment inside the DB (migration 013). A single
    // INSERT..ON CONFLICT avoids the select-then-update race and works with
    // RLS because the function is security definer.
    const { data, error } = await supabase.rpc("apply_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      // RPC unavailable — fail open
      return { success: true, remaining: limit - 1 };
    }

    const row = data[0] as RateLimitRow;
    return { success: row.success, remaining: row.remaining };
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
  discounts: { limit: 20, windowMs: HOUR, prefix: "discounts" },
  analytics: { limit: 120, windowMs: HOUR, prefix: "analytics" },
} as const;
