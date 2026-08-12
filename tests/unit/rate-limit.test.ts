import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("../../src/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("returns success when the RPC reports remaining", async () => {
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: [{ success: true, remaining: 3 }], error: null });

    const result = await rateLimit("contact:1.2.3.4", 5, 3_600_000);
    expect(result).toEqual({ success: true, remaining: 3 });
    expect(mocks.rpc).toHaveBeenCalledWith("apply_rate_limit", {
      p_key: "contact:1.2.3.4",
      p_limit: 5,
      p_window_ms: 3_600_000,
    });
  });

  it("returns blocked when the RPC reports success=false", async () => {
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: [{ success: false, remaining: 0 }], error: null });

    const result = await rateLimit("contact:1.2.3.4", 3, 3_600_000);
    expect(result).toEqual({ success: false, remaining: 0 });
  });

  it("fails open when the RPC errors", async () => {
    mocks.createClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "function not found" } });

    const result = await rateLimit("orders:1.2.3.4", 10, 3_600_000);
    expect(result.success).toBe(true);
  });

  it("fails open when createClient throws", async () => {
    mocks.createClient.mockRejectedValue(new Error("down"));

    const result = await rateLimit("analytics:1.2.3.4", 120, 3_600_000);
    expect(result.success).toBe(true);
  });
});
