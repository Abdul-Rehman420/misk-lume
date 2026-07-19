import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmation } from "@/lib/email";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ML-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, items, shipping_address, payment_method, discount_code } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = await createClient();

    // Validate stock and calculate totals
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
        user_id: user_id || null,
        status: "processing",
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total,
        payment_method: payment_method || "cod",
        payment_status: "pending",
        shipping_name: shipping_address?.name || null,
        shipping_address: shipping_address?.address || null,
        shipping_city: shipping_address?.city || null,
        shipping_phone: shipping_address?.phone || null,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Create order items
    const orderItems = validatedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // Update discount usage
    if (discount_code && discountAmount > 0) {
      const { data: dc } = await supabase
        .from("discount_codes")
        .select("used_count")
        .eq("code", discount_code.toUpperCase())
        .single();

      if (dc) {
        await supabase
          .from("discount_codes")
          .update({ used_count: (dc.used_count || 0) + 1 })
          .eq("code", discount_code.toUpperCase());
      }
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
