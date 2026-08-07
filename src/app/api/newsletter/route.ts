import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterWelcome } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rl = await rateLimit(`${rateLimiters.newsletter.prefix}:${ip}`, rateLimiters.newsletter.limit, rateLimiters.newsletter.windowMs);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { email, consent } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (email.length > 254) {
      return NextResponse.json({ error: "Email address is too long" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Explicit opt-in (C10). Reject signups that did not consent to marketing.
    if (consent !== true) {
      return NextResponse.json({ error: "Please agree to receive marketing emails" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("newsletter_subscribers").upsert(
      { email: email.trim(), consent: true, is_active: true },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[newsletter] failed to store subscriber:", error.message);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    // Welcome email is best-effort — a delivery failure shouldn't undo the subscription.
    await sendNewsletterWelcome(email.trim()).catch((err) => {
      console.error("[newsletter] welcome email failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
