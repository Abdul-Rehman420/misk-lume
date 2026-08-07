import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Lightweight uptime/monitoring probe. Returns 200 when the app is up.
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "misk-lume",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
