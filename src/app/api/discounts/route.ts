import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDiscountAmount } from "@/lib/discounts";
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rl = await rateLimit(`${rateLimiters.discounts.prefix}:${ip}`, rateLimiters.discounts.limit, rateLimiters.discounts.windowMs);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { code, subtotal } = body;

    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Please enter a discount code" }, { status: 400 });
    }
    if (code.length > 50) {
      return NextResponse.json({ error: "Discount code is too long" }, { status: 400 });
    }
    if (typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "Invalid subtotal" }, { status: 400 });
    }

    // discount_codes is admin-only under RLS (migration 017); the server reads
    // it via the service-role client so checkout can still validate codes.
    const supabase = createAdminClient();
    const result = await getDiscountAmount(supabase, code, subtotal);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.reason || "Invalid discount code" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, amount: result.amount });
  } catch {
    return NextResponse.json({ error: "Failed to validate discount code" }, { status: 500 });
  }
}
