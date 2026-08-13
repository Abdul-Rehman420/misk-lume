import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  createClient: vi.fn(),
  sendOrderConfirmation: vi.fn(),
  getDiscountAmount: vi.fn(),
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
vi.mock("@/lib/email", () => ({ sendOrderConfirmation: mocks.sendOrderConfirmation }));
vi.mock("@/lib/discounts", () => ({ getDiscountAmount: mocks.getDiscountAmount }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimit,
  rateLimiters: { orders: { prefix: "orders", limit: 10, windowMs: 3_600_000 } },
}));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/orders/route";

const PRODUCT = {
  id: "850a5c8b-f775-41f1-b98c-633b0fd694f7",
  name: "Iris Dusk",
  price: 1500,
  sale_price: null,
  image_url: "https://example.com/img.jpg",
  stock_quantity: 50,
  product_sizes: [{ size_ml: 6, stock_quantity: 20, is_active: true }],
};

const ORDER = {
  id: "00000000-0000-0000-0000-000000000001",
  order_number: "ML-TEST-0001",
  subtotal: 3000,
  shipping_cost: 200,
  discount_amount: 0,
  total: 3200,
};

function makeRequest(payload: unknown) {
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

interface SupabaseMockOpts {
  product?: unknown;
  productError?: unknown;
  order?: unknown;
  orderError?: unknown;
  itemsError?: unknown;
  rpcData?: unknown;
  rpcError?: unknown;
  deleteCalled?: () => void;
}

function buildSupabase(opts: SupabaseMockOpts) {
  const from = vi.fn((table: string) => {
    if (table === "products") {
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: opts.product, error: opts.productError ?? null }) }) }),
      };
    }
    if (table === "orders") {
      return {
        insert: () => ({ select: () => ({ single: async () => ({ data: opts.order, error: opts.orderError ?? null }) }) }),
        delete: () => ({
          eq: () => {
            opts.deleteCalled?.();
            return { error: null };
          },
        }),
      };
    }
    if (table === "order_items") {
      return { insert: async () => ({ error: opts.itemsError ?? null }) };
    }
    return {};
  });
  const rpc = vi.fn().mockResolvedValue({ data: opts.rpcData, error: opts.rpcError ?? null });
  return { from, rpc };
}

const BASE_PAYLOAD = {
  items: [{ product_id: PRODUCT.id, quantity: 2, size_ml: 6 }],
  shipping_address: {
    name: "Abdul Rehman",
    email: "abdulrehmansheikh4747@gmail.com",
    address: "Test St",
    city: "Lahore",
    phone: "03000000000",
  },
  payment_method: "bank",
};

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ success: true, remaining: 5 });
    mocks.getDiscountAmount.mockResolvedValue({ amount: 0, valid: true });
    mocks.sendOrderConfirmation.mockResolvedValue({});
  });

  it("creates an order and consumes the discount when valid", async () => {
    const supabase = buildSupabase({ product: PRODUCT, order: ORDER, rpcData: true });
    mocks.createClient.mockResolvedValue(supabase);
    mocks.getDiscountAmount.mockResolvedValue({ amount: 300, valid: true });

    const res = await POST(makeRequest({ ...BASE_PAYLOAD, discount_code: "WELCOME10" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.order.order_number).toMatch(/^ML-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(supabase.rpc).toHaveBeenCalledWith("increment_discount_usage", { code_text: "WELCOME10" });
  });

  it("rolls the order back when the discount limit is hit at placement (C9)", async () => {
    let deletes = 0;
    const supabase = buildSupabase({ product: PRODUCT, order: ORDER, rpcData: false, deleteCalled: () => { deletes++; } });
    mocks.createClient.mockResolvedValue(supabase);
    mocks.getDiscountAmount.mockResolvedValue({ amount: 300, valid: true });

    const res = await POST(makeRequest({ ...BASE_PAYLOAD, discount_code: "LIMITED" }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("This discount code has reached its usage limit");
    expect(deletes).toBe(1);
  });

  it("fails open when the discount RPC errors (migration not applied)", async () => {
    const supabase = buildSupabase({ product: PRODUCT, order: ORDER, rpcError: { message: "function not found" } });
    mocks.createClient.mockResolvedValue(supabase);
    mocks.getDiscountAmount.mockResolvedValue({ amount: 300, valid: true });

    const res = await POST(makeRequest({ ...BASE_PAYLOAD, discount_code: "WELCOME10" }));
    expect(res.status).toBe(200);
  });

  it("rolls back and returns 409 when stock is insufficient at insert", async () => {
    let deletes = 0;
    const supabase = buildSupabase({
      product: PRODUCT,
      order: ORDER,
      itemsError: { message: 'Insufficient stock for product "Iris Dusk"' },
      deleteCalled: () => { deletes++; },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const res = await POST(makeRequest(BASE_PAYLOAD));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("Insufficient stock for one or more items. Please update your cart.");
    expect(deletes).toBe(1);
  });

  it("rejects an empty cart", async () => {
    mocks.createClient.mockResolvedValue(buildSupabase({}));
    const res = await POST(makeRequest({ ...BASE_PAYLOAD, items: [] }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Cart is empty");
  });

  it("returns 429 when rate limited", async () => {
    mocks.rateLimit.mockResolvedValue({ success: false, remaining: 0 });
    mocks.createClient.mockResolvedValue(buildSupabase({}));
    const res = await POST(makeRequest(BASE_PAYLOAD));
    expect(res.status).toBe(429);
  });
});
