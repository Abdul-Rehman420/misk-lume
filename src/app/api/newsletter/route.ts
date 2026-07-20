import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterWelcome } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rl = rateLimit(`${rateLimiters.newsletter.prefix}:${ip}`, rateLimiters.newsletter.limit, rateLimiters.newsletter.windowMs);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      await supabase.from("newsletter_subscribers").upsert(
        { email: email.trim(), subscribed_at: new Date().toISOString() },
        { onConflict: "email" }
      );
    } catch {
      // Newsletter table may not exist yet — continue with email
    }

    await sendNewsletterWelcome(email.trim());

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
