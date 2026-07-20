import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email";
import { rateLimit, rateLimiters } from "@/lib/rate-limit";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  const random = buf[0].toString(36).substring(0, 4).toUpperCase();
  return `ML-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rl = await rateLimit(`${rateLimiters.orders.prefix}:${ip}`, rateLimiters.orders.limit, rateLimiters.orders.windowMs);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { items, shipping_address, payment_method, discount_code } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== "string") {
        return NextResponse.json({ error: "Each item must have a valid product_id" }, { status: 400 });
      }
      if (!item.quantity || typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json({ error: "Each item must have a quantity between 1 and 99" }, { status: 400 });
      }
    }

    const supabase = await createClient();

    // C1: Authenticate user — verify the email matches the authenticated session
    let authenticatedEmail: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        authenticatedEmail = user.email;
      }
    } catch {
      // Auth unavailable — fall back to request body data (guest checkout)
    }

    const userEmail = shipping_address?.email || "";
    const userId = authenticatedEmail ? userEmail : (body.user_id || null);

    if (authenticatedEmail && userEmail !== authenticatedEmail) {
      return NextResponse.json({ error: "Email does not match authenticated user" }, { status: 403 });
    }

    // H1: Fast-path stock check (best-effort, not authoritative)
    // The authoritative atomic check is the DB trigger in migration 010
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, name, price, sale_price, image_url, stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (productError || !product) {
        return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 });
      }

      if (product.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }

      const unitPrice = product.sale_price || product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        size_ml: item.size_ml || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    // Apply discount
    let discountAmount = 0;
    if (discount_code) {
      const { data: discount } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discount_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (discount) {
        if (!discount.expires_at || new Date(discount.expires_at) > new Date()) {
          if (!discount.usage_limit || discount.used_count < discount.usage_limit) {
            if (subtotal >= (discount.min_order || 0)) {
              discountAmount = discount.type === "percentage"
                ? Math.round(subtotal * (discount.value / 100))
                : discount.value;
            }
          }
        }
      }
    }

    const shippingCost = subtotal >= 8000 ? 0 : 200;
    const total = Math.max(0, subtotal - discountAmount + shippingCost);
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        status: "processing",
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total,
        payment_method: payment_method || "cod",
        payment_status: "pending",
        shipping_first_name: shipping_address?.name?.split(' ')[0] || null,
        shipping_last_name: shipping_address?.name?.split(' ').slice(1).join(' ') || null,
        shipping_email: shipping_address?.email || null,
        shipping_address: shipping_address?.address || null,
        shipping_city: shipping_address?.city || null,
        shipping_phone: shipping_address?.phone || null,
        shipping_province: shipping_address?.province || null,
        shipping_postal_code: shipping_address?.postalCode || null,
        delivery_instructions: shipping_address?.instructions || null,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // H1: Create order items — trigger decrements stock atomically (migration 010)
    // If stock is insufficient, the trigger raises an exception and the insert fails
    const orderItems = validatedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    let itemsError;
    try {
      const result = await supabase.from("order_items").insert(orderItems);
      itemsError = result.error;
    } catch {
      itemsError = { message: "Stock validation failed" };
    }

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      if (itemsError.message?.includes?.("Insufficient stock") || itemsError.message === "Stock validation failed") {
        return NextResponse.json({ error: "Insufficient stock for one or more items. Please update your cart." }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // Update discount usage atomically
    if (discount_code && discountAmount > 0) {
      await supabase.rpc("increment_discount_usage", { code_text: discount_code.toUpperCase() });
    }

    // Send confirmation email
    if (shipping_address?.email) {
      await sendOrderConfirmation({
        email: shipping_address.email,
        orderNumber,
        items: validatedItems.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
        })),
        total,
      }).catch(() => {
        // Email failure shouldn't block order creation
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        total,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
