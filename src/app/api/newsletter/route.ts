import { NextRequest, NextResponse } from "next/server";
import { sendNewsletterWelcome } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
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
