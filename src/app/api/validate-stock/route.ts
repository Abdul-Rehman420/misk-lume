import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    const results = [];
    for (const item of items) {
      const { data: product } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (!product) {
        results.push({ product_id: item.product_id, available: false, reason: "Product not found" });
      } else if (product.stock_quantity < item.quantity) {
        results.push({ product_id: item.product_id, available: false, reason: `Only ${product.stock_quantity} available`, available_stock: product.stock_quantity });
      } else {
        results.push({ product_id: item.product_id, available: true });
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Stock validation failed" }, { status: 500 });
  }
}
