import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rl = rateLimit(`${rateLimiters.reviews.prefix}:${ip}`, rateLimiters.reviews.limit, rateLimiters.reviews.windowMs);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    const body = await request.json();
    const { product_id, rating, title, text } = body;

    if (!product_id || !rating || !text) {
      return NextResponse.json({ error: "Product ID, rating, and text are required" }, { status: 400 });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (typeof text !== "string" || text.trim().length < 10 || text.length > 2000) {
      return NextResponse.json({ error: "Review text must be between 10 and 2000 characters" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("reviews").insert({
      product_id,
      user_id: user?.id || null,
      rating: Math.round(rating),
      title: title?.trim() || null,
      text: text.trim(),
      is_verified: !!user,
      is_approved: false,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
