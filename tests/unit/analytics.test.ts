import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextRequest: class extends Request {},
  NextResponse: class extends Response {
    static json(body: unknown, init: ResponseInit = {}) {
      return new Response(JSON.stringify(body), {
        ...init,
        headers: { "content-type": "application/json", ...(init.headers ?? {}) },
      });
    }
  },
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  rateLimiters: { analytics: { prefix: "analytics", limit: 120, windowMs: 3_600_000 } },
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/analytics/route";

function makeRequest(eventType: unknown) {
  return new NextRequest("http://localhost/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "vitest" },
    body: JSON.stringify({ event_type: eventType, page: "/", referrer: "" }),
  });
}

describe("POST /api/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ success: true, remaining: 100 });
    mocks.createClient.mockResolvedValue({
      from: () => ({ insert: vi.fn().mockResolvedValue({ error: null }) }),
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });
  });

  it("records a page_view event", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.createClient.mockResolvedValue({
      from: () => ({ insert }),
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    });

    const res = await POST(makeRequest("page_view"));
    expect(res.status).toBe(204);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: "page_view", page: "/", user_id: "u1" })
    );
  });

  it("silently ignores a missing event type", async () => {
    const res = await POST(makeRequest(undefined));
    expect(res.status).toBe(204);
  });

  it("never returns an error when rate limited", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });
    const res = await POST(makeRequest("page_view"));
    expect(res.status).toBe(204);
  });

  it("never throws when the DB fails", async () => {
    mocks.createClient.mockResolvedValue({
      from: () => ({ insert: vi.fn().mockRejectedValue(new Error("db down")) }),
      auth: { getUser: vi.fn().mockRejectedValue(new Error("auth down")) },
    });
    const res = await POST(makeRequest("page_view"));
    expect(res.status).toBe(204);
  });
});
