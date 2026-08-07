import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Lightweight self-hosted analytics beacon (see migration 015).
// Fire-and-forget from the client; never blocks rendering.
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rl = await rateLimit(`${rateLimiters.analytics.prefix}:${ip}`, rateLimiters.analytics.limit, rateLimiters.analytics.windowMs);
    if (!rl.success) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await request.json().catch(() => null);
    const eventType = body?.event_type;
    if (typeof eventType !== "string" || eventType.length > 64) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("analytics_events").insert({
      event_type: eventType,
      page: typeof body?.page === "string" ? body.page.slice(0, 300) : null,
      referrer: typeof body?.referrer === "string" ? body.referrer.slice(0, 300) : null,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) || null,
      user_id: user?.id || null,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    // Analytics must never break the page
    return new NextResponse(null, { status: 204 });
  }
}
