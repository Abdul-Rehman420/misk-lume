import { describe, expect, it, vi } from "vitest";
import type { createClient } from "@/lib/supabase/server";
import { getDiscountAmount } from "@/lib/discounts";

type Supabase = Awaited<ReturnType<typeof createClient>>;

function fakeSupabase(discount: unknown): Supabase {
  const maybeSingle = vi.fn().mockResolvedValue({ data: discount, error: null });
  return {
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ maybeSingle }) }) }),
    }),
  } as unknown as Supabase;
}

describe("getDiscountAmount", () => {
  it("rejects an unknown code", async () => {
    const result = await getDiscountAmount(fakeSupabase(null), "NOPE", 5000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid discount code");
  });

  it("computes percentage discount", async () => {
    const result = await getDiscountAmount(
      fakeSupabase({ code: "WELCOME10", type: "percentage", value: 10, is_active: true, min_order: 0, usage_limit: null, used_count: 0, expires_at: null }),
      "welcome10 ",
      5000
    );
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(500);
  });

  it("computes fixed discount capped by nothing (no min_order)", async () => {
    const result = await getDiscountAmount(
      fakeSupabase({ code: "FIX500", type: "fixed", value: 500, is_active: true, min_order: 0, usage_limit: null, used_count: 0, expires_at: null }),
      "FIX500",
      1000
    );
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(500);
  });

  it("rejects expired codes", async () => {
    const result = await getDiscountAmount(
      fakeSupabase({ code: "EXP", type: "fixed", value: 100, is_active: true, min_order: 0, usage_limit: null, used_count: 0, expires_at: "2020-01-01T00:00:00Z" }),
      "EXP",
      5000
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("This code has expired");
  });

  it("rejects codes at their usage limit", async () => {
    const result = await getDiscountAmount(
      fakeSupabase({ code: "USED", type: "fixed", value: 100, is_active: true, min_order: 0, usage_limit: 1, used_count: 1, expires_at: null }),
      "USED",
      5000
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("This code has reached its usage limit");
  });

  it("rejects orders below the minimum", async () => {
    const result = await getDiscountAmount(
      fakeSupabase({ code: "MIN", type: "fixed", value: 100, is_active: true, min_order: 10000, usage_limit: null, used_count: 0, expires_at: null }),
      "MIN",
      5000
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Minimum order");
  });
});
