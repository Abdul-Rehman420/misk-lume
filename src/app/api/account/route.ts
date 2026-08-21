import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = user.id;

    // Anonymize orders — keep order records but remove personal data
    await supabase
      .from("orders")
      .update({
        user_id: null,
        shipping_first_name: null,
        shipping_last_name: null,
        shipping_email: null,
        shipping_phone: null,
        shipping_address: null,
        shipping_city: null,
        shipping_province: null,
        shipping_postal_code: null,
        delivery_instructions: null,
      })
      .eq("user_id", userId);

    // Delete wishlist items
    await supabase.from("wishlist").delete().eq("user_id", userId);

    // Anonymize reviews — keep the review content but remove user link
    await supabase
      .from("reviews")
      .update({ user_id: null })
      .eq("user_id", userId);

    // Delete the profile (this also cascade-deletes via auth.users FK if we delete auth user)
    await supabase.from("profiles").delete().eq("id", userId);

    // Delete the auth user using admin client
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
