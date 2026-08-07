import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  createClient: vi.fn(),
  sendNewsletterWelcome: vi.fn(),
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
vi.mock("@/lib/email", () => ({ sendNewsletterWelcome: mocks.sendNewsletterWelcome }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  rateLimiters: { newsletter: { prefix: "newsletter", limit: 3, windowMs: 3_600_000 } },
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/newsletter/route";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockClient(upsertResult: { error: unknown }) {
  mocks.createClient.mockResolvedValue({
    from: () => ({ upsert: vi.fn().mockResolvedValue(upsertResult) }),
  });
}

describe("POST /api/newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ success: true, remaining: 2 });
    mocks.sendNewsletterWelcome.mockResolvedValue({});
  });

  it("requires explicit consent", async () => {
    mockClient({ error: null });
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Please agree to receive marketing emails" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects consent=false", async () => {
    mockClient({ error: null });
    const res = await POST(makeRequest({ email: "a@b.com", consent: false }));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    mockClient({ error: null });
    const res = await POST(makeRequest({ email: "not-an-email", consent: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Invalid email address");
  });

  it("subscribes when consent is true", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mocks.createClient.mockResolvedValue({ from: () => ({ upsert }) });

    const res = await POST(makeRequest({ email: "sub@misk.com", consent: true }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(upsert).toHaveBeenCalledWith(
      { email: "sub@misk.com", consent: true, is_active: true },
      { onConflict: "email" }
    );
    expect(mocks.sendNewsletterWelcome).toHaveBeenCalledWith("sub@misk.com");
  });

  it("returns 429 when rate limited", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });
    mockClient({ error: null });
    const res = await POST(makeRequest({ email: "a@b.com", consent: true }));
    expect(res.status).toBe(429);
  });

  it("returns 500 when the DB write fails", async () => {
    mockClient({ error: { message: "duplicate key" } });
    const res = await POST(makeRequest({ email: "a@b.com", consent: true }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Failed to subscribe");
  });
});
